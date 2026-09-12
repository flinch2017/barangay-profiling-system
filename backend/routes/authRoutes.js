import express from "express";
import {
  login,
  signupBarangayAdmin,
  updateAccountProfile
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post(
  "/signup/barangay-admin",
  signupBarangayAdmin
);
router.put("/profile", ...updateAccountProfile);

export default router;
