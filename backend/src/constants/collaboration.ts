/** Shared vocabulary for the Stage 7 collaboration tools. */

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

/** File extensions accepted by the secure document locker. */
export const ALLOWED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
] as const;

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
