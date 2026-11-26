import dotenv from "dotenv";

// Loads the .env file into process.env. This file is never committed.
dotenv.config();

function numberValue(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: numberValue(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/meridiana",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  maxFileSizeMb: numberValue(process.env.MAX_FILE_SIZE_MB, 10),
  seedAdminName: process.env.SEED_ADMIN_NAME ?? "Meridiana Administrator",
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL ?? "admin@meridiana.local",
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD ?? "",
};

export function validateEnv(): void {
  if (!env.jwtSecret || env.jwtSecret === "replace-me-with-a-long-random-secret") {
    throw new Error("JWT_SECRET must be set to a long random value in backend/.env.");
  }

  if (env.nodeEnv === "production") {
    if (!/^https:\/\//.test(env.clientUrl)) {
      throw new Error("CLIENT_URL must be the public https:// frontend URL in production.");
    }
    if (/^mongodb:\/\/(localhost|127\.0\.0\.1)/i.test(env.mongoUri)) {
      throw new Error("MONGO_URI must point to a hosted MongoDB in production.");
    }
  }
}
