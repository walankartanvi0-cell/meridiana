"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  collaborationUserId,
  collaborationUserName,
  dateInputValue,
  formatDateOnly,
  priorityTone,
} from "@/lib/collaboration";
import type { UserRole } from "@/types/auth";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type CollaborationDeal,
  type CollaborationUser,
  type TaskPriority,
  type TaskRecord,
  type TaskStatus,
  type TaskSummary,
} from "@/types/collaboration";
import {
  EmptyState,
  inputClass,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
  secondaryButtonClass,
  StatCard,
  StatusPill,
} from "./DashboardUI";

const copy: Record<UserRole, { title: string; description: string }> = {
  admin: {
    title: "Tasks",
    description:
      "Assign follow-ups across the team, track overdue work and keep every transaction moving to its next milestone.",
  },
  advisor: {
    title: "Tasks",
    description:
      "Turn deal actions into clear assignments with owners, due dates and priorities your team can act on.",
  },
  buyer: {
    title: "My tasks",
    description:
      "Follow the actions your advisory team has asked you to complete and update their status as you progress.",
  },
  seller: {
    title: "My tasks",
    description:
      "See the preparation and diligence actions requested by your advisory team and keep them up to date.",
  },
};

type TaskForm = {
  title: string;
  description: string;
  deal: string;
  assignedTo: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
};

const emptyTaskForm: TaskForm = {
  title: "",
  description: "",
  deal: "",
  assignedTo: "",
  dueDate: "",
  priority: "medium",
  status: "todo",
};

const emptySummary: TaskSummary = {
  total: 0,
  todo: 0,
  in_progress: 0,
  done: 0,
  overdue: 0,
};

