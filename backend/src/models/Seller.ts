import { Schema, model, type Document, type Model, type Types } from "mongoose";

export type SellerStatus = "draft" | "active" | "closed";

export interface ISeller extends Document {
  user: Types.ObjectId;
  companyName: string;
  industry?: string;
  location?: string;
  revenue?: number;
  ebitda?: number;
  yearFounded?: number;
  description?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  status: SellerStatus;
  createdAt: Date;
  updatedAt: Date;
}

type SellerModel = Model<ISeller>;

const sellerSchema = new Schema<ISeller, SellerModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    industry: { type: String, trim: true },
    location: { type: String, trim: true },
    revenue: { type: Number, min: 0 },
    ebitda: { type: Number, min: 0 },
    yearFounded: { type: Number, min: 1800, max: 2100 },
    description: { type: String, trim: true },
    contactName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
    },
  },
  { timestamps: true },
);

sellerSchema.index({ status: 1, createdAt: -1 });

export const Seller = model<ISeller, SellerModel>("Seller", sellerSchema);
