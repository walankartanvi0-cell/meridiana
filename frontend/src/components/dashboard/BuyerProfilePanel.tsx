"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import type { BuyerProfile } from "@/types/dashboard";
import {
  inputClass,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
  StatusPill,
} from "./DashboardUI";

type BuyerForm = {
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
};

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
  };
}

export default function BuyerProfilePanel() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [form, setForm] = useState<BuyerForm>({
    companyName: user?.company ?? "",
    contactName: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    industries: "",
    geographies: "",
    ebitdaMin: "",
    ebitdaMax: "",
    dealType: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await apiFetch<{ profile: BuyerProfile | null }>("/account/buyer");
        if (active && response.profile) {
          setProfile(response.profile);
          setForm(formFromProfile(response.profile));
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load your profile.");
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
      const response = await apiFetch<{ profile: BuyerProfile }>("/account/buyer", {
        method: "PUT",
        body: JSON.stringify({
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
        }),
      });
      setProfile(response.profile);
      setForm(formFromProfile(response.profile));
      setSuccess("Your buyer profile has been saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8">
      <PageIntro
        title="Buyer profile"
        description="Tell us what you are looking for. Your advisor uses these criteria to identify suitable opportunities."
      />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <Panel
        title="Current status"
        description="Your acquisition criteria are shared internally with the Meridiana team."
      >
        {loading ? (
          <p className="text-sm text-charcoal-500">Loading profile…</p>
        ) : profile ? (
          <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-600">
            <StatusPill value={profile.status} />
            <span>{profile.companyName}</span>
            <span className="text-charcoal-400">·</span>
            <span>{profile.industries.length ? profile.industries.join(", ") : "No industries set"}</span>
          </div>
        ) : (
          <p className="text-sm text-charcoal-500">
            No profile saved yet. Complete the form below to create one.
          </p>
        )}
      </Panel>

      <Panel title="Investment criteria" description="Separate multiple industries or locations with commas.">
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
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Phone
              </span>
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Deal type
              </span>
              <input
                value={form.dealType}
                onChange={(event) => setForm({ ...form, dealType: event.target.value })}
                className={inputClass}
                placeholder="Platform acquisition"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Industries
              </span>
              <input
                value={form.industries}
                onChange={(event) => setForm({ ...form, industries: event.target.value })}
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
                onChange={(event) => setForm({ ...form, geographies: event.target.value })}
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
                onChange={(event) => setForm({ ...form, ebitdaMin: event.target.value })}
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
                onChange={(event) => setForm({ ...form, ebitdaMax: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Additional notes
              </span>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className={inputClass}
              />
            </label>
          </div>
          <div>
            <button type="submit" disabled={saving} className={primaryButtonClass}>
              {saving ? "Saving…" : "Save buyer profile"}
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
