import { ROLE_LABELS, type UserRole } from "@/types/auth";

type OverviewPlaceholderProps = {
  role: UserRole;
  title: string;
  intro: string;
  sections: string[];
};

export default function OverviewPlaceholder({
  role,
  title,
  intro,
  sections,
}: OverviewPlaceholderProps) {
  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-600">
        {ROLE_LABELS[role]} overview
      </p>
      <h1 className="mt-4 font-display text-4xl text-navy-900">{title}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-charcoal-600">{intro}</p>

      <div className="mt-10 border border-navy-900/10 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(10,25,47,0.45)]">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center border border-gold-500/50 font-display text-lg text-gold-600">
            01
          </span>
          <div>
            <h2 className="font-display text-2xl text-navy-900">Your secure workspace</h2>
            <p className="mt-1 text-xs text-charcoal-500">
              Authentication and role-based access are active. Feature modules are added in the next
              build stage.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section}
              className="flex items-center justify-between border border-navy-900/10 bg-ivory-50 px-4 py-3"
            >
              <span className="text-[12px] font-medium text-navy-900">{section}</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-charcoal-500">
                Next
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
