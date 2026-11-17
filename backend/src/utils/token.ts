import jwt, { type SignOptions } from "jsonwebtoken";
import { isUserRole, type UserRole } from "../constants/roles";
import { env } from "../config/env";
import { ApiError } from "./ApiError";

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}

/** Creates the JWT sent back after registration or login. */
export function createAccessToken(user: {
  _id: { toString(): string };
  role: UserRole;
}): string {
  return jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: user._id.toString(),
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
}

/** Checks the JWT and returns the safe information stored inside it. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (typeof decoded === "string" || !decoded.sub || !isUserRole(decoded.role)) {
    throw new ApiError(401, "Invalid authentication token.");
  }

  return { userId: decoded.sub, role: decoded.role };
}
