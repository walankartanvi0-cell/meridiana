import { Schema, model, type Document, type Model, type Types } from "mongoose";

export type BuyerStatus = "active" | "paused";

export interface IBuyer extends Document {
  user: Types.ObjectId;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  industries: string[];
  geographies: string[];
  ebitdaMin?: number;
  ebitdaMax?: number;
  dealType?: string;
  notes?: string;
  status: BuyerStatus;
  createdAt: Date;
  updatedAt: Date;
}

type BuyerModel = Model<IBuyer>;

const buyerSchema = new Schema<IBuyer, BuyerModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    industries: { type: [String], default: [] },
    geographies: { type: [String], default: [] },
    ebitdaMin: { type: Number, min: 0 },
    ebitdaMax: { type: Number, min: 0 },
    dealType: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: ["active", "paused"], default: "active" },
  },
  { timestamps: true },
);

buyerSchema.index({ status: 1, createdAt: -1 });

export const Buyer = model<IBuyer, BuyerModel>("Buyer", buyerSchema);
