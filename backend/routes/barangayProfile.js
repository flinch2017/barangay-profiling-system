import express from "express";
import { supabase } from "../config/supabase.js";
import upload from "../middleware/upload.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadToR2 } from "../utils/uploadToR2.js";

const router = express.Router();

router.get("/profile", verifyToken, async (req, res) => {
  try {
    if (!req.user.barangayId) return res.json({ profile: null });
    const { data, error } = await supabase
      .from("barangays")
      .select("barangay_id, barangay_name, logo_url")
      .eq("barangay_id", req.user.barangayId)
      .single();
    if (error) throw error;
    return res.json({ profile: data });
  } catch (error) {
    return res.status(500).json({ message: `Unable to load barangay profile: ${error.message}` });
  }
});

router.put("/profile", verifyToken, upload.single("logo"), async (req, res) => {
  try {
    if (req.user.role !== "barangay_admin") return res.status(403).json({ message: "Barangay administrator access required" });
    if (!req.user.barangayId) return res.status(400).json({ message: "No barangay is associated with this account" });
    const update = {};
    if (req.file) update.logo_url = await uploadToR2(req.file, "barangays/logos");
    if (req.body.removeLogo === "true") update.logo_url = null;
    if (!Object.keys(update).length) return res.status(400).json({ message: "Choose a logo to save" });
    const { data, error } = await supabase.from("barangays").update(update).eq("barangay_id", req.user.barangayId).select("barangay_id, barangay_name, logo_url").single();
    if (error) throw error;
    return res.json({ success: true, profile: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: `Unable to save barangay logo: ${error.message}` });
  }
});

export default router;
