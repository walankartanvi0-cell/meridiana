"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";

type Fields = {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
};

const emptyFields: Fields = { name: "", email: "", company: "", subject: "", message: "" };

const inputClass =
  "w-full border border-navy-900/15 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-colors placeholder:text-charcoal-500/50 focus:border-gold-500";

export default function ContactForm() {
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const update = (key: keyof Fields) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((current) => ({ ...current, [key]: event.target.value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      await apiFetch<{ message: string }>("/contact", {
        method: "POST",
        body: JSON.stringify(fields),
        skipAuth: true,
      });
      setStatus("success");
      setFeedback("Thank you. Your message has been received and we will respond shortly.");
      setFields(emptyFields);
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Unable to send your message.");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-gold-500/40 bg-gold-100/40 p-10">
        <p className="font-display text-3xl text-navy-900">Message received.</p>
        <p className="mt-4 text-sm leading-7 text-charcoal-700">{feedback}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-600 hover:text-navy-900"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
            Full name *
          </span>
          <input required value={fields.name} onChange={update("name")} className={inputClass} placeholder="Jane Morgan" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
            Email address *
          </span>
          <input required type="email" value={fields.email} onChange={update("email")} className={inputClass} placeholder="jane@company.com" />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
            Company
          </span>
          <input value={fields.company} onChange={update("company")} className={inputClass} placeholder="Company name" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
            Subject *
          </span>
          <input required value={fields.subject} onChange={update("subject")} className={inputClass} placeholder="How can we help?" />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900">
          Message *
        </span>
        <textarea required rows={6} value={fields.message} onChange={update("message")} className={inputClass} placeholder="Tell us a little about your situation..." />
      </label>

      {status === "error" && (
        <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">
          {feedback}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="justify-self-start bg-navy-900 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
