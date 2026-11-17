"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import { ROLE_LABELS, type AuthUser } from "@/types/auth";
import {
  inputClass,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
} from "./DashboardUI";

export default function AccountSettingsPanel() {
  const { user, refresh } = useAuth();
  const [details, setDetails] = useState({
    name: user?.name ?? "",
    company: user?.company ?? "",
    title: user?.title ?? "",
    phone: user?.phone ?? "",
  });
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) return null;

  async function handleDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingDetails(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch<{ user: AuthUser }>("/account/profile", {
        method: "PATCH",
        body: JSON.stringify(details),
      });
      await refresh();
      setDetails({
        name: response.user.name,
        company: response.user.company ?? "",
        title: response.user.title ?? "",
        phone: response.user.phone ?? "",
      });
      setSuccess("Your account details have been saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your details.");
    } finally {
      setSavingDetails(false);
    }
  }

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch("/account/password", {
        method: "POST",
        body: JSON.stringify(password),
      });
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Your password has been changed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change your password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="grid gap-8">
      <PageIntro
        title="Account settings"
        description="Update the details used across your workspace and keep your password secure."
      />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Your details" description="These details identify you inside Meridiana.">
          <form onSubmit={handleDetails} className="grid gap-4">
            <div className="border border-navy-900/10 bg-ivory-50 px-4 py-3 text-xs text-charcoal-600">
              <p>
                <span className="font-semibold text-navy-900">Email:</span> {user.email}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-navy-900">Role:</span> {ROLE_LABELS[user.role]}
              </p>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Full name
              </span>
              <input
                required
                value={details.name}
                onChange={(event) => setDetails({ ...details, name: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Company
              </span>
              <input
                value={details.company}
                onChange={(event) => setDetails({ ...details, company: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Job title
              </span>
              <input
                value={details.title}
                onChange={(event) => setDetails({ ...details, title: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Phone
              </span>
              <input
                value={details.phone}
                onChange={(event) => setDetails({ ...details, phone: event.target.value })}
                className={inputClass}
              />
            </label>
            <div>
              <button type="submit" disabled={savingDetails} className={primaryButtonClass}>
                {savingDetails ? "Saving…" : "Save details"}
              </button>
            </div>
          </form>
        </Panel>

        <Panel title="Change password" description="Use at least 8 characters, including a letter and a number.">
          <form onSubmit={handlePassword} className="grid gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Current password
              </span>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password.currentPassword}
                onChange={(event) =>
                  setPassword({ ...password, currentPassword: event.target.value })
                }
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                New password
              </span>
              <input
                required
                minLength={8}
                type="password"
                autoComplete="new-password"
                value={password.newPassword}
                onChange={(event) => setPassword({ ...password, newPassword: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Confirm new password
              </span>
              <input
                required
                minLength={8}
                type="password"
                autoComplete="new-password"
                value={password.confirmPassword}
                onChange={(event) =>
                  setPassword({ ...password, confirmPassword: event.target.value })
                }
                className={inputClass}
              />
            </label>
            <div>
              <button type="submit" disabled={savingPassword} className={primaryButtonClass}>
                {savingPassword ? "Changing…" : "Change password"}
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
