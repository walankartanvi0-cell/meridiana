"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "./AuthProvider";
import { ROLE_HOME } from "@/types/auth";

const inputClass =
  "w-full border border-navy-900/15 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-colors placeholder:text-charcoal-500/50 focus:border-gold-500";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");

    try {
      const user = await login({ email, password });
      router.replace(ROLE_HOME[user.role]);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
          Email address
        </span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
          placeholder="you@company.com"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
          Password
        </span>
        <span className="relative block">
          <input
            required
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal-500 transition-colors hover:text-gold-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>

      {feedback && (
        <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">
          {feedback}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 bg-navy-900 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-xs leading-6 text-charcoal-500">
        Need an account? Buyers and sellers can{" "}
        <Link href="/register" className="font-semibold text-gold-600 hover:text-navy-900">
          register here
        </Link>
        . Administrator and advisor accounts are created by an administrator.
      </p>
    </form>
  );
}
