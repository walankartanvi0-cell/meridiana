/** The four account types supported by Meridiana. */
export const USER_ROLES = ["admin", "advisor", "buyer", "seller"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Only buyers and sellers may create their own account from the public site. */
export const PUBLIC_REGISTRATION_ROLES = ["buyer", "seller"] as const;
export type PublicRegistrationRole = (typeof PUBLIC_REGISTRATION_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  advisor: "Advisor",
  buyer: "Buyer",
  seller: "Seller",
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}
