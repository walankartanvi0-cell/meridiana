import type { Request, Response } from "express";
import { Types } from "mongoose";
import { Deal } from "../models/Deal";
import { Message, type IMessage } from "../models/Message";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  canAccessDeal,
  getAccessibleDeals,
  getContactableUsers,
  sameId,
} from "../utils/dealAccess";
import { notify } from "../utils/notify";
import { queryObjectId } from "../utils/queryObjectId";
import { sendResponse } from "../utils/sendResponse";

type Filter = Record<string, unknown>;

function routeId(value: unknown) {
  return typeof value === "string" ? value : "";
}

function findMessageById(id: string) {
  return Message.findById(id)
    .populate("deal", "title stage")
    .populate("sender", "name email role")
    .populate("recipients", "name email role");
}

function messageFilter(req: Request, dealId?: string): Filter {
  const filter: Filter = {};

  if (req.user?.role !== "admin") {
    filter.$or = [{ sender: req.user?.id }, { recipients: req.user?.id }];
  }
  if (dealId) filter.deal = dealId;

  return filter;
}

/** GET /api/messages */
export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  const dealId = queryObjectId(req.query.dealId, "deal");

  if (dealId && req.user?.role !== "admin") {
    const deal = await Deal.findById(dealId);
    if (!deal) throw new ApiError(404, "Deal not found.");
    if (!(await canAccessDeal(req, deal))) {
      throw new ApiError(403, "You do not have access to this deal.");
    }
  }

  const filter = messageFilter(req, dealId || undefined);
  const [messages, unread] = await Promise.all([
    Message.find(filter)
      .populate("deal", "title stage")
      .populate("sender", "name email role")
      .populate("recipients", "name email role")
      .sort({ createdAt: -1 }),
    req.user?.role === "admin"
      ? Promise.resolve(0)
      : Message.countDocuments({
          ...filter,
          recipients: req.user?.id,
          readBy: { $ne: new Types.ObjectId(req.user?.id ?? "") },
        }),
  ]);

  sendResponse(res, 200, "Messages retrieved.", { messages, unread });
});

/** GET /api/messages/contacts */
export const getMessageContacts = asyncHandler(async (req: Request, res: Response) => {
  const [users, deals] = await Promise.all([
    getContactableUsers(req),
    getAccessibleDeals(req),
  ]);

  sendResponse(res, 200, "Message contacts retrieved.", { users, deals });
});

/** POST /api/messages */
export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  const recipients = [
    ...new Set(
      (Array.isArray(req.body.recipients) ? req.body.recipients : [])
        .map((item: unknown) => String(item))
        .filter((id: string) => id && id !== req.user?.id),
    ),
  ] as string[];

  if (recipients.length === 0) {
    throw new ApiError(400, "Choose at least one recipient.");
  }

  if (req.user?.role === "buyer" || req.user?.role === "seller") {
    const contactable = await getContactableUsers(req);
    const allowed = new Set(contactable.map((user) => String(user._id)));
    if (recipients.some((id) => !allowed.has(id))) {
      throw new ApiError(403, "You can only message people connected to your deals.");
    }
  }

  const users = await User.find({
    _id: { $in: recipients },
    status: "active",
  }).select("_id");

  if (users.length !== recipients.length) {
    throw new ApiError(400, "One or more recipients could not be found.");
  }

  let dealId;
  if (req.body.deal) {
    const deal = await Deal.findById(req.body.deal);
    if (!deal) throw new ApiError(404, "Deal not found.");
    if (!(await canAccessDeal(req, deal))) {
      throw new ApiError(403, "You do not have access to this deal.");
    }
    dealId = deal._id;
  }

  const message = await Message.create({
    deal: dealId,
    sender: req.user?.id,
    recipients,
    subject: req.body.subject,
    body: req.body.body,
    readBy: [req.user?.id],
  });

  await Promise.all(
    recipients.map((id) =>
      notify({
        userId: id,
        title: "New message",
        message: `${req.user?.role === "advisor" ? "Your advisor" : "A portal contact"} sent you "${message.subject}".`,
        type: "message",
      }),
    ),
  );

  const populated = await findMessageById(message.id);
  sendResponse(res, 201, "Message sent.", { message: populated });
});

/** PATCH /api/messages/:id/read */
export const markMessageRead = asyncHandler(async (req: Request, res: Response) => {
  const message = await Message.findById(routeId(req.params.id));
  if (!message) throw new ApiError(404, "Message not found.");

  const allowed =
    req.user?.role === "admin" ||
    sameId(message.sender, req.user?.id) ||
    message.recipients.some((id) => sameId(id, req.user?.id));

  if (!allowed) throw new ApiError(403, "You do not have access to this message.");

  if (!message.readBy.some((id) => String(id) === req.user?.id)) {
    message.readBy.push(new Types.ObjectId(req.user?.id ?? ""));
    await message.save();
  }

  const populated = await findMessageById(message.id);
  sendResponse(res, 200, "Message marked as read.", { message: populated });
});

/** DELETE /api/messages/:id */
export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await Message.findById(routeId(req.params.id));
  if (!message) throw new ApiError(404, "Message not found.");

  if (req.user?.role !== "admin" && !sameId(message.sender, req.user?.id)) {
    throw new ApiError(403, "You do not have permission to delete this message.");
  }

  await message.deleteOne();
  sendResponse(res, 200, "Message deleted.");
});
