import { Schema, model, type Document, type Model, type Types } from "mongoose";

export interface IMessage extends Document {
  deal?: Types.ObjectId;
  sender: Types.ObjectId;
  recipients: Types.ObjectId[];
  subject: string;
  body: string;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

type MessageModel = Model<IMessage>;

const messageSchema = new Schema<IMessage, MessageModel>(
  {
    deal: { type: Schema.Types.ObjectId, ref: "Deal" },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipients: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

messageSchema.index({ recipients: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ deal: 1, createdAt: -1 });

export const Message = model<IMessage, MessageModel>("Message", messageSchema);
