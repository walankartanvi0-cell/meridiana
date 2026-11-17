import { Schema, model, type Document, type Model, type Types } from "mongoose";
import { DEAL_STAGES, type DealStage } from "../constants/deals";

export interface IDeal extends Document {
  title: string;
  seller?: Types.ObjectId;
  buyer?: Types.ObjectId;
  advisor: Types.ObjectId;
  stage: DealStage;
  enterpriseValue?: number;
  ebitda?: number;
  expectedCloseDate?: Date;
  probability?: number;
  description?: string;
  notes?: string;
  savedBy: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

type DealModel = Model<IDeal>;

const dealSchema = new Schema<IDeal, DealModel>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    seller: { type: Schema.Types.ObjectId, ref: "Seller" },
    buyer: { type: Schema.Types.ObjectId, ref: "Buyer" },
    advisor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stage: { type: String, enum: DEAL_STAGES, default: "sourcing" },
    enterpriseValue: { type: Number, min: 0 },
    ebitda: { type: Number, min: 0 },
    expectedCloseDate: { type: Date },
    probability: { type: Number, min: 0, max: 100 },
    description: { type: String, trim: true },
    notes: { type: String, trim: true },
    savedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

dealSchema.index({ stage: 1, updatedAt: -1 });
dealSchema.index({ advisor: 1, updatedAt: -1 });
dealSchema.index({ seller: 1, updatedAt: -1 });
dealSchema.index({ buyer: 1, updatedAt: -1 });

export const Deal = model<IDeal, DealModel>("Deal", dealSchema);
