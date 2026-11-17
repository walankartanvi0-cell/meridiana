import { Schema, model, type Document, type Model, type Types } from "mongoose";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "../constants/collaboration";

export interface ITask extends Document {
  title: string;
  description?: string;
  deal?: Types.ObjectId;
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  dueDate?: Date;
  status: TaskStatus;
  priority: TaskPriority;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type TaskModel = Model<ITask>;

const taskSchema = new Schema<ITask, TaskModel>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000 },
    deal: { type: Schema.Types.ObjectId, ref: "Deal" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date },
    status: { type: String, enum: TASK_STATUSES, default: "todo" },
    priority: { type: String, enum: TASK_PRIORITIES, default: "medium" },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

taskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ deal: 1, createdAt: -1 });

export const Task = model<ITask, TaskModel>("Task", taskSchema);
