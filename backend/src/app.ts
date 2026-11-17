import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { consultationRouter, contactRouter } from "./routes/inquiry.routes";

const app = express();

// Security headers and cross-origin access for the separate Next.js frontend.
app.use(helmet());
app.use(
  cors({
    origin: [env.clientUrl, "http://localhost:3000"],
    credentials: true,
  }),
);

// Parse JSON and form data sent by the website.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Simple health check – useful for confirming the API and database are running.
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Meridiana API is running.",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: Math.round(process.uptime()),
  });
});

// API routes. More routers will be added here in later stages.
app.use("/api/contact", contactRouter);
app.use("/api/consultations", consultationRouter);

// Unknown routes and error handling must be last.
app.use(notFound);
app.use(errorHandler);

export default app;