export default function TasksPanel({ role }: { role: UserRole }) {
  const { user } = useAuth();
  const currentUserId = collaborationUserId(user);
  const canManage = role === "admin" || role === "advisor";
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [summary, setSummary] = useState<TaskSummary>(emptySummary);
  const [deals, setDeals] = useState<CollaborationDeal[]>([]);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<TaskForm>(emptyTaskForm);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState<TaskForm>(emptyTaskForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      if (!canManage) return;
      try {
        const response = await apiFetch<{
          deals: CollaborationDeal[];
          users: CollaborationUser[];
        }>("/tasks/options");
        if (active) {
          setDeals(response.deals);
          setUsers(response.users);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load task options.");
      }
    }

    void loadOptions();
    return () => {
      active = false;
    };
  }, [canManage]);

  useEffect(() => {
    let active = true;

    async function loadTasks() {
      const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
      try {
        const [taskResponse, summaryResponse] = await Promise.all([
          apiFetch<{ tasks: TaskRecord[] }>(`/tasks${query}`),
          apiFetch<{ summary: TaskSummary }>("/tasks/summary"),
        ]);
        if (active) {
          setTasks(taskResponse.tasks);
          setSummary(summaryResponse.summary);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load tasks.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTasks();
    return () => {
      active = false;
    };
  }, [statusFilter]);

  async function refreshSummary() {
    try {
      const response = await apiFetch<{ summary: TaskSummary }>("/tasks/summary");
      setSummary(response.summary);
    } catch {
      // The task list remains usable even if the summary refresh fails.
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!createForm.assignedTo) {
      setError("Choose who should complete this task.");
      return;
    }

    setCreating(true);
    try {
      const response = await apiFetch<{ task: TaskRecord }>("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: createForm.title,
          description: createForm.description || undefined,
          deal: createForm.deal || undefined,
          assignedTo: createForm.assignedTo,
          dueDate: createForm.dueDate || undefined,
          priority: createForm.priority,
        }),
      });
      if (!statusFilter || response.task.status === statusFilter) {
        setTasks((current) => [response.task, ...current]);
      }
      setCreateForm(emptyTaskForm);
      setShowCreate(false);
      setSuccess("Task created and the assignee has been notified.");
      await refreshSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the task.");
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
      const response = await apiFetch<{ task: TaskRecord }>(`/tasks/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          deal: editForm.deal || undefined,
          assignedTo: editForm.assignedTo,
          dueDate: editForm.dueDate || undefined,
          priority: editForm.priority,
          status: editForm.status,
        }),
      });
      setTasks((current) =>
        current.map((item) => (item._id === response.task._id ? response.task : item)),
      );
      setEditingId("");
      setSuccess("Task updated.");
      await refreshSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the task.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(task: TaskRecord, status: TaskStatus) {
    setError("");
    setSuccess("");
    setBusyId(task._id);
    try {
      const response = await apiFetch<{ task: TaskRecord }>(`/tasks/${task._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setTasks((current) => {
        if (statusFilter && response.task.status !== statusFilter) {
          return current.filter((item) => item._id !== response.task._id);
        }
        return current.map((item) => (item._id === response.task._id ? response.task : item));
      });
      setSuccess(`Task moved to ${TASK_STATUS_LABELS[status].toLowerCase()}.`);
      await refreshSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the task.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(task: TaskRecord) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    setError("");
    setSuccess("");
    setBusyId(task._id);
    try {
      await apiFetch(`/tasks/${task._id}`, { method: "DELETE" });
      setTasks((current) => current.filter((item) => item._id !== task._id));
      if (editingId === task._id) setEditingId("");
      setSuccess("Task deleted.");
      await refreshSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the task.");
    } finally {
      setBusyId("");
    }
  }

  const formFields = (form: TaskForm, onChange: (next: TaskForm) => void, includeStatus: boolean) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Task title
        </span>
        <input
          required
          value={form.title}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          className={inputClass}
          placeholder="Upload the FY2025 management accounts"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Assign to
        </span>
        <select
          required
          value={form.assignedTo}
          onChange={(event) => onChange({ ...form, assignedTo: event.target.value })}
          className={inputClass}
        >
          <option value="">Select a person</option>
          {users.map((member) => (
            <option key={collaborationUserId(member)} value={collaborationUserId(member)}>
              {member.name} — {member.role}
            </option>
          ))}
        </select>
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
          <option value="">No deal linked</option>
          {deals.map((deal) => (
            <option key={deal._id} value={deal._id}>
              {deal.title}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Due date
        </span>
        <input
          type="date"
          value={form.dueDate}
          onChange={(event) => onChange({ ...form, dueDate: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Priority
        </span>
        <select
          value={form.priority}
          onChange={(event) =>
            onChange({ ...form, priority: event.target.value as TaskPriority })
          }
          className={inputClass}
        >
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {TASK_PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </label>
      {includeStatus && (
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Status
          </span>
          <select
            value={form.status}
            onChange={(event) => onChange({ ...form, status: event.target.value as TaskStatus })}
            className={inputClass}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Instructions
        </span>
        <textarea
          rows={3}
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
          className={inputClass}
          placeholder="What needs to be done, and what does good look like?"
        />
      </label>
    </div>
  );

  const columns = TASK_STATUSES.map((status) => ({
    status,
    label: TASK_STATUS_LABELS[status],
    tasks: tasks.filter((task) => task.status === status),
  }));

  return (
    <div className="grid gap-8">
      <PageIntro title={copy[role].title} description={copy[role].description} />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All tasks" value={summary.total} />
        <StatCard label="To do" value={summary.todo} />
        <StatCard label="In progress" value={summary.in_progress} />
        <StatCard label="Overdue" value={summary.overdue} detail="Open past their due date" />
      </div>

      <Panel
        title="Task board"
        description={`${tasks.length} task${tasks.length === 1 ? "" : "s"} in view`}
        actions={
          canManage ? (
            <button
              type="button"
              onClick={() => {
                setShowCreate((current) => !current);
                setEditingId("");
                if (!showCreate) {
                  setCreateForm({ ...emptyTaskForm, assignedTo: currentUserId });
                }
              }}
              className={primaryButtonClass}
            >
              {showCreate ? "Close form" : "Create task"}
            </button>
          ) : undefined
        }
      >
        {canManage && showCreate && (
          <form
            onSubmit={(event) => void handleCreate(event)}
            className="mb-8 border border-navy-900/10 bg-ivory-50 p-5"
          >
            <div className="mb-5">
              <h3 className="font-display text-xl text-navy-900">Create a task</h3>
              <p className="mt-1 text-xs leading-6 text-charcoal-500">
                Assign a clear next action. The assignee receives a notification immediately.
              </p>
            </div>
            {formFields(createForm, setCreateForm, false)}
            <div className="mt-5">
              <button type="submit" disabled={creating} className={primaryButtonClass}>
                {creating ? "Creating…" : "Create task"}
              </button>
            </div>
          </form>
        )}

        {canManage && editingId && (
          <form
            onSubmit={(event) => void handleUpdate(event)}
            className="mb-8 border border-gold-500/40 bg-gold-100/30 p-5"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl text-navy-900">Edit task</h3>
              <button type="button" onClick={() => setEditingId("")} className={secondaryButtonClass}>
                Cancel
              </button>
            </div>
            {formFields(editForm, setEditForm, true)}
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
              <option value="">All tasks</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="text-sm text-charcoal-500">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <EmptyState>
            {canManage
              ? "No tasks match this view. Create a task to give the deal team a clear next action."
              : "You have no tasks assigned right now."}
          </EmptyState>
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {columns.map((column) => (
              <section key={column.status} className="border border-navy-900/10 bg-ivory-50">
                <div className="flex items-center justify-between border-b border-navy-900/10 px-4 py-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-900">
                    {column.label}
                  </h3>
                  <span className="text-[10px] text-charcoal-500">{column.tasks.length}</span>
                </div>
                <div className="grid gap-3 p-3">
                  {column.tasks.length === 0 ? (
                    <p className="border border-dashed border-navy-900/10 px-3 py-6 text-center text-xs text-charcoal-500">
                      Nothing here.
                    </p>
                  ) : (
                    column.tasks.map((task) => {
                      const isAssignee = collaborationUserId(task.assignedTo) === currentUserId;
                      return (
                        <article key={task._id} className="border border-navy-900/10 bg-white p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h4 className="max-w-[16rem] font-medium leading-6 text-navy-900">
                              {task.title}
                            </h4>
                            <span
                              className={`inline-flex px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${priorityTone(task.priority)}`}
                            >
                              {TASK_PRIORITY_LABELS[task.priority]}
                            </span>
                          </div>

                          {task.description && (
                            <p className="mt-2 text-xs leading-5 text-charcoal-600">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-3 grid gap-1 text-[11px] text-charcoal-500">
                            <span>Assignee: {collaborationUserName(task.assignedTo)}</span>
                            {task.deal && <span>Deal: {task.deal.title}</span>}
                            <span>Due: {formatDateOnly(task.dueDate)}</span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            {task.status !== "in_progress" && task.status !== "done" && (
                              <button
                                type="button"
                                onClick={() => void handleStatus(task, "in_progress")}
                                disabled={busyId === task._id}
                                className="text-[9px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900 disabled:opacity-50"
                              >
                                Start
                              </button>
                            )}
                            {task.status !== "done" && (
                              <button
                                type="button"
                                onClick={() => void handleStatus(task, "done")}
                                disabled={busyId === task._id}
                                className="text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
                              >
                                Complete
                              </button>
                            )}
                            {task.status === "done" && (
                              <button
                                type="button"
                                onClick={() => void handleStatus(task, "todo")}
                                disabled={busyId === task._id}
                                className="text-[9px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900 disabled:opacity-50"
                              >
                                Reopen
                              </button>
                            )}
                            {canManage && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingId(task._id);
                                    setEditForm({
                                      title: task.title,
                                      description: task.description ?? "",
                                      deal: task.deal?._id ?? "",
                                      assignedTo: collaborationUserId(task.assignedTo),
                                      dueDate: dateInputValue(task.dueDate),
                                      priority: task.priority,
                                      status: task.status,
                                    });
                                    setShowCreate(false);
                                  }}
                                  className="text-[9px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDelete(task)}
                                  disabled={busyId === task._id}
                                  className="text-[9px] font-semibold uppercase tracking-[0.12em] text-red-700 hover:text-red-900 disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                            {isAssignee && (
                              <StatusPill value={TASK_STATUS_LABELS[task.status]} />
                            )}
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
