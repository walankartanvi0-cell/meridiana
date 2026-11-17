import fs from "fs";
import path from "path";
import type { Request, Response } from "express";
import { UPLOAD_DIR } from "../config/upload";
import { USER_ROLES } from "../constants/roles";
import { Buyer } from "../models/Buyer";
import { Deal } from "../models/Deal";
import { DocumentFile } from "../models/Document";
import { Inquiry } from "../models/Inquiry";
import { Meeting } from "../models/Meeting";
import { Message } from "../models/Message";
import { Nda } from "../models/NDA";
import { Notification } from "../models/Notification";
import { Seller } from "../models/Seller";
import { Task } from "../models/Task";
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

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** GET /api/admin/users */
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  const role = typeof req.query.role === "string" ? req.query.role : "";
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  if ((USER_ROLES as readonly string[]).includes(role)) filter.role = role;
  if (status === "active" || status === "suspended") filter.status = status;
  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [
      { name: { $regex: safe, $options: "i" } },
      { email: { $regex: safe, $options: "i" } },
      { company: { $regex: safe, $options: "i" } },
    ];
  }

  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
  sendResponse(res, 200, "Users retrieved.", { users: users.map(toPublicUser) });
});

/** PATCH /api/admin/users/:id */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const changes = pick(req.body, ["name", "email", "role", "status", "company", "phone", "title"]);
  const user = await User.findById(req.params.id);

  if (!user) throw new ApiError(404, "User not found.");

  const changingRole = changes.role !== undefined && changes.role !== user.role;
  const changingStatus = changes.status !== undefined && changes.status !== user.status;

  if (req.user?.id === user.id && (changingRole || changingStatus)) {
    throw new ApiError(400, "You cannot change your own role or status.");
  }

  if (user.role === "admin" && (changingRole || changingStatus)) {
    const adminCount = await User.countDocuments({ role: "admin", status: "active" });
    const willRemainAdmin =
      (!changingRole || changes.role === "admin") &&
      (!changingStatus || changes.status === "active");

    if (adminCount <= 1 && !willRemainAdmin) {
      throw new ApiError(400, "At least one active administrator must remain.");
    }
  }

  Object.assign(user, changes);
  await user.save();

  sendResponse(res, 200, "User updated successfully.", { user: toPublicUser(user) });
});

/** DELETE /api/admin/users/:id */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.id === req.params.id) {
    throw new ApiError(400, "You cannot delete your own account.");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");

  if (user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin", status: "active" });
    if (adminCount <= 1) {
      throw new ApiError(400, "At least one active administrator must remain.");
    }
  }

  const [buyer, seller] = await Promise.all([
    Buyer.findOne({ user: user._id }).select("_id"),
    Seller.findOne({ user: user._id }).select("_id"),
  ]);

  // A person attached to a deal must be reassigned first. Deleting them would
  // leave the deal pointing at a profile that no longer exists.
  const linkedDeal = await Deal.exists({
    $or: [
      { advisor: user._id },
      ...(buyer ? [{ buyer: buyer._id }] : []),
      ...(seller ? [{ seller: seller._id }] : []),
    ],
  });
  if (linkedDeal) {
    throw new ApiError(
      400,
      "Reassign this person's deals before deleting the account.",
    );
  }

  const documents = await DocumentFile.find({ uploadedBy: user._id }).select(
    "_id storedName",
  );
  const documentIds = documents.map((document) => document._id);

  await Promise.all([
    Nda.deleteMany({
      $or: [
        { requestedBy: user._id },
        ...(buyer ? [{ buyer: buyer._id }] : []),
      ],
    }),
    documentIds.length
      ? Nda.updateMany({ document: { $in: documentIds } }, { $unset: { document: 1 } })
      : Promise.resolve(),
    DocumentFile.deleteMany({ uploadedBy: user._id }),
    Task.deleteMany({ $or: [{ assignedTo: user._id }, { createdBy: user._id }] }),
    Meeting.deleteMany({ organizer: user._id }),
    Meeting.updateMany({ attendees: user._id }, { $pull: { attendees: user._id } }),
    Message.deleteMany({ sender: user._id }),
    Message.updateMany({ recipients: user._id }, { $pull: { recipients: user._id } }),
    Message.updateMany({ readBy: user._id }, { $pull: { readBy: user._id } }),
    Deal.updateMany({ savedBy: user._id }, { $pull: { savedBy: user._id } }),
    Notification.deleteMany({ user: user._id }),
    Buyer.deleteOne({ user: user._id }),
    Seller.deleteOne({ user: user._id }),
    User.deleteOne({ _id: user._id }),
  ]);

  await Promise.all(
    documents.map((document) =>
      fs.promises
        .unlink(path.join(UPLOAD_DIR, path.basename(document.storedName)))
        .catch(() => undefined),
    ),
  );

  sendResponse(res, 200, "User deleted successfully.");
});

