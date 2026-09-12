import express from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";
import upload from "../middleware/upload.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadToR2 } from "../utils/uploadToR2.js";
import { createAuthResponse } from "../controllers/authController.js";

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

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Username, email, and password are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return res.status(400).json({ message: "Enter a valid email address" });
    const { data: duplicate, error: duplicateError } = await supabase.from("users").select("user_id").or(`username.eq.${username.trim()},email.eq.${normalizedEmail}`).maybeSingle();
    if (duplicateError) throw duplicateError;
    if (duplicate) return res.status(409).json({ message: "Username or email is already in use" });
    const { data: user, error } = await supabase.from("users").insert({ username: username.trim(), email: normalizedEmail, password_hash: await bcrypt.hash(password, 10), role: "resident" }).select("*").single();
    if (error) throw error;
    return res.status(201).json({ success: true, ...createAuthResponse(user) });
  } catch (error) { console.error(error); return res.status(500).json({ message: `Unable to create resident account: ${error.message}` }); }
});

router.post("/", verifyToken, uploadFields, async (req, res) => {
  try {
    const { residentId, firstName, middleName, lastName, suffix, birthdate, province, municipality, barangay, street, purok } = req.body;
    if (req.user.role !== "resident") return res.status(403).json({ message: "Resident access required" });
    if (req.user.residentId) return res.status(409).json({ message: "Your account is already linked to a resident profile" });
    if (!residentId) return res.status(400).json({ message: "Select a resident profile to claim" });

    const { data: resident, error: residentError } = await supabase.from("residents").select("resident_id, barangay_id").eq("resident_id", residentId).single();
    if (residentError || !resident) return res.status(404).json({ message: "Selected resident profile was not found" });

    const { data: account, error: accountError } = await supabase.from("users").select("username, email, password_hash").eq("user_id", req.user.userId).single();
    if (accountError || !account) return res.status(401).json({ message: "Resident account not found" });
    const { data: existingClaim } = await supabase.from("resident_claim_requests").select("claim_id").eq("claimant_user_id", req.user.userId).eq("status", "pending").maybeSingle();
    if (existingClaim) return res.status(409).json({ message: "A claim request for this profile is already pending" });

    const liveBirthFile = req.files?.live_birth?.[0];
    const baptismalFile = req.files?.baptismal?.[0];
    const { error } = await supabase.from("resident_claim_requests").insert({
      resident_id: residentId, claimant_user_id: req.user.userId, barangay_id: resident.barangay_id, username: account.username, email: account.email, password_hash: account.password_hash,
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
    if (req.user.role !== "resident") {
      return res.status(403).json({ message: "Resident access required" });
    }

    const { data: latestClaim } = await supabase.from("resident_claim_requests").select("claim_id, status, created_at, reviewed_at").eq("claimant_user_id", req.user.userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    const { data: account, error: accountError } = await supabase.from("users").select("resident_id").eq("user_id", req.user.userId).single();
    if (accountError) throw accountError;
    if (!account.resident_id) return res.json({ resident: null, latestClaim });

    const { data, error } = await supabase
      .from("residents")
      .select("*, barangays(barangay_name, municipality, province, country, zip_code)")
      .eq("resident_id", account.resident_id)
      .single();
    if (error) throw error;

    return res.json({ latestClaim,
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

const editableResidentFields = ["first_name", "middle_name", "last_name", "suffix", "contact_number", "email", "birthdate", "gender", "civil_status", "street", "purok", "occupation", "salary", "educational_level", "school_name", "year_level", "course", "currently_enrolled", "graduation_year", "fourps_beneficiary", "senior_citizen", "voter"];

router.post("/profile-updates", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "resident") return res.status(403).json({ message: "Resident access required" });
    const { data: account, error: accountError } = await supabase.from("users").select("resident_id").eq("user_id", req.user.userId).single();
    if (accountError || !account?.resident_id) return res.status(403).json({ message: "Claim a resident profile before requesting updates" });
    const changes = Object.fromEntries(editableResidentFields.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]]));
    if (!Object.keys(changes).length) return res.status(400).json({ message: "No profile changes were submitted" });
    const { data: existing } = await supabase.from("resident_profile_update_requests").select("request_id").eq("resident_id", account.resident_id).eq("status", "pending").maybeSingle();
    if (existing) return res.status(409).json({ message: "You already have a pending profile update request" });
    const { error } = await supabase.from("resident_profile_update_requests").insert({ resident_id: account.resident_id, requester_user_id: req.user.userId, changes });
    if (error) throw error;
    return res.status(201).json({ message: "Your profile update request has been sent for barangay approval" });
  } catch (error) { console.error(error); return res.status(500).json({ message: `Unable to request profile update: ${error.message}` }); }
});

router.get("/profile-updates", verifyToken, async (req, res) => {
  if (req.user.role !== "barangay_admin") return res.status(403).json({ message: "Forbidden" });
  const { data, error } = await supabase.from("resident_profile_update_requests").select("*, residents(first_name, middle_name, last_name, barangay_id)").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  const requests = data.filter((request) => request.residents?.barangay_id === req.user.barangayId);
  return res.json({ requests });
});

router.patch("/profile-updates/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "barangay_admin") return res.status(403).json({ message: "Forbidden" });
    const { decision } = req.body;
    if (!["approved", "rejected"].includes(decision)) return res.status(400).json({ message: "Invalid decision" });
    const { data: request, error } = await supabase.from("resident_profile_update_requests").select("*, residents(barangay_id)").eq("request_id", req.params.id).eq("status", "pending").single();
    if (error || request?.residents?.barangay_id !== req.user.barangayId) return res.status(404).json({ message: "Pending update request not found" });
    if (decision === "approved") {
      const update = Object.fromEntries(editableResidentFields.filter((field) => Object.hasOwn(request.changes || {}, field)).map((field) => [field, request.changes[field]]));
      const { error: updateError } = await supabase.from("residents").update(update).eq("resident_id", request.resident_id);
      if (updateError) throw updateError;
    }
    const { error: statusError } = await supabase.from("resident_profile_update_requests").update({ status: decision, reviewed_at: new Date().toISOString(), reviewed_by: req.user.userId }).eq("request_id", request.request_id);
    if (statusError) throw statusError;
    return res.json({ message: `Profile update request ${decision}` });
  } catch (error) { console.error(error); return res.status(500).json({ message: `Unable to review profile update: ${error.message}` }); }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "barangay_admin") return res.status(403).json({ message: "Forbidden" });
    const { decision } = req.body;
    if (!["approved", "rejected"].includes(decision)) return res.status(400).json({ message: "Invalid decision" });
    const { data: claim, error } = await supabase.from("resident_claim_requests").select("*").eq("claim_id", req.params.id).eq("barangay_id", req.user.barangayId).eq("status", "pending").single();
    if (error || !claim) return res.status(404).json({ message: "Pending claim request not found" });
    if (decision === "approved") {
      if (claim.claimant_user_id) {
        const { data: linkedUser, error: linkError } = await supabase.from("users").update({ resident_id: claim.resident_id }).eq("user_id", claim.claimant_user_id).eq("role", "resident").select("user_id").maybeSingle();
        if (linkError) return res.status(400).json({ message: `Unable to link resident account: ${linkError.message}` });
        if (!linkedUser) return res.status(404).json({ message: "Resident account for this request was not found" });
      } else {
        const { data: existingUser, error: existingUserError } = await supabase.from("users").select("user_id, resident_id").eq("username", claim.username).maybeSingle();
        if (existingUserError) throw existingUserError;
        if (existingUser && existingUser.resident_id !== claim.resident_id) return res.status(409).json({ message: "This username is already linked to another account" });
        if (!existingUser) {
        const { error: userError } = await supabase.from("users").insert({ username: claim.username, email: claim.email, password_hash: claim.password_hash, role: "resident", barangay_id: claim.barangay_id, resident_id: claim.resident_id });
        if (userError) {
          return res.status(400).json({
            message: `Unable to create the resident login: ${userError.message}`,
          });
        }
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

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "barangay_admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { data: claim, error: findError } = await supabase
      .from("resident_claim_requests")
      .select("claim_id")
      .eq("claim_id", req.params.id)
      .eq("barangay_id", req.user.barangayId)
      .maybeSingle();

    if (findError) throw findError;
    if (!claim) {
      return res.status(404).json({ message: "Claim request not found" });
    }

    const { error: deleteError } = await supabase
      .from("resident_claim_requests")
      .delete()
      .eq("claim_id", claim.claim_id);

    if (deleteError) throw deleteError;
    return res.json({ message: "Claim request deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `Unable to delete claim request: ${error.message}`,
    });
  }
});

export default router;
