import { connectDB, disconnectDB } from "../config/db";
import { env, validateEnv } from "../config/env";
import { seedAdminUser } from "../utils/seedAdmin";

/** Run with npm run seed:admin to create the first admin in a real database. */
async function run(): Promise<void> {
  validateEnv();

  if (!env.seedAdminPassword) {
    throw new Error("SEED_ADMIN_PASSWORD must be set in backend/.env before seeding an admin.");
  }

  await connectDB(env.mongoUri);
  const result = await seedAdminUser();

  if (result.created) {
    console.log(`Administrator created: ${result.email}`);
  } else if (result.reason === "exists") {
    console.log(`Administrator already exists: ${result.email}`);
  }

  await disconnectDB();
}

run().catch((error: unknown) => {
  console.error("Failed to seed the administrator:", error);
  process.exit(1);
});
