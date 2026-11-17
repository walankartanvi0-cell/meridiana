import { Schema, model, type Document, type Model, type Types } from "mongoose";
import { NDA_STATUSES, type NdaStatus } from "../constants/collaboration";

export interface INda extends Document {
  deal: Types.ObjectId;
  buyer: Types.ObjectId;
  requestedBy: Types.ObjectId;
  status: NdaStatus;
  notes?: string;
  signedAt?: Date;
  expiresAt?: Date;
  document?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

type NdaModel = Model<INda>;

const ndaSchema = new Schema<INda, NdaModel>(
  {
    deal: { type: Schema.Types.ObjectId, ref: "Deal", required: true },
    buyer: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: NDA_STATUSES, default: "requested" },
    notes: { type: String, trim: true, maxlength: 2000 },
    signedAt: { type: Date },
    expiresAt: { type: Date },
    document: { type: Schema.Types.ObjectId, ref: "Document" },
  },
  { timestamps: true },
);

ndaSchema.index({ deal: 1, buyer: 1 });
ndaSchema.index({ status: 1, updatedAt: -1 });
ndaSchema.index({ requestedBy: 1, createdAt: -1 });

export const Nda = model<INda, NdaModel>("NDA", ndaSchema);
