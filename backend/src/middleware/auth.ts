import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../constants/roles";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyAccessToken } from "../utils/token";

/**
 * Blocks the request unless a valid Bearer token is supplied.
 * The verified user's id and role are attached to req.user.
 */
export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError(401, "Please sign in to continue.");
    }

    const token = authorization.slice(7).trim();
    if (!token) {
      throw new ApiError(401, "Please sign in to continue.");
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      throw new ApiError(401, "Your account no longer exists. Please sign in again.");
    }

    if (user.status !== "active") {
      throw new ApiError(403, "This account is not active. Please contact your administrator.");
    }

    req.user = { id: user.id, role: user.role };
    next();
  },
);

/** Allows only the listed roles. Always use after protect. */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, "Please sign in to continue."));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(403, "You do not have permission to perform this action."));
      return;
    }

    next();
  };
}
