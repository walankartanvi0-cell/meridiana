"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Logo from "@/components/layout/Logo";
import { ROLE_HOME, ROLE_LABELS } from "@/types/auth";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  const home = ROLE_HOME[user.role];
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-navy-900/10 bg-navy-950 px-6 py-8 lg:flex">
        <Logo light href={home} />

        <div className="mt-10 border-y border-ivory-200/10 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory-200/40">
            Signed in as
          </p>
          <p className="mt-2 truncate font-display text-xl text-ivory-50">{user.name}</p>
          <span className="mt-3 inline-flex border border-gold-500/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-400">
            {roleLabel}
          </span>
        </div>

        <nav className="mt-8 grid gap-2" aria-label="Dashboard navigation">
          <Link
            href={home}
            className="border-l-2 border-gold-500 bg-ivory-200/5 px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ivory-50"
          >
            Overview
          </Link>
          <Link
            href="/"
            className="border-l-2 border-transparent px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ivory-200/60 transition-colors hover:border-gold-500 hover:text-ivory-50"
          >
            Public website
          </Link>
        </nav>

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
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
              Meridiana portal
            </p>
            <p className="mt-1 font-display text-xl text-navy-900">{roleLabel} workspace</p>
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
