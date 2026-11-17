import type { Request, Response } from "express";
import { Notification } from "../models/Notification";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/sendResponse";

/** GET /api/notifications */
export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const [notifications, unread] = await Promise.all([
    Notification.find({ user: req.user?.id }).sort({ createdAt: -1 }),
    Notification.countDocuments({ user: req.user?.id, read: false }),
  ]);

  sendResponse(res, 200, "Notifications retrieved.", { notifications, unread });
});

/** PATCH /api/notifications/:id/read */
export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user?.id,
  });

  if (!notification) throw new ApiError(404, "Notification not found.");

  notification.read = true;
  await notification.save();

  sendResponse(res, 200, "Notification marked as read.", { notification });
});

/** PATCH /api/notifications/read-all */
export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ user: req.user?.id, read: false }, { $set: { read: true } });
  sendResponse(res, 200, "All notifications marked as read.");
});
