export const USER_ROLES = ["admin", "advisor", "buyer", "seller"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PUBLIC_REGISTRATION_ROLES = ["buyer", "seller"] as const;
export type PublicRegistrationRole = (typeof PUBLIC_REGISTRATION_ROLES)[number];

export type UserStatus = "active" | "suspended";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  company?: string;
  phone?: string;
  title?: string;
  createdAt?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  advisor: "Advisor",
  buyer: "Buyer",
  seller: "Seller",
};

export const ROLE_HOME = {
  admin: "/dashboard/admin",
  advisor: "/dashboard/advisor",
  buyer: "/dashboard/buyer",
  seller: "/dashboard/seller",
} as const satisfies Record<UserRole, string>;
