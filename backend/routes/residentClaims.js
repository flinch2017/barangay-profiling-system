import express from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";
import upload from "../middleware/upload.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadToR2 } from "../utils/uploadToR2.js";

const router = express.Router();
const uploadFields = upload.fields([
  { name: "live_birth", maxCount: 1 },
  { name: "baptismal", maxCount: 1 },
]);

const normalize = (value) => String(value || "").trim().toLowerCase();

router.post("/matches", async (req, res) => {
  try {
    const { firstName, lastName, birthdate, barangay } = req.body;
    if (!firstName || !lastName || !birthdate) {
      return res.status(400).json({ message: "First name, last name, and birthdate are required" });
    }

    const { data, error } = await supabase
      .from("residents")
      .select("resident_id, first_name, middle_name, last_name, suffix, birthdate, barangay_id, barangays(barangay_name, municipality, province)");
    if (error) throw error;

    const matches = (data || [])
      .map((resident) => {
        let score = 0;
        if (normalize(resident.first_name) === normalize(firstName)) score += 3;
        if (normalize(resident.last_name) === normalize(lastName)) score += 3;
        if (resident.birthdate === birthdate) score += 4;
        if (barangay && normalize(resident.barangays?.barangay_name) === normalize(barangay)) score += 2;
        return { resident, score };
      })
      .filter(({ score }) => score >= 7)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ resident }) => ({
        residentId: resident.resident_id,
        name: [resident.first_name, resident.middle_name, resident.last_name, resident.suffix].filter(Boolean).join(" "),
        birthdate: resident.birthdate,
        barangay: resident.barangays?.barangay_name || "",
        municipality: resident.barangays?.municipality || "",
        province: resident.barangays?.province || "",
      }));

    return res.json({ matches });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to search resident profiles" });
  }
});

router.post("/", uploadFields, async (req, res) => {
  try {
    const { residentId, username, email, password, firstName, middleName, lastName, suffix, birthdate, province, municipality, barangay, street, purok } = req.body;
    if (!residentId || !username || !email || !password) return res.status(400).json({ message: "A profile selection and account details are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const { data: resident, error: residentError } = await supabase.from("residents").select("resident_id, barangay_id").eq("resident_id", residentId).single();
    if (residentError || !resident) return res.status(404).json({ message: "Selected resident profile was not found" });

    const { data: existingUser } = await supabase.from("users").select("user_id").or(`username.eq.${username.trim()},email.eq.${email.trim().toLowerCase()}`).maybeSingle();
    if (existingUser) return res.status(409).json({ message: "Username or email is already in use" });

    const { data: existingClaim } = await supabase.from("resident_claim_requests").select("claim_id").eq("resident_id", residentId).eq("status", "pending").maybeSingle();
    if (existingClaim) return res.status(409).json({ message: "A claim request for this profile is already pending" });

    const liveBirthFile = req.files?.live_birth?.[0];
    const baptismalFile = req.files?.baptismal?.[0];
    const passwordHash = await bcrypt.hash(password, 10);
    const { error } = await supabase.from("resident_claim_requests").insert({
      resident_id: residentId, barangay_id: resident.barangay_id, username: username.trim(), email: email.trim().toLowerCase(), password_hash: passwordHash,
      first_name: firstName, middle_name: middleName || null, last_name: lastName, suffix: suffix || null, birthdate, province, municipality, barangay, street, purok: purok || null,
      live_birth_url: liveBirthFile ? await uploadToR2(liveBirthFile) : null,
      baptismal_url: baptismalFile ? await uploadToR2(baptismalFile) : null,
    });
    if (error) throw error;
    return res.status(201).json({ message: "Your claim request has been sent to the barangay administrator" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to send claim request" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  if (req.user.role !== "barangay_admin") return res.status(403).json({ message: "Forbidden" });
  const { data, error } = await supabase.from("resident_claim_requests").select("*, residents(first_name, middle_name, last_name, birthdate)").eq("barangay_id", req.user.barangayId).order("created_at", { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  return res.json({ requests: data });
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "resident" || !req.user.residentId) {
      return res.status(403).json({ message: "Resident access required" });
    }

    const { data, error } = await supabase
      .from("residents")
      .select("*, barangays(barangay_name, municipality, province, country, zip_code)")
      .eq("resident_id", req.user.residentId)
      .single();
    if (error) throw error;

    return res.json({
      resident: {
        ...data,
        barangay_name: data.barangays?.barangay_name,
        municipality: data.barangays?.municipality,
        province: data.barangays?.province,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to load resident portal" });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "barangay_admin") return res.status(403).json({ message: "Forbidden" });
    const { decision } = req.body;
    if (!["approved", "rejected"].includes(decision)) return res.status(400).json({ message: "Invalid decision" });
    const { data: claim, error } = await supabase.from("resident_claim_requests").select("*").eq("claim_id", req.params.id).eq("barangay_id", req.user.barangayId).eq("status", "pending").single();
    if (error || !claim) return res.status(404).json({ message: "Pending claim request not found" });
    if (decision === "approved") {
      const { data: existingUser, error: existingUserError } = await supabase
        .from("users")
        .select("user_id, resident_id")
        .eq("username", claim.username)
        .maybeSingle();
      if (existingUserError) throw existingUserError;

      if (existingUser && existingUser.resident_id !== claim.resident_id) {
        return res.status(409).json({ message: "This username is already linked to another account" });
      }

      if (!existingUser) {
        const { error: userError } = await supabase.from("users").insert({ username: claim.username, email: claim.email, password_hash: claim.password_hash, role: "resident", barangay_id: claim.barangay_id, resident_id: claim.resident_id });
        if (userError) {
          return res.status(400).json({
            message: `Unable to create the resident login: ${userError.message}`,
          });
        }
      }
    }
    const { error: updateError } = await supabase.from("resident_claim_requests").update({ status: decision, reviewed_at: new Date().toISOString(), reviewed_by: req.user.userId }).eq("claim_id", claim.claim_id);
    if (updateError) {
      return res.status(400).json({
        message: `Unable to update the claim request: ${updateError.message}`,
      });
    }
    return res.json({ message: `Claim request ${decision}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `Unable to review claim request: ${error.message}`,
    });
  }
});

export default router;
