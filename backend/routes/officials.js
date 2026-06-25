import express from "express";
import { supabase } from "../config/supabase.js";
import upload from "../middleware/upload.js";
import { uploadToR2 } from "../utils/uploadToR2.js";


const router = express.Router();

router.get("/", async (req, res) => {
  try {

    const { data, error } = await supabase
      .from("officials")
      .select(`
        *,
        residents (
          first_name,
          middle_name,
          last_name,
            pfp_url 
        )
      `);

    if (error) throw error;

    const officials = data.map((o) => ({
      ...o,
      first_name: o.residents?.first_name,
      middle_name: o.residents?.middle_name,
      last_name: o.residents?.last_name,
      pfp_url: o.residents?.pfp_url,
    }));

    res.json({
      success: true,
      officials,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post(
  "/",
  upload.fields([
    {
      name: "supporting_document",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {

      const {
        resident_id,
        position,
        category,
        start_date,
        end_date,
        barangay_id,
      } = req.body;

      const documentFile =
        req.files?.supporting_document?.[0];

      const supporting_document_url =
        documentFile
            ? await uploadToR2(
                documentFile,
                "officials/documents"
            )
            : null;

      const { data, error } = await supabase
        .from("officials")
        .insert([
          {
            resident_id,
            position,
            category,
            start_date: start_date || null,
            end_date: end_date || null,
            barangay_id,
            supporting_document_url,
          },
        ])
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(201).json({
        success: true,
        official: data,
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);

export default router;