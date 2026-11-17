"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DASHBOARD_SECTIONS } from "@/lib/dashboard";
import { ROLE_HOME, ROLE_LABELS } from "@/types/auth";
import Logo from "@/components/layout/Logo";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const sections = DASHBOARD_SECTIONS[user.role];
  const roleLabel = ROLE_LABELS[user.role];

  async function handleSignOut() {
    setSigningOut(true);
    await logout();
    router.replace("/");
  }

  const signOutClass =
    "w-full border border-ivory-200/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory-100 transition-colors hover:border-gold-500 hover:text-gold-400 disabled:opacity-50";

  return (
    <div className="min-h-screen bg-ivory-50 text-navy-900">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-navy-950/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r border-navy-900/10 bg-navy-950 px-6 py-8 transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Logo light href={ROLE_HOME[user.role]} />

        <div className="mt-8 border-y border-ivory-200/10 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory-200/40">
            Signed in as
          </p>
          <p className="mt-2 truncate font-display text-xl text-ivory-50">{user.name}</p>
          <span className="mt-3 inline-flex border border-gold-500/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-400">
            {roleLabel}
          </span>
        </div>

        <nav className="mt-6 grid gap-1" aria-label="Dashboard navigation">
          {sections.map((section) => {
            const active = pathname === section.href;
            return (
              <Link
                key={section.label}
                href={section.href}
                onClick={() => setSidebarOpen(false)}
                className={`border-l-2 px-4 py-2.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "border-gold-500 bg-ivory-200/5 text-ivory-50"
                    : "border-transparent text-ivory-200/60 hover:border-gold-500 hover:text-ivory-50"
                }`}
              >
                {section.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/"
          className="mt-6 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory-200/50 transition-colors hover:text-gold-400"
        >
          Public website
        </Link>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          className={`mt-auto ${signOutClass}`}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </aside>

      <div className="lg:pl-72">
        <header className="flex h-20 items-center justify-between border-b border-navy-900/10 bg-white px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center border border-navy-900/15 text-navy-900 lg:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                Meridiana portal
              </p>
              <p className="mt-1 font-display text-xl text-navy-900">{roleLabel} workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-navy-900">{user.name}</p>
              <p className="text-xs text-charcoal-500">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
              className="border border-navy-900/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900 transition-colors hover:border-gold-500 hover:text-gold-600 disabled:opacity-50 lg:hidden"
            >
              {signingOut ? "…" : "Sign out"}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
