"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { USER_ROLES, type AuthUser, type UserRole } from "@/types/auth";
import {
  inputClass,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
  secondaryButtonClass,
} from "./DashboardUI";

const emptyCreateForm = {
  name: "",
  email: "",
  password: "",
  role: "advisor" as UserRole,
  company: "",
  phone: "",
};

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  advisor: "Advisor",
  buyer: "Buyer",
  seller: "Seller",
};

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await apiFetch<{ users: AuthUser[] }>("/admin/users");
        if (active) setUsers(response.users);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load users.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.company ?? "").toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [roleFilter, search, users]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch<{ user: AuthUser }>("/auth/users", {
        method: "POST",
        body: JSON.stringify(createForm),
      });
      setUsers((current) => [response.user, ...current]);
      setCreateForm(emptyCreateForm);
      setShowCreate(false);
      setSuccess("User account created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch<{ user: AuthUser }>(`/admin/users/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editing.name,
          email: editing.email,
          role: editing.role,
          status: editing.status,
          company: editing.company,
          phone: editing.phone,
          title: editing.title,
        }),
      });
      setUsers((current) => current.map((item) => (item.id === response.user.id ? response.user : item)));
      setEditing(null);
      setSuccess("User details updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: AuthUser) {
    if (!window.confirm(`Delete ${user.name}'s account? This cannot be undone.`)) return;

    setError("");
    setSuccess("");
    try {
      await apiFetch(`/admin/users/${user.id}`, { method: "DELETE" });
      setUsers((current) => current.filter((item) => item.id !== user.id));
      if (editing?.id === user.id) setEditing(null);
      setSuccess("User deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the user.");
    }
  }

  return (
    <div className="grid gap-8">
      <PageIntro
        title="Manage users"
        description="Create staff accounts, review every registered client and control access to the portal."
      />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <Panel
        title="All accounts"
        description={`${filteredUsers.length} of ${users.length} accounts shown`}
        actions={
          <button
            type="button"
            onClick={() => setShowCreate((current) => !current)}
            className={primaryButtonClass}
          >
            {showCreate ? "Close form" : "Create user"}
          </button>
        }
      >
        {showCreate && (
          <form onSubmit={handleCreate} className="mb-8 grid gap-4 border border-navy-900/10 bg-ivory-50 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Full name
                </span>
                <input
                  required
                  value={createForm.name}
                  onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={createForm.email}
                  onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Temporary password
                </span>
                <input
                  required
                  minLength={8}
                  type="text"
                  value={createForm.password}
                  onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })}
                  className={inputClass}
                  placeholder="8+ characters, letter and number"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Role
                </span>
                <select
                  value={createForm.role}
                  onChange={(event) =>
                    setCreateForm({ ...createForm, role: event.target.value as UserRole })
                  }
                  className={inputClass}
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Company
                </span>
                <input
                  value={createForm.company}
                  onChange={(event) => setCreateForm({ ...createForm, company: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Phone
                </span>
                <input
                  value={createForm.phone}
                  onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })}
                  className={inputClass}
                />
              </label>
            </div>
            <div>
              <button type="submit" disabled={saving} className={primaryButtonClass}>
                {saving ? "Creating…" : "Create account"}
              </button>
            </div>
          </form>
        )}

        {editing && (
          <form onSubmit={handleUpdate} className="mb-8 grid gap-4 border border-gold-500/40 bg-gold-100/30 p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-xl text-navy-900">Edit {editing.name}</h3>
              <button type="button" onClick={() => setEditing(null)} className={secondaryButtonClass}>
                Cancel
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Full name
                </span>
                <input
                  required
                  value={editing.name}
                  onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={editing.email}
                  onChange={(event) => setEditing({ ...editing, email: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Role
                </span>
                <select
                  value={editing.role}
                  onChange={(event) =>
                    setEditing({ ...editing, role: event.target.value as UserRole })
                  }
                  className={inputClass}
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Status
                </span>
                <select
                  value={editing.status}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      status: event.target.value as AuthUser["status"],
                    })
                  }
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Company
                </span>
                <input
                  value={editing.company ?? ""}
                  onChange={(event) => setEditing({ ...editing, company: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Phone
                </span>
                <input
                  value={editing.phone ?? ""}
                  onChange={(event) => setEditing({ ...editing, phone: event.target.value })}
                  className={inputClass}
                />
              </label>
            </div>
            <div>
              <button type="submit" disabled={saving} className={primaryButtonClass}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}

        <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={inputClass}
            placeholder="Search name, email or company"
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className={inputClass}
          >
            <option value="">All roles</option>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-charcoal-500">Loading accounts…</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-sm text-charcoal-500">No accounts match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-900/10 text-[10px] uppercase tracking-[0.14em] text-charcoal-500">
                  <th className="pb-3 pr-4 font-semibold">Name</th>
                  <th className="pb-3 pr-4 font-semibold">Role</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 pr-4 font-semibold">Company</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-navy-900/5 align-top">
                    <td className="py-4 pr-4">
                      <p className="font-medium text-navy-900">{user.name}</p>
                      <p className="mt-0.5 text-xs text-charcoal-500">{user.email}</p>
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-600">{roleLabels[user.role]}</td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${
                          user.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-600">{user.company ?? "—"}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(user)}
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(user)}
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
