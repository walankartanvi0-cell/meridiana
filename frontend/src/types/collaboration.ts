import type { UserRole } from "./auth";

export const DOCUMENT_CATEGORIES = [
  "financials",
  "legal",
  "marketing",
  "diligence",
  "closing",
  "other",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  financials: "Financials",
  legal: "Legal",
  marketing: "Marketing",
  diligence: "Diligence",
  closing: "Closing",
  other: "Other",
};

export const NDA_STATUSES = [
  "requested",
  "under_review",
  "signed",
  "declined",
  "expired",
] as const;
export type NdaStatus = (typeof NDA_STATUSES)[number];

export const NDA_STATUS_LABELS: Record<NdaStatus, string> = {
  requested: "Requested",
  under_review: "Under review",
  signed: "Signed",
  declined: "Declined",
  expired: "Expired",
};

export const MEETING_STATUSES = ["scheduled", "completed", "cancelled"] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

/** A populated user reference. Mongoose serialises the id as _id. */
export type CollaborationUser = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
};

export type CollaborationDeal = {
  _id: string;
  title: string;
  stage: string;
};

export type CollaborationOptions = {
  deals: CollaborationDeal[];
  users: CollaborationUser[];
};

export type DocumentRecord = {
  _id: string;
  title: string;
  description?: string;
  fileName: string;
  mimeType: string;
  size: number;
  category: DocumentCategory;
  deal?: CollaborationDeal | null;
  uploadedBy?: CollaborationUser | null;
  visibleTo: UserRole[];
  createdAt: string;
  updatedAt: string;
};

export type NdaRecord = {
  _id: string;
  deal?: CollaborationDeal | null;
  buyer?: {
    _id: string;
    companyName: string;
    user?: { _id?: string; id?: string; name: string; email: string } | null;
  } | null;
  requestedBy?: CollaborationUser | null;
  status: NdaStatus;
  notes?: string;
  signedAt?: string;
  expiresAt?: string;
  document?: Pick<DocumentRecord, "_id" | "title" | "fileName" | "size" | "category"> | null;
  createdAt: string;
  updatedAt: string;
};

export type MeetingRecord = {
  _id: string;
  title: string;
  deal?: CollaborationDeal | null;
  organizer?: CollaborationUser | null;
  attendees: CollaborationUser[];
  startAt: string;
  durationMinutes: number;
  location?: string;
  meetingUrl?: string;
  agenda?: string;
  notes?: string;
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskRecord = {
  _id: string;
  title: string;
  description?: string;
  deal?: CollaborationDeal | null;
  assignedTo?: CollaborationUser | null;
  createdBy?: CollaborationUser | null;
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskSummary = {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
};

export type MessageRecord = {
  _id: string;
  deal?: CollaborationDeal | null;
  sender?: CollaborationUser | null;
  recipients: CollaborationUser[];
  subject: string;
  body: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
};
