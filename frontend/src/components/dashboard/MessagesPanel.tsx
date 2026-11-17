"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  collaborationUserId,
  collaborationUserName,
  isUnreadMessage,
} from "@/lib/collaboration";
import type { UserRole } from "@/types/auth";
import type {
  CollaborationDeal,
  CollaborationUser,
  MessageRecord,
} from "@/types/collaboration";
import {
  EmptyState,
  formatDate,
  inputClass,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
  StatusPill,
} from "./DashboardUI";

const copy: Record<UserRole, { title: string; description: string }> = {
  admin: {
    title: "Messages",
    description:
      "Review portal correspondence across deals and keep communication records available for oversight.",
  },
  advisor: {
    title: "Client messages",
    description:
      "Keep buyer, seller and advisory conversations inside the portal, linked to the right deal and visible to the right people.",
  },
  buyer: {
    title: "Messages",
    description:
      "Message your advisory team and deal counterparties without leaving the secure portal.",
  },
  seller: {
    title: "Messages",
    description:
      "Keep buyer and advisor conversations in one place, with a clear record of every exchange.",
  },
};

type ComposeForm = {
  deal: string;
  recipients: string[];
  subject: string;
  body: string;
};

const emptyComposeForm: ComposeForm = {
  deal: "",
  recipients: [],
  subject: "",
  body: "",
};

