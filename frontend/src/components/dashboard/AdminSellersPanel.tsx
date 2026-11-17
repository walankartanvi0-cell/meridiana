"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import type { AuthUser } from "@/types/auth";
import type { SellerProfile } from "@/types/dashboard";
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

type SellerForm = {
  user: string;
  companyName: string;
  industry: string;
  location: string;
  revenue: string;
  ebitda: string;
  yearFounded: string;
  description: string;
  contactName: string;
  email: string;
  phone: string;
  status: "draft" | "active" | "closed";
};

const emptyForm: SellerForm = {
  user: "",
  companyName: "",
  industry: "",
  location: "",
  revenue: "",
  ebitda: "",
  yearFounded: "",
  description: "",
  contactName: "",
  email: "",
  phone: "",
  status: "draft",
};

function profileUserId(value: string | AuthUser) {
  return typeof value === "string" ? value : value.id;
}

function toNumber(value: string) {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function formFromProfile(profile: SellerProfile): SellerForm {
  return {
    user: profileUserId(profile.user),
    companyName: profile.companyName,
    industry: profile.industry ?? "",
    location: profile.location ?? "",
    revenue: profile.revenue?.toString() ?? "",
    ebitda: profile.ebitda?.toString() ?? "",
    yearFounded: profile.yearFounded?.toString() ?? "",
    description: profile.description ?? "",
    contactName: profile.contactName ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    status: profile.status,
  };
}

function payload(form: SellerForm, includeUser = false) {
  return {
    ...(includeUser ? { user: form.user } : {}),
    companyName: form.companyName,
    industry: form.industry,
    location: form.location,
    revenue: toNumber(form.revenue),
    ebitda: toNumber(form.ebitda),
    yearFounded: toNumber(form.yearFounded),
    description: form.description,
    contactName: form.contactName,
    email: form.email,
    phone: form.phone,
    status: form.status,
  };
}

export default function AdminSellersPanel() {
  const [profiles, setProfiles] = useState<SellerProfile[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<SellerForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState<SellerForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [profileResponse, userResponse] = await Promise.all([
          apiFetch<{ sellers: SellerProfile[] }>("/admin/sellers"),
          apiFetch<{ users: AuthUser[] }>("/admin/users?role=seller"),
        ]);
        if (active) {
          setProfiles(profileResponse.sellers);
          setUsers(userResponse.users);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load seller records.");
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
      const response = await apiFetch<{ seller: SellerProfile }>("/admin/sellers", {
        method: "POST",
        body: JSON.stringify(payload(createForm, true)),
      });
      setProfiles((current) => [response.seller, ...current]);
      setCreateForm(emptyForm);
      setShowCreate(false);
      setSuccess("Seller profile created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the seller profile.");
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
      const response = await apiFetch<{ seller: SellerProfile }>(`/admin/sellers/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(payload(editForm)),
      });
      setProfiles((current) =>
        current.map((profile) => (profile._id === response.seller._id ? response.seller : profile)),
      );
      setEditingId("");
      setSuccess("Seller profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the seller profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(profile: SellerProfile) {
    if (!window.confirm(`Delete the seller profile for ${profile.companyName}?`)) return;

    setError("");
    setSuccess("");
    try {
      await apiFetch(`/admin/sellers/${profile._id}`, { method: "DELETE" });
      setProfiles((current) => current.filter((item) => item._id !== profile._id));
      if (editingId === profile._id) setEditingId("");
      setSuccess("Seller profile deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the seller profile.");
    }
  }

  const formFields = (
    form: SellerForm,
    onChange: (next: SellerForm) => void,
    includeUser: boolean,
  ) => (
    <div className="grid gap-4 sm:grid-cols-2">
      {includeUser && (
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Seller account
          </span>
          <select
            required
            value={form.user}
            onChange={(event) => onChange({ ...form, user: event.target.value })}
            className={inputClass}
          >
            <option value="">Select a seller account</option>
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
          Industry
        </span>
        <input
          value={form.industry}
          onChange={(event) => onChange({ ...form, industry: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Location
        </span>
        <input
          value={form.location}
          onChange={(event) => onChange({ ...form, location: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Revenue ($m)
        </span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={form.revenue}
          onChange={(event) => onChange({ ...form, revenue: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          EBITDA ($m)
        </span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={form.ebitda}
          onChange={(event) => onChange({ ...form, ebitda: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Year founded
        </span>
        <input
          type="number"
          min="1800"
          max="2100"
          value={form.yearFounded}
          onChange={(event) => onChange({ ...form, yearFounded: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Status
        </span>
        <select
          value={form.status}
          onChange={(event) =>
            onChange({ ...form, status: event.target.value as SellerForm["status"] })
          }
          className={inputClass}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
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
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Business description
        </span>
        <textarea
          rows={3}
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
          className={inputClass}
        />
      </label>
    </div>
  );

  return (
    <div className="grid gap-8">
      <PageIntro
        title="Manage sellers"
        description="Review client business profiles, financial headline figures and engagement status."
      />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <Panel
        title="Seller profiles"
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
                Every seller account already has a profile.{" "}
                <Link href="/dashboard/admin/users" className="underline">
                  Create a seller account first
                </Link>
                .
              </Notice>
            ) : (
              <>
                {formFields(createForm, setCreateForm, true)}
                <div>
                  <button type="submit" disabled={saving} className={primaryButtonClass}>
                    {saving ? "Creating…" : "Create seller profile"}
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
              <h3 className="font-display text-xl text-navy-900">Edit seller profile</h3>
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
          <p className="text-sm text-charcoal-500">Loading seller profiles…</p>
        ) : profiles.length === 0 ? (
          <EmptyState>No seller profiles have been created yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-900/10 text-[10px] uppercase tracking-[0.14em] text-charcoal-500">
                  <th className="pb-3 pr-4 font-semibold">Company</th>
                  <th className="pb-3 pr-4 font-semibold">Account</th>
                  <th className="pb-3 pr-4 font-semibold">Headline figures</th>
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
                          {profile.industry || "Industry not set"}
                          {profile.location ? ` · ${profile.location}` : ""}
                        </p>
                      </td>
                      <td className="py-4 pr-4 text-xs text-charcoal-600">
                        {account ? account.name : "Account unavailable"}
                        <br />
                        {account?.email ?? ""}
                      </td>
                      <td className="py-4 pr-4 text-xs text-charcoal-600">
                        Revenue: ${profile.revenue ?? "—"}m
                        <br />
                        EBITDA: ${profile.ebitda ?? "—"}m
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
