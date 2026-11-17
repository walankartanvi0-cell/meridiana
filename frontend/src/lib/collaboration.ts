import type { UserRole } from "@/types/auth";
import type { CollaborationUser, DocumentRecord, MessageRecord } from "@/types/collaboration";
import { ROLE_LABELS } from "@/types/auth";
import { API_URL, ApiError, getToken } from "./api";

export const DOCUMENT_VISIBILITY_ROLES: UserRole[] = ["admin", "advisor", "buyer", "seller"];

export function collaborationUserId(user?: CollaborationUser | null) {
  return user?.id ?? user?._id ?? "";
}

export function collaborationUserName(user?: CollaborationUser | null) {
  return user?.name ?? "Unknown user";
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatVisibility(roles: UserRole[]) {
  if (!roles.length) return "Only you";
  return roles.map((role) => ROLE_LABELS[role]).join(", ");
}

/** Converts an ISO timestamp into a value accepted by <input type="datetime-local">. */
export function localDateTimeValue(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Converts a local datetime input back to an ISO timestamp for the API. */
export function toIsoDateTime(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function dateInputValue(iso?: string) {
  return iso?.slice(0, 10) ?? "";
}

export function formatDateOnly(iso?: string) {
  return iso ? iso.slice(0, 10) : "—";
}

export function meetingJoinHref(url?: string) {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

export function isUnreadMessage(message: MessageRecord, userId: string) {
  if (!userId) return false;
  const isRecipient = message.recipients.some(
    (recipient) => collaborationUserId(recipient) === userId,
  );
  return isRecipient && !message.readBy.includes(userId);
}

export function priorityTone(priority: string) {
  if (priority === "high") return "bg-red-50 text-red-700";
  if (priority === "medium") return "bg-gold-100 text-navy-900";
  return "bg-navy-900/5 text-charcoal-600";
}

/**
 * Downloads a private file through the authenticated API, then hands the blob
 * to the browser. Files are never exposed as public URLs.
 */
export async function downloadDocumentFile(record: Pick<DocumentRecord, "_id" | "fileName">) {
  const token = getToken();
  const response = await fetch(`${API_URL}/documents/${record._id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => ({}));
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : "Unable to download this file.";
    throw new ApiError(message, response.status);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = record.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
