"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import type { AuthUser } from "@/types/auth";
import type { BuyerProfile } from "@/types/dashboard";
import {
  EmptyState,
  inputClass,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
  secondaryButtonClass,
  StatusPill,
} from "./DashboardUI";

type BuyerForm = {
  user: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industries: string;
  geographies: string;
  ebitdaMin: string;
  ebitdaMax: string;
  dealType: string;
  notes: string;
  status: "active" | "paused";
};

const emptyForm: BuyerForm = {
  user: "",
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  industries: "",
  geographies: "",
  ebitdaMin: "",
  ebitdaMax: "",
  dealType: "",
  notes: "",
  status: "active",
};

function profileUserId(value: string | AuthUser) {
  return typeof value === "string" ? value : value.id;
}

function toList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value: string) {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function formFromProfile(profile: BuyerProfile): BuyerForm {
  return {
    user: profileUserId(profile.user),
    companyName: profile.companyName,
    contactName: profile.contactName ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    industries: profile.industries.join(", "),
    geographies: profile.geographies.join(", "),
    ebitdaMin: profile.ebitdaMin?.toString() ?? "",
    ebitdaMax: profile.ebitdaMax?.toString() ?? "",
    dealType: profile.dealType ?? "",
    notes: profile.notes ?? "",
    status: profile.status,
  };
}

function payload(form: BuyerForm, includeUser = false) {
  return {
    ...(includeUser ? { user: form.user } : {}),
    companyName: form.companyName,
    contactName: form.contactName,
    email: form.email,
    phone: form.phone,
    industries: toList(form.industries),
    geographies: toList(form.geographies),
    ebitdaMin: toNumber(form.ebitdaMin),
    ebitdaMax: toNumber(form.ebitdaMax),
    dealType: form.dealType,
    notes: form.notes,
    status: form.status,
  };
}

export default function AdminBuyersPanel() {
  const [profiles, setProfiles] = useState<BuyerProfile[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<BuyerForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState<BuyerForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [profileResponse, userResponse] = await Promise.all([
          apiFetch<{ buyers: BuyerProfile[] }>("/admin/buyers"),
          apiFetch<{ users: AuthUser[] }>("/admin/users?role=buyer"),
        ]);
        if (active) {
          setProfiles(profileResponse.buyers);
          setUsers(userResponse.users);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load buyer records.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const availableUsers = useMemo(() => {
    const linked = new Set(profiles.map((profile) => profileUserId(profile.user)));
    return users.filter((user) => !linked.has(user.id));
  }, [profiles, users]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch<{ buyer: BuyerProfile }>("/admin/buyers", {
        method: "POST",
        body: JSON.stringify(payload(createForm, true)),
      });
      setProfiles((current) => [response.buyer, ...current]);
      setCreateForm(emptyForm);
      setShowCreate(false);
      setSuccess("Buyer profile created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the buyer profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch<{ buyer: BuyerProfile }>(`/admin/buyers/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(payload(editForm)),
      });
      setProfiles((current) =>
        current.map((profile) => (profile._id === response.buyer._id ? response.buyer : profile)),
      );
      setEditingId("");
      setSuccess("Buyer profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the buyer profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(profile: BuyerProfile) {
    if (!window.confirm(`Delete the buyer profile for ${profile.companyName}?`)) return;

    setError("");
    setSuccess("");
    try {
      await apiFetch(`/admin/buyers/${profile._id}`, { method: "DELETE" });
      setProfiles((current) => current.filter((item) => item._id !== profile._id));
      if (editingId === profile._id) setEditingId("");
      setSuccess("Buyer profile deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the buyer profile.");
    }
  }

  const formFields = (
    form: BuyerForm,
    onChange: (next: BuyerForm) => void,
    includeUser: boolean,
  ) => (
    <div className="grid gap-4 sm:grid-cols-2">
      {includeUser && (
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Buyer account
          </span>
          <select
            required
            value={form.user}
            onChange={(event) => onChange({ ...form, user: event.target.value })}
            className={inputClass}
          >
            <option value="">Select a buyer account</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} — {user.email}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Company name
        </span>
        <input
          required
          value={form.companyName}
          onChange={(event) => onChange({ ...form, companyName: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Contact name
        </span>
        <input
          value={form.contactName}
          onChange={(event) => onChange({ ...form, contactName: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Email
        </span>
        <input
          type="email"
          value={form.email}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Phone
        </span>
        <input
          value={form.phone}
          onChange={(event) => onChange({ ...form, phone: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Industries
        </span>
        <input
          value={form.industries}
          onChange={(event) => onChange({ ...form, industries: event.target.value })}
          className={inputClass}
          placeholder="Manufacturing, Healthcare"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Geographies
        </span>
        <input
          value={form.geographies}
          onChange={(event) => onChange({ ...form, geographies: event.target.value })}
          className={inputClass}
          placeholder="Northeast US, UK"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Minimum EBITDA ($m)
        </span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={form.ebitdaMin}
          onChange={(event) => onChange({ ...form, ebitdaMin: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Maximum EBITDA ($m)
        </span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={form.ebitdaMax}
          onChange={(event) => onChange({ ...form, ebitdaMax: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Deal type
        </span>
        <input
          value={form.dealType}
          onChange={(event) => onChange({ ...form, dealType: event.target.value })}
          className={inputClass}
          placeholder="Platform acquisition"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Status
        </span>
        <select
          value={form.status}
          onChange={(event) =>
            onChange({ ...form, status: event.target.value as BuyerForm["status"] })
          }
          className={inputClass}
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Internal notes
        </span>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(event) => onChange({ ...form, notes: event.target.value })}
          className={inputClass}
        />
      </label>
    </div>
  );

  return (
    <div className="grid gap-8">
      <PageIntro
        title="Manage buyers"
        description="Maintain each buyer's investment criteria and keep their acquisition profile current."
      />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <Panel
        title="Buyer profiles"
        description={`${profiles.length} profile${profiles.length === 1 ? "" : "s"} on record`}
        actions={
          <button
            type="button"
            onClick={() => setShowCreate((current) => !current)}
            className={primaryButtonClass}
          >
            {showCreate ? "Close form" : "Create profile"}
          </button>
        }
      >
        {showCreate && (
          <form
            onSubmit={(event) => void handleCreate(event)}
            className="mb-8 grid gap-4 border border-navy-900/10 bg-ivory-50 p-5"
          >
            {availableUsers.length === 0 ? (
              <Notice tone="error">
                Every buyer account already has a profile.{" "}
                <Link href="/dashboard/admin/users" className="underline">
                  Create a buyer account first
                </Link>
                .
              </Notice>
            ) : (
              <>
                {formFields(createForm, setCreateForm, true)}
                <div>
                  <button type="submit" disabled={saving} className={primaryButtonClass}>
                    {saving ? "Creating…" : "Create buyer profile"}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {editingId && (
          <form
            onSubmit={(event) => void handleUpdate(event)}
            className="mb-8 grid gap-4 border border-gold-500/40 bg-gold-100/30 p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-xl text-navy-900">Edit buyer profile</h3>
              <button
                type="button"
                onClick={() => setEditingId("")}
                className={secondaryButtonClass}
              >
                Cancel
              </button>
            </div>
            {formFields(editForm, setEditForm, false)}
            <div>
              <button type="submit" disabled={saving} className={primaryButtonClass}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-charcoal-500">Loading buyer profiles…</p>
        ) : profiles.length === 0 ? (
          <EmptyState>No buyer profiles have been created yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-900/10 text-[10px] uppercase tracking-[0.14em] text-charcoal-500">
                  <th className="pb-3 pr-4 font-semibold">Company</th>
                  <th className="pb-3 pr-4 font-semibold">Account</th>
                  <th className="pb-3 pr-4 font-semibold">Criteria</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => {
                  const account = typeof profile.user === "string" ? null : profile.user;
                  return (
                    <tr key={profile._id} className="border-b border-navy-900/5 align-top">
                      <td className="py-4 pr-4">
                        <p className="font-medium text-navy-900">{profile.companyName}</p>
                        <p className="mt-0.5 text-xs text-charcoal-500">
                          {profile.contactName || "No contact name"}
                        </p>
                      </td>
                      <td className="py-4 pr-4 text-xs text-charcoal-600">
                        {account ? account.name : "Account unavailable"}
                        <br />
                        {account?.email ?? ""}
                      </td>
                      <td className="py-4 pr-4 text-xs text-charcoal-600">
                        {profile.industries.length ? profile.industries.join(", ") : "Any industry"}
                        <br />
                        {profile.ebitdaMin !== undefined || profile.ebitdaMax !== undefined
                          ? `$${profile.ebitdaMin ?? 0}m – $${profile.ebitdaMax ?? "+"}m`
                          : "Any EBITDA"}
                      </td>
                      <td className="py-4 pr-4">
                        <StatusPill value={profile.status} />
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(profile._id);
                              setEditForm(formFromProfile(profile));
                              setShowCreate(false);
                            }}
                            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(profile)}
                            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
