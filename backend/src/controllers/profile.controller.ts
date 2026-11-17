import type { Request, Response } from "express";
import { Buyer } from "../models/Buyer";
import { Seller } from "../models/Seller";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { toPublicUser } from "../utils/publicUser";

function pick(input: Record<string, unknown>, keys: readonly string[]) {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (input[key] !== undefined) result[key] = input[key];
  }
  return result;
}

/** GET /api/buyers/me */
export const getBuyerProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await Buyer.findOne({ user: req.user?.id });
  sendResponse(res, 200, "Buyer profile retrieved.", { profile });
});

/** PUT /api/buyers/me */
export const upsertBuyerProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = pick(req.body, [
    "companyName",
    "contactName",
    "email",
    "phone",
    "industries",
    "geographies",
    "ebitdaMin",
    "ebitdaMax",
    "dealType",
    "notes",
  ]);

  const profile = await Buyer.findOneAndUpdate(
    { user: req.user?.id },
    { $set: data },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  sendResponse(res, 200, "Buyer profile saved.", { profile });
});

/** GET /api/sellers/me */
export const getSellerProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await Seller.findOne({ user: req.user?.id });
  sendResponse(res, 200, "Seller profile retrieved.", { profile });
});

/** PUT /api/sellers/me */
export const upsertSellerProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = pick(req.body, [
    "companyName",
    "industry",
    "location",
    "revenue",
    "ebitda",
    "yearFounded",
    "description",
    "contactName",
    "email",
    "phone",
  ]);

  const profile = await Seller.findOneAndUpdate(
    { user: req.user?.id },
    { $set: data },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  sendResponse(res, 200, "Business profile saved.", { profile });
});

/** PATCH /api/account/profile */
export const updateAccount = asyncHandler(async (req: Request, res: Response) => {
  const changes = pick(req.body, ["name", "company", "phone", "title"]);
  const user = await User.findById(req.user?.id);

  if (!user) throw new ApiError(404, "User not found.");

  Object.assign(user, changes);
  await user.save();

  sendResponse(res, 200, "Account details updated.", { user: toPublicUser(user) });
});

/** POST /api/account/password */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user?.id).select("+password");

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Your current password is incorrect.");
  }

  user.password = newPassword;
  await user.save();

  sendResponse(res, 200, "Password changed successfully.");
});
