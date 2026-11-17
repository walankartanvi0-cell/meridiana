import type { ReactNode } from "react";

export const inputClass =
  "w-full border border-navy-900/15 bg-white px-3 py-2.5 text-sm text-navy-900 outline-none transition-colors placeholder:text-charcoal-500/50 focus:border-gold-500";

export const primaryButtonClass =
  "bg-navy-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "border border-navy-900/20 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-900 transition-colors hover:border-gold-500 hover:text-gold-600 disabled:cursor-not-allowed disabled:opacity-60";

export function PageIntro({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-600">
        Workspace
      </p>
      <h1 className="mt-3 font-display text-4xl text-navy-900">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-charcoal-600">{description}</p>
    </header>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 border border-navy-900/10 bg-white shadow-[0_20px_60px_-45px_rgba(10,25,47,0.5)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-navy-900/10 px-6 py-5">
        <div>
          <h2 className="font-display text-2xl text-navy-900">{title}</h2>
          {description && <p className="mt-1 text-xs leading-6 text-charcoal-500">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export function Notice({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p
      role="status"
      className={`border-l-2 px-4 py-3 text-sm ${
        tone === "error"
          ? "border-red-600 bg-red-50 text-red-800"
          : "border-gold-500 bg-gold-100/50 text-navy-900"
      }`}
    >
      {children}
    </p>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | string;
  detail?: string;
}) {
  return (
    <div className="border border-navy-900/10 bg-ivory-50 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-charcoal-500">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl text-navy-900">{value}</p>
      {detail && <p className="mt-2 text-xs text-charcoal-500">{detail}</p>}
    </div>
  );
}

export function StatusPill({ value }: { value: string }) {
  const current = value.toLowerCase();
  const positive = ["active", "read", "signed", "completed", "done"].includes(current);
  const negative = ["declined", "expired", "cancelled", "high", "overdue"].includes(current);
  const warning = [
    "draft",
    "paused",
    "suspended",
    "closed",
    "requested",
    "under review",
    "scheduled",
    "in progress",
    "to do",
    "medium",
  ].includes(current);

  return (
    <span
      className={`inline-flex px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${
        positive
          ? "bg-emerald-50 text-emerald-700"
          : negative
            ? "bg-red-50 text-red-700"
            : warning
              ? "bg-amber-50 text-amber-700"
              : "bg-navy-900/5 text-charcoal-600"
      }`}
    >
      {value}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="border border-dashed border-navy-900/15 px-4 py-8 text-center text-sm text-charcoal-500">
      {children}
    </p>
  );
}

/** Stable ISO formatting avoids timezone differences during prerender and hydration. */
export function formatDate(iso?: string) {
  if (!iso) return "—";
  const date = iso.slice(0, 10);
  const time = iso.length >= 16 ? iso.slice(11, 16) : "";
  return time ? `${date} ${time} UTC` : date;
}
