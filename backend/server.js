import dotenv from "dotenv";
dotenv.config();

import "./config/env.js";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import residentsRoutes from "./routes/residents.js";
import officialsRoutes from "./routes/officials.js";

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN
      .split(",")
      .map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Barangay Profiling System API is running.",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/residents", residentsRoutes);
app.use("/api/officials", officialsRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});