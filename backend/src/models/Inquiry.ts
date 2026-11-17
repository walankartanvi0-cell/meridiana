import { Schema, model, type Document } from "mongoose";

export type InquiryType = "contact" | "consultation";
export type InquiryStatus = "new" | "reviewing" | "contacted" | "closed";

export interface IInquiry extends Document {
  type: InquiryType;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  ebitdaRange?: string;
  interest?: string;
  subject?: string;
  message: string;
  consent: boolean;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new Schema<IInquiry>(
  {
    type: { type: String, enum: ["contact", "consultation"], required: true },
    name: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    role: { type: String, trim: true },
    ebitdaRange: { type: String, trim: true },
    interest: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    consent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["new", "reviewing", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true },
);

inquirySchema.index({ createdAt: -1 });

export const Inquiry = model<IInquiry>("Inquiry", inquirySchema);
