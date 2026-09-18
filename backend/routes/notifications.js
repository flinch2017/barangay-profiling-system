import express from "express";
import { supabase } from "../config/supabase.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from("notifications").select("*").eq("recipient_user_id", req.user.userId).order("created_at", { ascending: false });
    if (error) throw error;
    return res.json({ notifications: data || [] });
  } catch (error) { return res.status(500).json({ message: `Unable to load notifications: ${error.message}` }); }
});

router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("notification_id", req.params.id).eq("recipient_user_id", req.user.userId);
    if (error) throw error;
    return res.json({ success: true });
  } catch (error) { return res.status(500).json({ message: "Unable to update notification" }); }
});

router.patch("/read-all", verifyToken, async (req, res) => {
  try {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("recipient_user_id", req.user.userId).eq("is_read", false);
    if (error) throw error;
    return res.json({ success: true });
  } catch (error) { return res.status(500).json({ message: "Unable to update notifications" }); }
});

export default router;
