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
};

export function validateEnv(): void {
  if (env.nodeEnv === "production" && !env.jwtSecret) {
    throw new Error("JWT_SECRET must be set in production. Check your .env file.");
  }
}
