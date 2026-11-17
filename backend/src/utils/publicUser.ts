import type { IUser } from "../models/User";

/** Converts a User document into the safe shape returned by the API. */
export function toPublicUser(user: IUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    company: user.company,
    phone: user.phone,
    title: user.title,
    createdAt: user.createdAt,
  };
}