/** GET /api/admin/buyers */
export const listBuyers = asyncHandler(async (_req: Request, res: Response) => {
  const buyers = await Buyer.find()
    .populate("user", "name email role status")
    .sort({ createdAt: -1 });
  sendResponse(res, 200, "Buyers retrieved.", { buyers });
});

/** POST /api/admin/buyers */
export const createBuyer = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.body.user);

  if (!user || user.role !== "buyer") {
    throw new ApiError(400, "Select an existing user with the Buyer role.");
  }

  const data = pick(req.body, [
    "user",
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
    "status",
  ]);

  const buyer = await Buyer.create(data);
  sendResponse(res, 201, "Buyer profile created.", { buyer });
});

/** PATCH /api/admin/buyers/:id */
export const updateBuyer = asyncHandler(async (req: Request, res: Response) => {
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
    "status",
  ]);

  const buyer = await Buyer.findByIdAndUpdate(req.params.id, { $set: data }, {
    new: true,
    runValidators: true,
  });

  if (!buyer) throw new ApiError(404, "Buyer profile not found.");
  sendResponse(res, 200, "Buyer profile updated.", { buyer });
});

/** DELETE /api/admin/buyers/:id */
export const deleteBuyer = asyncHandler(async (req: Request, res: Response) => {
  const buyer = await Buyer.findById(req.params.id);
  if (!buyer) throw new ApiError(404, "Buyer profile not found.");

  // Deals store a reference to this profile, so deleting it would leave the
  // deal pointing at nothing. Ask the administrator to reassign it first.
  if (await Deal.exists({ buyer: buyer._id })) {
    throw new ApiError(
      400,
      "Remove this buyer from their deals before deleting the profile.",
    );
  }

  await Nda.deleteMany({ buyer: buyer._id });
  await buyer.deleteOne();
  sendResponse(res, 200, "Buyer profile deleted.");
});

/** GET /api/admin/sellers */
export const listSellers = asyncHandler(async (_req: Request, res: Response) => {
  const sellers = await Seller.find()
    .populate("user", "name email role status")
    .sort({ createdAt: -1 });
  sendResponse(res, 200, "Sellers retrieved.", { sellers });
});

/** POST /api/admin/sellers */
export const createSeller = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.body.user);

  if (!user || user.role !== "seller") {
    throw new ApiError(400, "Select an existing user with the Seller role.");
  }

  const data = pick(req.body, [
    "user",
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
    "status",
  ]);

  const seller = await Seller.create(data);
  sendResponse(res, 201, "Seller profile created.", { seller });
});

/** PATCH /api/admin/sellers/:id */
export const updateSeller = asyncHandler(async (req: Request, res: Response) => {
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
    "status",
  ]);

  const seller = await Seller.findByIdAndUpdate(req.params.id, { $set: data }, {
    new: true,
    runValidators: true,
  });

  if (!seller) throw new ApiError(404, "Seller profile not found.");
  sendResponse(res, 200, "Seller profile updated.", { seller });
});

/** DELETE /api/admin/sellers/:id */
export const deleteSeller = asyncHandler(async (req: Request, res: Response) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) throw new ApiError(404, "Seller profile not found.");

  if (await Deal.exists({ seller: seller._id })) {
    throw new ApiError(
      400,
      "Remove this seller from their deals before deleting the profile.",
    );
  }

  await seller.deleteOne();
  sendResponse(res, 200, "Seller profile deleted.");
});

/** GET /api/admin/analytics */
export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const [totalUsers, adminCount, advisorCount, buyerCount, sellerCount, buyerProfiles, sellerProfiles, inquiries, unread] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "advisor" }),
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "seller" }),
      Buyer.countDocuments(),
      Seller.countDocuments(),
      Inquiry.countDocuments(),
      Notification.countDocuments({ user: req.user?.id, read: false }),
    ]);

  sendResponse(res, 200, "Analytics retrieved.", {
    analytics: {
      totalUsers,
      byRole: {
        admin: adminCount,
        advisor: advisorCount,
        buyer: buyerCount,
        seller: sellerCount,
      },
      buyerProfiles,
      sellerProfiles,
      inquiries,
      unreadNotifications: unread,
    },
  });
});
