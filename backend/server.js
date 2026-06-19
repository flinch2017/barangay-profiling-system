import dotenv from "dotenv";
dotenv.config();

import "./config/env.js"; // 👈 MUST BE FIRST



import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import residentsRoutes from "./routes/residents.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/residents", residentsRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});