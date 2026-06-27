import express from "express";
import { supabase } from "../config/supabase.js";
import upload from "../middleware/upload.js";
import { uploadToR2 } from "../utils/uploadToR2.js";


const router = express.Router();

router.post(
  "/",
  upload.fields([
    { name: "pfp", maxCount: 1 },
    { name: "live_birth", maxCount: 1 },
    { name: "baptismal", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const body = req.body;

      const pfpFile = req.files?.pfp?.[0];
      const birthFile = req.files?.live_birth?.[0];
      const baptismFile = req.files?.baptismal?.[0];

      const pfp_url = pfpFile ? await uploadToR2(pfpFile) : null;
      const live_birth_url = birthFile ? await uploadToR2(birthFile) : null;
      const baptismal_url = baptismFile ? await uploadToR2(baptismFile) : null;

      const { data, error } = await supabase
        .from("residents")
        .insert([
          {
            ...body,
            pfp_url,
            live_birth_url,
            baptismal_url,
          },
        ]);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(201).json({
        success: true,
        resident: data,
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("residents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      residents: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("residents")
      .select(`
        *,
        barangays (
          barangay_name,
          municipality,
          province,
          country,
          zip_code
        )
      `)
      .eq("resident_id", id)
      .single();

    if (error) throw error;

    // ADD THIS HERE
    const resident = {
      ...data,
      barangay_name:
        data.barangays?.barangay_name,

      municipality:
        data.barangays?.municipality,

      province:
        data.barangays?.province,
      
      country:
        data.barangays?.country,

      zip_code:
        data.barangays?.zip_code,
    };

    // CHANGE THIS
    res.json({
      success: true,
      resident,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("residents")
      .delete()
      .eq("resident_id", id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      message: "Resident deleted successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;