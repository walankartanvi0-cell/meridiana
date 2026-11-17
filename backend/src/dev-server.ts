import fs from "node:fs";
import path from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { env, validateEnv } from "./config/env";

/**
 * LOCAL DEVELOPMENT ONLY.
 * Starts a real MongoDB instance automatically so beginners do not need to
 * install MongoDB before they can run the project. Data is kept in
 * backend/.mongo-data so it survives restarts.
 *
 * For a real deployment, use npm start with a MONGO_URI pointing to MongoDB or Atlas.
 */
async function start(): Promise<void> {
  validateEnv();

  const dataPath = path.join(process.cwd(), ".mongo-data");
  fs.mkdirSync(dataPath, { recursive: true });

  const memoryServer = await MongoMemoryServer.create({
    instance: {
      dbName: "meridiana",
      dbPath: dataPath,
      storageEngine: "wiredTiger",
    },
  });

  const uri = memoryServer.getUri("meridiana");
  await connectDB(uri);

  const server = app.listen(env.port, () => {
    console.log("Using a local development MongoDB (no installation required).");
    console.log(`Meridiana API listening on http://localhost:${env.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await disconnectDB();
      await memoryServer.stop();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch((error: unknown) => {
  console.error("Failed to start the development server:", error);
  process.exit(1);
});
