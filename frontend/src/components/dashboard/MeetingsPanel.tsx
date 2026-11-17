"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  collaborationUserId,
  collaborationUserName,
  localDateTimeValue,
  meetingJoinHref,
  toIsoDateTime,
} from "@/lib/collaboration";
import type { UserRole } from "@/types/auth";
import {
  MEETING_STATUSES,
  MEETING_STATUS_LABELS,
  type CollaborationDeal,
  type CollaborationUser,
  type MeetingRecord,
  type MeetingStatus,
} from "@/types/collaboration";
import {
  EmptyState,
  formatDate,
  inputClass,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
  secondaryButtonClass,
  StatusPill,
} from "./DashboardUI";

const copy: Record<UserRole, { title: string; description: string }> = {
  admin: {
    title: "Meetings",
    description:
      "See every scheduled conversation across the platform, review outcomes and keep deal momentum visible.",
  },
  advisor: {
    title: "Meetings",
    description:
      "Schedule calls with deal parties, record agendas and keep every mandate moving with clear next steps.",
  },
  buyer: {
    title: "Meetings",
    description:
      "Book time with your advisory team and deal parties, then review the agenda and meeting details.",
  },
  seller: {
    title: "Meetings",
    description:
      "Keep buyer and advisory meetings in one place so your sale process stays organised and transparent.",
  },
};

type MeetingForm = {
  title: string;
  deal: string;
  startAt: string;
  durationMinutes: string;
  location: string;
  meetingUrl: string;
  agenda: string;
  attendees: string[];
  status: MeetingStatus;
};

const emptyMeetingForm: MeetingForm = {
  title: "",
  deal: "",
  startAt: "",
  durationMinutes: "30",
  location: "",
  meetingUrl: "",
  agenda: "",
  attendees: [],
  status: "scheduled",
};

function normaliseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function sortMeetings(meetings: MeetingRecord[]) {
  return [...meetings].sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export default function MeetingsPanel({ role }: { role: UserRole }) {
  const { user } = useAuth();
  const currentUserId = collaborationUserId(user);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [deals, setDeals] = useState<CollaborationDeal[]>([]);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<MeetingForm>(emptyMeetingForm);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState<MeetingForm>(emptyMeetingForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const response = await apiFetch<{
          deals: CollaborationDeal[];
          users: CollaborationUser[];
        }>("/meetings/options");
        if (active) {
          setDeals(response.deals);
          setUsers(response.users);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load meeting options.");
      }
    }

    void loadOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMeetings() {
      const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
      try {
        const response = await apiFetch<{ meetings: MeetingRecord[] }>(`/meetings${query}`);
        if (active) setMeetings(response.meetings);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load meetings.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadMeetings();
    return () => {
      active = false;
    };
  }, [statusFilter]);

  function meetingPayload(form: MeetingForm) {
    return {
      title: form.title,
      deal: form.deal || undefined,
      startAt: toIsoDateTime(form.startAt),
      durationMinutes: Number(form.durationMinutes) || 30,
      location: form.location || undefined,
      meetingUrl: normaliseUrl(form.meetingUrl),
      agenda: form.agenda || undefined,
      attendees: form.attendees,
      status: form.status,
    };
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!toIsoDateTime(createForm.startAt)) {
      setError("Choose a meeting date and time.");
      return;
    }

    setCreating(true);
    try {
      const response = await apiFetch<{ meeting: MeetingRecord }>("/meetings", {
        method: "POST",
        body: JSON.stringify(meetingPayload(createForm)),
      });
      setMeetings((current) => sortMeetings([...current, response.meeting]));
      setCreateForm(emptyMeetingForm);
      setShowCreate(false);
      setSuccess("Meeting scheduled. Attendees have been notified.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to schedule the meeting.");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await apiFetch<{ meeting: MeetingRecord }>(`/meetings/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(meetingPayload(editForm)),
      });
      setMeetings((current) =>
        sortMeetings(current.map((item) => (item._id === response.meeting._id ? response.meeting : item))),
      );
      setEditingId("");
      setSuccess("Meeting updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the meeting.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(meeting: MeetingRecord, status: MeetingStatus) {
    setError("");
    setSuccess("");
    setBusyId(meeting._id);
    try {
      const response = await apiFetch<{ meeting: MeetingRecord }>(`/meetings/${meeting._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMeetings((current) =>
        sortMeetings(current.map((item) => (item._id === response.meeting._id ? response.meeting : item))),
      );
      setSuccess(`Meeting marked as ${MEETING_STATUS_LABELS[status].toLowerCase()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the meeting.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(meeting: MeetingRecord) {
    if (!window.confirm(`Delete "${meeting.title}"?`)) return;

    setError("");
    setSuccess("");
    setBusyId(meeting._id);
    try {
      await apiFetch(`/meetings/${meeting._id}`, { method: "DELETE" });
      setMeetings((current) => current.filter((item) => item._id !== meeting._id));
      if (editingId === meeting._id) setEditingId("");
      setSuccess("Meeting deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the meeting.");
    } finally {
      setBusyId("");
    }
  }

  function canManage(meeting: MeetingRecord) {
    return role === "admin" || collaborationUserId(meeting.organizer) === currentUserId;
  }

  const formFields = (form: MeetingForm, onChange: (next: MeetingForm) => void) => (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Meeting title
          </span>
          <input
            required
            value={form.title}
            onChange={(event) => onChange({ ...form, title: event.target.value })}
            className={inputClass}
            placeholder="Management presentation"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Linked deal
          </span>
          <select
            value={form.deal}
            onChange={(event) => onChange({ ...form, deal: event.target.value })}
            className={inputClass}
          >
            <option value="">Internal meeting</option>
            {deals.map((deal) => (
              <option key={deal._id} value={deal._id}>
                {deal.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Date and time
          </span>
          <input
            type="datetime-local"
            required
            value={form.startAt}
            onChange={(event) => onChange({ ...form, startAt: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Duration (minutes)
          </span>
          <input
            type="number"
            min="15"
            max="480"
            step="15"
            value={form.durationMinutes}
            onChange={(event) => onChange({ ...form, durationMinutes: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Status
          </span>
          <select
            value={form.status}
            onChange={(event) => onChange({ ...form, status: event.target.value as MeetingStatus })}
            className={inputClass}
          >
            {MEETING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {MEETING_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Location
          </span>
          <input
            value={form.location}
            onChange={(event) => onChange({ ...form, location: event.target.value })}
            className={inputClass}
            placeholder="Meridiana boardroom"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Meeting link
          </span>
          <input
            value={form.meetingUrl}
            onChange={(event) => onChange({ ...form, meetingUrl: event.target.value })}
            className={inputClass}
            placeholder="https://zoom.us/j/…"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Agenda
          </span>
          <textarea
            rows={3}
            value={form.agenda}
            onChange={(event) => onChange({ ...form, agenda: event.target.value })}
            className={inputClass}
            placeholder="Topics, attendees' roles and desired outcomes."
          />
        </label>
      </div>

      <fieldset className="mt-4 border border-navy-900/10 bg-white p-4">
        <legend className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Invite attendees
        </legend>
        {users.filter((member) => collaborationUserId(member) !== currentUserId).length === 0 ? (
          <p className="text-xs text-charcoal-500">No other contacts are available yet.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {users
              .filter((member) => collaborationUserId(member) !== currentUserId)
              .map((member) => {
                const id = collaborationUserId(member);
                return (
                  <label key={id} className="flex items-center gap-2 text-sm text-charcoal-600">
                    <input
                      type="checkbox"
                      checked={form.attendees.includes(id)}
                      onChange={() =>
                        onChange({
                          ...form,
                          attendees: form.attendees.includes(id)
                            ? form.attendees.filter((item) => item !== id)
                            : [...form.attendees, id],
                        })
                      }
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
        <p className="mt-3 text-xs leading-5 text-charcoal-500">
          You are always included. When a meeting is linked to a deal, the advisor, buyer and seller on
          that deal are invited automatically.
        </p>
      </fieldset>
    </>
  );

  return (
    <div className="grid gap-8">
      <PageIntro title={copy[role].title} description={copy[role].description} />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <Panel
        title="Meeting schedule"
        description={`${meetings.length} meeting${meetings.length === 1 ? "" : "s"} in view`}
        actions={
          <button
            type="button"
            onClick={() => {
              setShowCreate((current) => !current);
              setEditingId("");
            }}
            className={primaryButtonClass}
          >
            {showCreate ? "Close form" : "Schedule meeting"}
          </button>
        }
      >
        {showCreate && (
          <form
            onSubmit={(event) => void handleCreate(event)}
            className="mb-8 border border-navy-900/10 bg-ivory-50 p-5"
          >
            <div className="mb-5">
              <h3 className="font-display text-xl text-navy-900">Schedule a meeting</h3>
              <p className="mt-1 text-xs leading-6 text-charcoal-500">
                Add a deal to bring the right parties together automatically.
              </p>
            </div>
            {formFields(createForm, setCreateForm)}
            <div className="mt-5">
              <button type="submit" disabled={creating} className={primaryButtonClass}>
                {creating ? "Scheduling…" : "Schedule meeting"}
              </button>
            </div>
          </form>
        )}

        {editingId && (
          <form
            onSubmit={(event) => void handleUpdate(event)}
            className="mb-8 border border-gold-500/40 bg-gold-100/30 p-5"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl text-navy-900">Edit meeting</h3>
              <button type="button" onClick={() => setEditingId("")} className={secondaryButtonClass}>
                Cancel
              </button>
            </div>
            {formFields(editForm, setEditForm)}
            <div className="mt-5">
              <button type="submit" disabled={saving} className={primaryButtonClass}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}

        <div className="mb-6 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
              Filter by status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setLoading(true);
                setStatusFilter(event.target.value);
              }}
              className={inputClass}
            >
              <option value="">All meetings</option>
              {MEETING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {MEETING_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="text-sm text-charcoal-500">Loading meetings…</p>
        ) : meetings.length === 0 ? (
          <EmptyState>No meetings match this view. Schedule one to bring the deal team together.</EmptyState>
        ) : (
          <ul className="grid gap-4">
            {meetings.map((meeting) => {
              const joinHref = meetingJoinHref(meeting.meetingUrl);
              return (
                <li
                  key={meeting._id}
                  className={`border p-5 ${
                    meeting.status === "cancelled"
                      ? "border-red-200 bg-red-50/30"
                      : "border-navy-900/10 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-xl text-navy-900">{meeting.title}</h3>
                        <StatusPill value={MEETING_STATUS_LABELS[meeting.status]} />
                      </div>
                      <p className="mt-2 text-sm text-charcoal-600">
                        {formatDate(meeting.startAt)} · {meeting.durationMinutes} minutes
                        {meeting.deal ? ` · ${meeting.deal.title}` : " · Internal meeting"}
                      </p>
                      <p className="mt-1 text-xs text-charcoal-500">
                        Organised by {collaborationUserName(meeting.organizer)}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {meeting.attendees.map((attendee) => (
                          <span
                            key={collaborationUserId(attendee)}
                            className="border border-navy-900/10 bg-ivory-50 px-2.5 py-1 text-[10px] font-medium text-charcoal-600"
                          >
                            {attendee.name}
                          </span>
                        ))}
                      </div>

                      {meeting.agenda && (
                        <p className="mt-3 border-l-2 border-gold-500/50 pl-3 text-sm leading-6 text-charcoal-600">
                          {meeting.agenda}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-charcoal-500">
                        {meeting.location && <span>Location: {meeting.location}</span>}
                        {joinHref && (
                          <a
                            href={joinHref}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-gold-600 hover:text-navy-900"
                          >
                            Join meeting
                          </a>
                        )}
                      </div>
                    </div>

                    {canManage(meeting) && (
                      <div className="flex flex-wrap gap-3">
                        {meeting.status === "scheduled" && (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleStatus(meeting, "completed")}
                              disabled={busyId === meeting._id}
                              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
                            >
                              Mark completed
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleStatus(meeting, "cancelled")}
                              disabled={busyId === meeting._id}
                              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700 hover:text-red-900 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {meeting.status !== "scheduled" && (
                          <button
                            type="button"
                            onClick={() => void handleStatus(meeting, "scheduled")}
                            disabled={busyId === meeting._id}
                            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900 disabled:opacity-50"
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(meeting._id);
                            setEditForm({
                              title: meeting.title,
                              deal: meeting.deal?._id ?? "",
                              startAt: localDateTimeValue(meeting.startAt),
                              durationMinutes: String(meeting.durationMinutes),
                              location: meeting.location ?? "",
                              meetingUrl: meeting.meetingUrl ?? "",
                              agenda: meeting.agenda ?? "",
                              attendees: meeting.attendees.map((attendee) =>
                                collaborationUserId(attendee),
                              ),
                              status: meeting.status,
                            });
                            setShowCreate(false);
                          }}
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(meeting)}
                          disabled={busyId === meeting._id}
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700 hover:text-red-900 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
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
