"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { NotificationRecord } from "@/types/dashboard";
import {
  EmptyState,
  formatDate,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
  secondaryButtonClass,
  StatusPill,
} from "./DashboardUI";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await apiFetch<{
          notifications: NotificationRecord[];
          unread: number;
        }>("/notifications");
        if (active) {
          setNotifications(response.notifications);
          setUnread(response.unread);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load notifications.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  async function handleRead(notification: NotificationRecord) {
    setBusyId(notification._id);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/notifications/${notification._id}/read`, { method: "PATCH" });
      setNotifications((current) =>
        current.map((item) => (item._id === notification._id ? { ...item, read: true } : item)),
      );
      if (!notification.read) setUnread((current) => Math.max(0, current - 1));
      setSuccess("Notification marked as read.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the notification.");
    } finally {
      setBusyId("");
    }
  }

  async function handleReadAll() {
    setClearing(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnread(0);
      setSuccess("All notifications are now marked as read.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update notifications.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="grid gap-8">
      <PageIntro
        title="Notifications"
        description="Important account and platform updates. Mark individual messages or clear the whole list."
      />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <Panel
        title="Your notifications"
        description={unread === 1 ? "1 unread message" : `${unread} unread messages`}
        actions={
          <button
            type="button"
            onClick={() => void handleReadAll()}
            disabled={unread === 0 || clearing}
            className={secondaryButtonClass}
          >
            {clearing ? "Updating…" : "Mark all as read"}
          </button>
        }
      >
        {loading ? (
          <p className="text-sm text-charcoal-500">Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <EmptyState>You have no notifications yet.</EmptyState>
        ) : (
          <ul className="grid gap-3">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`border px-5 py-4 ${
                  notification.read
                    ? "border-navy-900/10 bg-white"
                    : "border-gold-500/40 bg-gold-100/20"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-xl text-navy-900">{notification.title}</h3>
                      <StatusPill value={notification.read ? "read" : notification.type} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-charcoal-600">{notification.message}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-charcoal-500">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => void handleRead(notification)}
                      disabled={busyId === notification._id}
                      className={primaryButtonClass}
                    >
                      {busyId === notification._id ? "Saving…" : "Mark as read"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