export default function MessagesPanel({ role }: { role: UserRole }) {
  const { user } = useAuth();
  const currentUserId = collaborationUserId(user);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [deals, setDeals] = useState<CollaborationDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dealFilter, setDealFilter] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [composeForm, setComposeForm] = useState<ComposeForm>(emptyComposeForm);
  const [sending, setSending] = useState(false);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadContacts() {
      try {
        const response = await apiFetch<{
          users: CollaborationUser[];
          deals: CollaborationDeal[];
        }>("/messages/contacts");
        if (active) {
          setUsers(response.users.filter((member) => collaborationUserId(member) !== currentUserId));
          setDeals(response.deals);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load message contacts.");
      }
    }

    void loadContacts();
    return () => {
      active = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      const query = dealFilter ? `?dealId=${encodeURIComponent(dealFilter)}` : "";
      try {
        const response = await apiFetch<{ messages: MessageRecord[] }>(`/messages${query}`);
        if (active) setMessages(response.messages);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load messages.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadMessages();
    return () => {
      active = false;
    };
  }, [dealFilter]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (composeForm.recipients.length === 0) {
      setError("Choose at least one recipient.");
      return;
    }

    setSending(true);
    try {
      const response = await apiFetch<{ message: MessageRecord }>("/messages", {
        method: "POST",
        body: JSON.stringify({
          deal: composeForm.deal || undefined,
          recipients: composeForm.recipients,
          subject: composeForm.subject,
          body: composeForm.body,
        }),
      });
      setMessages((current) => [response.message, ...current]);
      setComposeForm(emptyComposeForm);
      setShowCompose(false);
      setSuccess("Message sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send the message.");
    } finally {
      setSending(false);
    }
  }

  async function handleRead(message: MessageRecord) {
    setError("");
    setSuccess("");
    setBusyId(message._id);
    try {
      const response = await apiFetch<{ message: MessageRecord }>(
        `/messages/${message._id}/read`,
        { method: "PATCH" },
      );
      setMessages((current) =>
        current.map((item) => (item._id === response.message._id ? response.message : item)),
      );
      setSuccess("Message marked as read.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the message.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(message: MessageRecord) {
    if (!window.confirm(`Delete "${message.subject}"?`)) return;

    setError("");
    setSuccess("");
    setBusyId(message._id);
    try {
      await apiFetch(`/messages/${message._id}`, { method: "DELETE" });
      setMessages((current) => current.filter((item) => item._id !== message._id));
      setSuccess("Message deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the message.");
    } finally {
      setBusyId("");
    }
  }

  function startReply(message: MessageRecord) {
    const senderId = collaborationUserId(message.sender);
    const recipients =
      senderId && senderId !== currentUserId
        ? [senderId]
        : message.recipients
            .map((recipient) => collaborationUserId(recipient))
            .filter((id) => id && id !== currentUserId);

    setComposeForm({
      deal: message.deal?._id ?? "",
      recipients,
      subject: message.subject.startsWith("Re: ") ? message.subject : `Re: ${message.subject}`,
      body: "",
    });
    setShowCompose(true);
    window.setTimeout(() => {
      document.getElementById("compose-message")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }

  function toggleRecipient(id: string) {
    setComposeForm((current) => ({
      ...current,
      recipients: current.recipients.includes(id)
        ? current.recipients.filter((item) => item !== id)
        : [...current.recipients, id],
    }));
  }

  return (
    <div className="grid gap-8">
      <PageIntro title={copy[role].title} description={copy[role].description} />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <Panel
        title="Message centre"
        description={`${messages.length} message${messages.length === 1 ? "" : "s"} in view`}
        actions={
          <button
            type="button"
            onClick={() => setShowCompose((current) => !current)}
            className={primaryButtonClass}
          >
            {showCompose ? "Close form" : "New message"}
          </button>
        }
      >
        {showCompose && (
          <form
            id="compose-message"
            onSubmit={(event) => void handleSend(event)}
            className="mb-8 grid gap-4 border border-navy-900/10 bg-ivory-50 p-5"
          >
            <div>
              <h3 className="font-display text-xl text-navy-900">New message</h3>
              <p className="mt-1 text-xs leading-6 text-charcoal-500">
                Messages stay inside the portal. Link one to a deal to keep the context with the
                conversation.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Linked deal
                </span>
                <select
                  value={composeForm.deal}
                  onChange={(event) =>
                    setComposeForm({ ...composeForm, deal: event.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">General message</option>
                  {deals.map((deal) => (
                    <option key={deal._id} value={deal._id}>
                      {deal.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Subject
                </span>
                <input
                  required
                  value={composeForm.subject}
                  onChange={(event) =>
                    setComposeForm({ ...composeForm, subject: event.target.value })
                  }
                  className={inputClass}
                  placeholder="Diligence request follow-up"
                />
              </label>
            </div>

            <fieldset className="border border-navy-900/10 bg-white p-4">
              <legend className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Recipients
              </legend>
              {users.length === 0 ? (
                <p className="text-xs text-charcoal-500">
                  No contacts are available yet. Your advisory team will appear here.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {users.map((member) => {
                    const id = collaborationUserId(member);
                    return (
                      <label
                        key={id}
                        className="flex items-center gap-2 text-sm text-charcoal-600"
                      >
                        <input
                          type="checkbox"
                          checked={composeForm.recipients.includes(id)}
                          onChange={() => toggleRecipient(id)}
                          className="h-4 w-4 accent-navy-900"
                        />
                        {member.name}
                        <span className="text-[10px] uppercase tracking-[0.1em] text-charcoal-500">
                          {member.role}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Message
              </span>
              <textarea
                required
                rows={5}
                value={composeForm.body}
                onChange={(event) => setComposeForm({ ...composeForm, body: event.target.value })}
                className={inputClass}
                placeholder="Write your message…"
              />
            </label>

            <div>
              <button type="submit" disabled={sending} className={primaryButtonClass}>
                {sending ? "Sending…" : "Send message"}
              </button>
            </div>
          </form>
        )}

        <div className="mb-6 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
              Filter by deal
            </span>
            <select
              value={dealFilter}
              onChange={(event) => {
                setLoading(true);
                setDealFilter(event.target.value);
              }}
              className={inputClass}
            >
              <option value="">All messages</option>
              {deals.map((deal) => (
                <option key={deal._id} value={deal._id}>
                  {deal.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="text-sm text-charcoal-500">Loading messages…</p>
        ) : messages.length === 0 ? (
          <EmptyState>No messages match this view. Start a conversation with your deal team.</EmptyState>
        ) : (
          <ul className="grid gap-4">
            {messages.map((message) => {
              const unread = isUnreadMessage(message, currentUserId);
              const canDelete =
                role === "admin" || collaborationUserId(message.sender) === currentUserId;

              return (
                <li
                  key={message._id}
                  className={`border p-5 ${
                    unread ? "border-gold-500/50 bg-gold-100/20" : "border-navy-900/10 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-xl text-navy-900">{message.subject}</h3>
                        {unread && <StatusPill value="unread" />}
                        {message.deal && (
                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal-500">
                            Deal: {message.deal.title}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-charcoal-500">
                        From {collaborationUserName(message.sender)} ·{" "}
                        {formatDate(message.createdAt)}
                      </p>
                      <p className="mt-1 text-xs text-charcoal-500">
                        To:{" "}
                        {message.recipients
                          .map((recipient) => recipient.name)
                          .join(", ") || "No recipients"}
                      </p>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-charcoal-600">
                        {message.body}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {unread && (
                        <button
                          type="button"
                          onClick={() => void handleRead(message)}
                          disabled={busyId === message._id}
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900 disabled:opacity-50"
                        >
                          {busyId === message._id ? "Saving…" : "Mark read"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => startReply(message)}
                        className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900"
                      >
                        Reply
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => void handleDelete(message)}
                          disabled={busyId === message._id}
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700 hover:text-red-900 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
