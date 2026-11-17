import app from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { env, validateEnv } from "./config/env";

/** Production / real-database entry point. Uses MONGO_URI from .env. */
async function start(): Promise<void> {
  validateEnv();
  await connectDB(env.mongoUri);

  const server = app.listen(env.port, () => {
    console.log(`Meridiana API listening on http://localhost:${env.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch((error: unknown) => {
  console.error("Failed to start the server:", error);
  process.exit(1);
});
