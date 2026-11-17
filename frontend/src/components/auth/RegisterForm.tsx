"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "./AuthProvider";
import { ROLE_HOME, type PublicRegistrationRole } from "@/types/auth";

const inputClass =
  "w-full border border-navy-900/15 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-colors placeholder:text-charcoal-500/50 focus:border-gold-500";

const roleOptions: { value: PublicRegistrationRole; title: string; description: string }[] = [
  {
    value: "seller",
    title: "Seller",
    description: "I am exploring a sale or recapitalisation of my company.",
  },
  {
    value: "buyer",
    title: "Buyer",
    description: "I am looking to acquire lower-middle-market businesses.",
  },
];

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [role, setRole] = useState<PublicRegistrationRole>("seller");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");

    try {
      const user = await register({ name, email, company, phone, password, role });
      router.replace(ROLE_HOME[user.role]);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to create your account.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <fieldset>
        <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
          I am registering as
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {roleOptions.map((option) => {
            const selected = role === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                aria-pressed={selected}
                className={`border p-4 text-left transition-all ${
                  selected
                    ? "border-gold-500 bg-gold-100/40 shadow-[0_10px_30px_-18px_rgba(200,164,92,0.8)]"
                    : "border-navy-900/15 bg-white hover:border-gold-500/60"
                }`}
              >
                <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  {option.title}
                </span>
                <span className="mt-2 block text-xs leading-5 text-charcoal-500">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
            Full name
          </span>
          <input
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            placeholder="Jane Morgan"
          />
        </label>
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
            placeholder="jane@company.com"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
            Company <span className="normal-case tracking-normal text-charcoal-500">(optional)</span>
          </span>
          <input
            autoComplete="organization"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className={inputClass}
            placeholder="Company name"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
            Phone <span className="normal-case tracking-normal text-charcoal-500">(optional)</span>
          </span>
          <input
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClass}
            placeholder="+1 212 555 0148"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
            Password
          </span>
          <span className="relative block">
            <input
              required
              minLength={8}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
              placeholder="8+ characters"
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
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
            Confirm password
          </span>
          <input
            required
            minLength={8}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={inputClass}
            placeholder="Repeat your password"
          />
        </label>
      </div>

      <p className="text-xs leading-6 text-charcoal-500">
        Use at least 8 characters, including one letter and one number.
      </p>

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
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
