import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "outline" | "light" | "ghost" | "dark";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-[0_10px_30px_-12px_rgba(200,164,92,0.8)]",
  outline:
    "border border-gold-500/70 text-gold-400 hover:border-gold-300 hover:bg-gold-500/10",
  light: "bg-white text-navy-900 hover:bg-ivory-100",
  ghost: "border border-navy-900/20 text-navy-900 hover:border-gold-500 hover:text-gold-600",
  dark: "bg-navy-900 text-white hover:bg-navy-800",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-[13px]",
  lg: "px-8 py-4 text-sm",
};

export function buttonStyles(variant: Variant = "primary", size: Size = "md") {
  return `inline-flex items-center justify-center gap-2 rounded-sm font-semibold uppercase tracking-[0.14em] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 ${variants[variant]} ${sizes[size]}`;
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  const classes = `${buttonStyles(variant, size)} ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`;

  if (href) {
    if (href.startsWith("http")) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
