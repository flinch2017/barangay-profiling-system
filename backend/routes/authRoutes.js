import express from "express";
import {
  login,
  signupBarangayAdmin
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post(
  "/signup/barangay-admin",
  signupBarangayAdmin
);

export default router;
