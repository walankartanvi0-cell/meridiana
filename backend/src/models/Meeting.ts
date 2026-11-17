import { Schema, model, type Document, type Model, type Types } from "mongoose";
import { MEETING_STATUSES, type MeetingStatus } from "../constants/collaboration";

export interface IMeeting extends Document {
  title: string;
  deal?: Types.ObjectId;
  organizer: Types.ObjectId;
  attendees: Types.ObjectId[];
  startAt: Date;
  durationMinutes: number;
  location?: string;
  meetingUrl?: string;
  agenda?: string;
  notes?: string;
  status: MeetingStatus;
  createdAt: Date;
  updatedAt: Date;
}

type MeetingModel = Model<IMeeting>;

const meetingSchema = new Schema<IMeeting, MeetingModel>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    deal: { type: Schema.Types.ObjectId, ref: "Deal" },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    startAt: { type: Date, required: true },
    durationMinutes: { type: Number, min: 15, max: 480, default: 30 },
    location: { type: String, trim: true, maxlength: 200 },
    meetingUrl: { type: String, trim: true, maxlength: 500 },
    agenda: { type: String, trim: true, maxlength: 3000 },
    notes: { type: String, trim: true, maxlength: 3000 },
    status: { type: String, enum: MEETING_STATUSES, default: "scheduled" },
  },
  { timestamps: true },
);

meetingSchema.index({ startAt: 1 });
meetingSchema.index({ deal: 1, startAt: 1 });
meetingSchema.index({ attendees: 1, startAt: 1 });
meetingSchema.index({ organizer: 1, startAt: 1 });

export const Meeting = model<IMeeting, MeetingModel>("Meeting", meetingSchema);
