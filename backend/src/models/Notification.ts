import { Schema, model, type Document, type Model, type Types } from "mongoose";

export type NotificationType =
  | "system"
  | "account"
  | "deal"
  | "document"
  | "nda"
  | "meeting"
  | "task"
  | "message";

export interface INotification extends Document {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

type NotificationModel = Model<INotification>;

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        "system",
        "account",
        "deal",
        "document",
        "nda",
        "meeting",
        "task",
        "message",
      ],
      default: "system",
    },
    read: { type: Boolean, default: false },
    link: { type: String, trim: true },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification, NotificationModel>(
  "Notification",
  notificationSchema,
);
