import Link from "next/link";

export default function Logo({
  light = false,
  href = "/",
}: {
  light?: boolean;
  href?: string;
}) {
  return (
    <Link href={href} className="group inline-flex items-center gap-3" aria-label="Meridiana home">
      <svg
        viewBox="0 0 44 44"
        className={`h-10 w-10 shrink-0 ${light ? "text-gold-400" : "text-gold-600"}`}
        fill="none"
        aria-hidden="true"
      >
        <circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="1" opacity="0.55" />
        <path d="M22 2v40" stroke="currentColor" strokeWidth="0.75" opacity="0.35" />
        <path d="M9 30l7-16 6 10 6-10 7 16" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <circle cx="22" cy="22" r="2" fill="currentColor" />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[22px] font-semibold tracking-[0.19em] transition-colors ${
            light ? "text-white group-hover:text-gold-300" : "text-navy-900 group-hover:text-gold-600"
          }`}
        >
          MERIDIANA
        </span>
        <span
          className={`mt-1.5 text-[8px] font-semibold uppercase tracking-[0.34em] ${
            light ? "text-gold-400/80" : "text-charcoal-500"
          }`}
        >
          M&amp;A Advisory
        </span>
      </span>
    </Link>
  );
}
