import { env } from "../config/env";
import { User } from "../models/User";

export type SeedAdminResult =
  | { created: true; email: string }
  | { created: false; email: string; reason: "exists" | "missing-password" };

/**
 * Creates the first administrator when SEED_ADMIN_PASSWORD is configured.
 * It is safe to call on every startup: an existing admin is never changed.
 */
export async function seedAdminUser(): Promise<SeedAdminResult> {
  const email = env.seedAdminEmail.toLowerCase();

  if (!env.seedAdminPassword) {
    return { created: false, email, reason: "missing-password" };
  }

  if (await User.exists({ email })) {
    return { created: false, email, reason: "exists" };
  }

  await User.create({
    name: env.seedAdminName,
    email,
    password: env.seedAdminPassword,
    role: "admin",
    status: "active",
    title: "Platform Administrator",
  });

  return { created: true, email };
}
