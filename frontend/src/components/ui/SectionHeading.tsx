import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
  className = "",
}: Props) {
  const centered = align === "center";

  return (
    <div
      className={`${centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"} ${className}`}
    >
      {eyebrow && (
        <div
          className={`mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] ${
            light ? "text-gold-400" : "text-gold-600"
          } ${centered ? "justify-center" : ""}`}
        >
          <span className="h-px w-8 bg-current opacity-70" />
          {eyebrow}
        </div>
      )}
      <h2
        className={`font-display text-4xl font-medium leading-[1.12] sm:text-5xl ${
          light ? "text-white" : "text-navy-900"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-6 text-base leading-7 ${
            light ? "text-ivory-200/80" : "text-charcoal-500"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
