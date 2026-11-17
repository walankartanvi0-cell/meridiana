"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { mainNavigation } from "@/lib/site";
import Logo from "./Logo";

export default function Header() {
  const pathname = usePathname();
  // The menu is "open" only while it belongs to the current page.
  // Navigating to another page automatically closes it – no effect needed.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const mobileOpen = menuPath === pathname;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50">
      {/* Thin utility strip */}
      <div className="hidden bg-navy-950 text-ivory-200/80 md:block">
        <div className="container-wide flex h-9 items-center justify-between text-[10px] font-medium uppercase tracking-[0.18em]">
          <span>Confidential advice for the lower middle market</span>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="transition-colors hover:text-gold-400">
              Contact
            </Link>
            <span className="h-3 w-px bg-white/20" />
            <Link href="/login" className="transition-colors hover:text-gold-400">
              Client Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="border-b border-navy-900/10 bg-ivory-50/95 backdrop-blur-md">
        <div className="container-wide flex h-[76px] items-center justify-between gap-8">
          <Logo />

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {mainNavigation.map((item) => {
              const active = isActive(item.href);
              if (!item.children) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative py-2 text-[13px] font-medium transition-colors ${
                      active ? "text-gold-600" : "text-navy-900 hover:text-gold-600"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute -bottom-0.5 left-0 h-px w-full bg-gold-500" />
                    )}
                  </Link>
                );
              }

              return (
                <div key={item.href} className="group relative py-2">
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
                      active ? "text-gold-600" : "text-navy-900 hover:text-gold-600"
                    }`}
                  >
                    {item.label}
                    <svg viewBox="0 0 10 6" className="h-1.5 w-2.5" fill="none" stroke="currentColor">
                      <path d="M1 1l4 4 4-4" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </Link>
                  <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 translate-y-2 border border-navy-900/10 bg-white p-2 opacity-0 shadow-elevated transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-4 py-2.5 text-[13px] transition-colors hover:bg-ivory-100 ${
                          pathname === child.href ? "text-gold-600" : "text-navy-900"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/consultation"
              className="hidden bg-navy-900 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-navy-800 sm:inline-flex"
            >
              Request a Consultation
            </Link>
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMenuPath(mobileOpen ? null : pathname)}
              className="flex h-10 w-10 items-center justify-center border border-navy-900/15 text-navy-900 lg:hidden"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto border-b border-navy-900/10 bg-white shadow-elevated lg:hidden">
          <div className="container-wide py-6" onClick={() => setMenuPath(null)}>
            {mainNavigation.map((item) => (
              <div key={item.href} className="border-b border-navy-900/10 py-3">
                <Link
                  href={item.href}
                  className={`block font-display text-xl ${isActive(item.href) ? "text-gold-600" : "text-navy-900"}`}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="mt-2 grid gap-1 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="py-1 text-[13px] text-charcoal-500 hover:text-gold-600"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-6 grid gap-3">
              <Link
                href="/consultation"
                className="bg-gold-500 px-6 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-navy-950"
              >
                Request a Consultation
              </Link>
              <Link
                href="/login"
                className="border border-navy-900/20 px-6 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-navy-900"
              >
                Client Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
