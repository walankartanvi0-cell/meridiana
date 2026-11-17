"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import type { SellerProfile } from "@/types/dashboard";
import {
  inputClass,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
  StatusPill,
} from "./DashboardUI";

type SellerForm = {
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
};

function toNumber(value: string) {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function formFromProfile(profile: SellerProfile): SellerForm {
  return {
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
  };
}

export default function SellerBusinessProfilePanel() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [form, setForm] = useState<SellerForm>({
    companyName: user?.company ?? "",
    industry: "",
    location: "",
    revenue: "",
    ebitda: "",
    yearFounded: "",
    description: "",
    contactName: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await apiFetch<{ profile: SellerProfile | null }>("/account/seller");
        if (active && response.profile) {
          setProfile(response.profile);
          setForm(formFromProfile(response.profile));
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load your business profile.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch<{ profile: SellerProfile }>("/account/seller", {
        method: "PUT",
        body: JSON.stringify({
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
        }),
      });
      setProfile(response.profile);
      setForm(formFromProfile(response.profile));
      setSuccess("Your business profile has been saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your business profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8">
      <PageIntro
        title="Business profile"
        description="Share the headline details of your company so we can prepare a considered sale strategy."
      />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <Panel
        title="Current status"
        description="This information is only visible to your Meridiana advisory team."
      >
        {loading ? (
          <p className="text-sm text-charcoal-500">Loading profile…</p>
        ) : profile ? (
          <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-600">
            <StatusPill value={profile.status} />
            <span>{profile.companyName}</span>
            <span className="text-charcoal-500">·</span>
            <span>{profile.industry || "Industry not set"}</span>
          </div>
        ) : (
          <p className="text-sm text-charcoal-500">
            No business profile saved yet. Complete the form below to create one.
          </p>
        )}
      </Panel>

      <Panel title="Company details" description="Financial figures are stored in millions of dollars.">
        <form onSubmit={handleSave} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Company name
              </span>
              <input
                required
                value={form.companyName}
                onChange={(event) => setForm({ ...form, companyName: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Industry
              </span>
              <input
                value={form.industry}
                onChange={(event) => setForm({ ...form, industry: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Location
              </span>
              <input
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
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
                onChange={(event) => setForm({ ...form, revenue: event.target.value })}
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
                onChange={(event) => setForm({ ...form, ebitda: event.target.value })}
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
                onChange={(event) => setForm({ ...form, yearFounded: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Contact name
              </span>
              <input
                value={form.contactName}
                onChange={(event) => setForm({ ...form, contactName: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Contact email
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Phone
              </span>
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Business description
              </span>
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className={inputClass}
              />
            </label>
          </div>
          <div>
            <button type="submit" disabled={saving} className={primaryButtonClass}>
              {saving ? "Saving…" : "Save business profile"}
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
