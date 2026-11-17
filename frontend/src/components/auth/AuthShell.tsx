import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/layout/Logo";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-navy-950">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-navy-950 px-12 py-14 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-navy-700/40 blur-3xl" />

          <div className="relative">
            <Logo light />
          </div>

          <div className="relative max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-400">
              Private client portal
            </p>
            <p className="mt-6 font-display text-4xl leading-tight text-ivory-50">
              Every transaction needs a clear line of sight.
            </p>
            <div className="mt-8 h-px w-16 bg-gold-500" />
            <p className="mt-8 text-sm leading-7 text-ivory-200/70">
              Securely manage opportunities, documents, meetings and transaction progress in one
              confidential workspace.
            </p>
          </div>

          <p className="relative text-[10px] uppercase tracking-[0.18em] text-ivory-200/40">
            Confidential by design
          </p>
        </section>

        <section className="flex flex-col bg-ivory-50">
          <div className="flex items-center justify-between px-6 py-6 lg:px-14">
            <div className="lg:hidden">
              <Logo />
            </div>
            <Link
              href="/"
              className="ml-auto text-[11px] font-semibold uppercase tracking-[0.16em] text-charcoal-500 transition-colors hover:text-gold-600"
            >
              Back to website
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 pb-14 lg:px-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-600">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl text-navy-900 sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-charcoal-600">{description}</p>

            <div className="mt-10">{children}</div>
            <div className="mt-8 border-t border-navy-900/10 pt-6 text-sm text-charcoal-600">
              {footer}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
