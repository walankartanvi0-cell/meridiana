import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db";
import { env, validateEnv } from "../config/env";

/**
 * Run with: npm run db:check
 *
 * Confirms that the MONGO_URI in backend/.env really works and prints a short
 * summary of what the database contains. This is the quickest way to test an
 * Atlas connection before starting the API.
 */

/** Removes the password from a connection string so it is safe to print. */
function safeUri(uri: string): string {
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:/@]+:)[^@]*@/, "$1****@");
}

/** Turns common Atlas errors into plain-language advice. */
function explain(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (/bad auth|authentication failed/i.test(message)) {
    return "The database username or password is wrong. Check the user in Atlas Database Access.";
  }
  if (/ENOTFOUND|querySrv|getaddrinfo/i.test(message)) {
    return "The host name could not be found. Copy the connection string from Atlas again.";
  }
  if (/timed out|ETIMEDOUT|Server selection/i.test(message)) {
    return "The server could not be reached. In Atlas Network Access, allow your current IP address (or 0.0.0.0/0 for testing).";
  }
  if (/mongodb:\/\//i.test(message) && /expected/i.test(message)) {
    return "MONGO_URI is not a valid MongoDB connection string.";
  }
  return message;
}

async function run(): Promise<void> {
  validateEnv();

  console.log(`Connecting to: ${safeUri(env.mongoUri)}`);

  try {
    await connectDB(env.mongoUri);
  } catch (error) {
    console.error("\nDatabase connection FAILED.");
    console.error(`Reason: ${explain(error)}`);
    console.error("\nNothing else is broken - only the connection string or network access needs fixing.");
    process.exitCode = 1;
    return;
  }

  const db = mongoose.connection.db;
  if (!db) {
    console.error("Connected, but no database handle was returned.");
    process.exitCode = 1;
    return;
  }

  console.log("\nConnection OK.");
  console.log(`Database name: ${db.databaseName}`);
  console.log(`Host: ${mongoose.connection.host}`);

  const collections = await db.listCollections().toArray();
  const names = collections.map((item) => item.name).filter((name) => !name.startsWith("system."));

  if (names.length === 0) {
    console.log("\nThe database is empty. That is normal for a new Atlas cluster.");
    console.log("Next step: npm run seed:admin");
  } else {
    console.log(`\nCollections (${names.length}):`);
    for (const name of names.sort()) {
      const count = await db.collection(name).countDocuments();
      console.log(`  - ${name}: ${count} document${count === 1 ? "" : "s"}`);
    }
  }

  await disconnectDB();
}

run().catch(async (error: unknown) => {
  console.error("Unexpected error while checking the database:", error);
  await disconnectDB().catch(() => undefined);
  process.exitCode = 1;
});
