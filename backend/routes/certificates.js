import express from "express";
import { supabase } from "../config/supabase.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const allowedStatuses = new Set(["draft", "issued"]);

function requireBarangayAccess(req, res) {
  if (!req.user?.barangayId) {
    res.status(403).json({ message: "A barangay account is required" });
    return false;
  }
  return true;
}

function toClientRecord(record) {
  return { ...record, id: record.certificate_id, residentId: record.resident_id, certificateType: record.certificate_type, certificateTitle: record.certificate_title, residentName: record.resident_name, issuedDate: record.issued_date, punongBarangay: record.punong_barangay, residentSnapshot: record.resident_snapshot, createdAt: record.created_at, updatedAt: record.updated_at };
}

function toDatabaseRecord(body, user) {
  const { certificateType, certificateTitle, residentId, residentName, status, purpose, issuedDate, form, punongBarangay, residentSnapshot } = body;
  if (!certificateType || !certificateTitle || !residentName || !residentSnapshot || !allowedStatuses.has(status)) return null;
  return { barangay_id: user.barangayId, resident_id: residentId || null, certificate_type: certificateType, certificate_title: certificateTitle, resident_name: residentName, status, purpose: purpose || null, issued_date: issuedDate || null, form: form || {}, punong_barangay: punongBarangay || null, resident_snapshot: residentSnapshot, created_by: user.userId, updated_at: new Date().toISOString() };
}

router.get("/", verifyToken, async (req, res) => {
  try {
    if (!requireBarangayAccess(req, res)) return;
    const { data, error } = await supabase.from("certificate_records").select("*").eq("barangay_id", req.user.barangayId).order("updated_at", { ascending: false });
    if (error) throw error;
    return res.json({ success: true, certificates: data.map(toClientRecord) });
  } catch (error) { return res.status(500).json({ message: `Unable to load certificate history: ${error.message}` }); }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    if (!requireBarangayAccess(req, res)) return;
    const { data, error } = await supabase.from("certificate_records").select("*").eq("certificate_id", req.params.id).eq("barangay_id", req.user.barangayId).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Certificate record not found" });
    return res.json({ success: true, certificate: toClientRecord(data) });
  } catch (error) { return res.status(500).json({ message: `Unable to load certificate: ${error.message}` }); }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    if (!requireBarangayAccess(req, res)) return;
    const record = toDatabaseRecord(req.body, req.user);
    if (!record) return res.status(400).json({ message: "Certificate details are incomplete or invalid" });
    const { data, error } = await supabase.from("certificate_records").insert(record).select("*").single();
    if (error) throw error;
    return res.status(201).json({ success: true, certificate: toClientRecord(data) });
  } catch (error) { return res.status(500).json({ message: `Unable to save certificate: ${error.message}` }); }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (!requireBarangayAccess(req, res)) return;
    const record = toDatabaseRecord(req.body, req.user);
    if (!record) return res.status(400).json({ message: "Certificate details are incomplete or invalid" });
    delete record.created_by;
    const { data, error } = await supabase.from("certificate_records").update(record).eq("certificate_id", req.params.id).eq("barangay_id", req.user.barangayId).select("*").maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Certificate record not found" });
    return res.json({ success: true, certificate: toClientRecord(data) });
  } catch (error) { return res.status(500).json({ message: `Unable to save certificate: ${error.message}` }); }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (!requireBarangayAccess(req, res)) return;
    const { data, error } = await supabase.from("certificate_records").delete().eq("certificate_id", req.params.id).eq("barangay_id", req.user.barangayId).select("certificate_id").maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Certificate record not found" });
    return res.json({ success: true });
  } catch (error) { return res.status(500).json({ message: `Unable to delete certificate: ${error.message}` }); }
});

export default router;
