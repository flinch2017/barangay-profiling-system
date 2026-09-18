import { supabase } from "../config/supabase.js";

export async function createNotification({ recipientUserId, type, title, message, link = null }) {
  if (!recipientUserId) return;
  const { error } = await supabase.from("notifications").insert({ recipient_user_id: recipientUserId, type, title, message, link });
  if (error) console.error("Unable to create notification:", error.message);
}
