"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  ebitdaRange: string;
  interest: string;
  message: string;
  consent: boolean;
};

const emptyFields: Fields = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  role: "",
  ebitdaRange: "",
  interest: "",
  message: "",
  consent: false,
};

const inputClass =
  "w-full border border-navy-900/15 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-colors placeholder:text-charcoal-500/50 focus:border-gold-500";

const labelClass = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900";

export default function ConsultationForm() {
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const update =
    (key: keyof Fields) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.type === "checkbox" ? (event.target as HTMLInputElement).checked : event.target.value;
      setFields((current) => ({ ...current, [key]: value }));
    };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fields.consent) {
      setStatus("error");
      setFeedback("Please confirm that you are happy for us to contact you.");
      return;
    }

    setStatus("sending");
    setFeedback("");
    try {
      await apiFetch<{ message: string }>("/consultations", {
        method: "POST",
        body: JSON.stringify(fields),
        skipAuth: true,
      });
      setStatus("success");
      setFeedback(
        "Thank you. Your request has been received. A member of our team will be in touch within one business day.",
      );
      setFields(emptyFields);
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Unable to submit your request.");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-gold-500/40 bg-gold-100/40 p-10">
        <p className="font-display text-3xl text-navy-900">Your request is with us.</p>
        <p className="mt-4 text-sm leading-7 text-charcoal-700">{feedback}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-600 hover:text-navy-900"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={labelClass}>First name *</span>
          <input required value={fields.firstName} onChange={update("firstName")} className={inputClass} placeholder="Jane" />
        </label>
        <label>
          <span className={labelClass}>Last name *</span>
          <input required value={fields.lastName} onChange={update("lastName")} className={inputClass} placeholder="Morgan" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Email address *</span>
          <input required type="email" value={fields.email} onChange={update("email")} className={inputClass} placeholder="jane@company.com" />
        </label>
        <label>
          <span className={labelClass}>Phone number</span>
          <input type="tel" value={fields.phone} onChange={update("phone")} className={inputClass} placeholder="+1 212 555 0100" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Company *</span>
          <input required value={fields.company} onChange={update("company")} className={inputClass} placeholder="Company name" />
        </label>
        <label>
          <span className={labelClass}>Your role *</span>
          <select required value={fields.role} onChange={update("role")} className={inputClass}>
            <option value="">Select a role</option>
            <option value="owner">Owner / Founder</option>
            <option value="executive">Executive / Management</option>
            <option value="board">Board Member</option>
            <option value="buyer">Buyer / Investor</option>
            <option value="advisor">Advisor / Intermediary</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={labelClass}>EBITDA range *</span>
          <select required value={fields.ebitdaRange} onChange={update("ebitdaRange")} className={inputClass}>
            <option value="">Select a range</option>
            <option value="under-2">Under $2 million</option>
            <option value="2-5">$2 million – $5 million</option>
            <option value="5-10">$5 million – $10 million</option>
            <option value="over-10">Over $10 million</option>
            <option value="unsure">Not sure yet</option>
          </select>
        </label>
        <label>
          <span className={labelClass}>Nature of interest *</span>
          <select required value={fields.interest} onChange={update("interest")} className={inputClass}>
            <option value="">Select an option</option>
            <option value="sell-side">Selling my business</option>
            <option value="buy-side">Acquiring a business</option>
            <option value="strategic">Strategic / capital structure advice</option>
            <option value="exploratory">Exploratory conversation</option>
          </select>
        </label>
      </div>

      <label>
        <span className={labelClass}>Anything else we should know?</span>
        <textarea rows={5} value={fields.message} onChange={update("message")} className={inputClass} placeholder="Share a little context about your objectives and timing..." />
      </label>

      <label className="flex items-start gap-3 text-sm leading-6 text-charcoal-700">
        <input type="checkbox" checked={fields.consent} onChange={update("consent")} className="mt-1.5 h-4 w-4 accent-gold-600" />
        <span>I agree that Meridiana may contact me about this enquiry. All information shared is treated as confidential.</span>
      </label>

      {status === "error" && (
        <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">
          {feedback}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="justify-self-start bg-gold-500 px-9 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Submitting…" : "Request Consultation"}
      </button>
    </form>
  );
}
