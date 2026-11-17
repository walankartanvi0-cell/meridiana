import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { toPublicUser } from "../utils/publicUser";
import { createAccessToken } from "../utils/token";
import { sendResponse } from "../utils/sendResponse";
import { notify } from "../utils/notify";
import { User } from "../models/User";

/** POST /api/auth/register – public buyer/seller registration. */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, company, phone } = req.body;

  if (await User.exists({ email })) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({ name, email, password, role, company, phone });
  await notify({
    userId: user.id,
    title: "Welcome to Meridiana",
    message: "Your account is ready. Complete your profile to get the most from your workspace.",
    type: "account",
  });
  const token = createAccessToken(user);

  sendResponse(res, 201, "Your account has been created.", {
    token,
    user: toPublicUser(user),
  });
});

/** POST /api/auth/login – verify credentials and issue a JWT. */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Select the password explicitly because it is hidden by default.
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "This account is not active. Please contact your administrator.");
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = createAccessToken(user);

  sendResponse(res, 200, "Signed in successfully.", {
    token,
    user: toPublicUser(user),
  });
});

/** GET /api/auth/me – return the signed-in user's safe profile. */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id).select("-password");

  if (!user) {
    throw new ApiError(401, "Your account no longer exists. Please sign in again.");
  }

  sendResponse(res, 200, "Account details retrieved.", {
    user: toPublicUser(user),
  });
});

/**
 * POST /api/auth/logout – JWTs are stateless, so the server confirms the
 * sign-out and the browser removes its stored token.
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  sendResponse(res, 200, "You have been signed out.");
});

/** POST /api/auth/users – admin-only creation of staff and client accounts. */
export const adminCreateUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, company, phone, status } = req.body;

  if (await User.exists({ email })) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    company,
    phone,
    status: status ?? "active",
  });
  await notify({
    userId: user.id,
    title: "Your Meridiana account is ready",
    message: "An administrator has created your account. Sign in to review your workspace.",
    type: "account",
  });

  sendResponse(res, 201, "User created successfully.", {
    user: toPublicUser(user),
  });
});
