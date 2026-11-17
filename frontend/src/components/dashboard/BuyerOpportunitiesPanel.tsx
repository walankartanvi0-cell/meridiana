"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  STAGE_LABELS,
  dealHref,
  formatMoneyMillions,
  stageTone,
} from "@/lib/deals";
import type { Deal } from "@/types/deals";
import {
  EmptyState,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
  secondaryButtonClass,
} from "./DashboardUI";

type Mode = "available" | "saved" | "all";

const copy: Record<Mode, { title: string; description: string; empty: string }> = {
  available: {
    title: "Available opportunities",
    description: "Live mandates matched to buyer criteria and open for consideration.",
    empty: "No opportunities are available right now. Check back as new mandates are released.",
  },
  saved: {
    title: "Saved opportunities",
    description: "Opportunities you have shortlisted for closer review.",
    empty: "You have not saved any opportunities yet.",
  },
  all: {
    title: "Deal details",
    description: "Open an opportunity to review the full transaction summary.",
    empty: "No deal details are available for your account yet.",
  },
};

export default function BuyerOpportunitiesPanel({ mode }: { mode: Mode }) {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        if (mode === "all") {
          const [availableResponse, savedResponse] = await Promise.all([
            apiFetch<{ deals: Deal[] }>("/deals/available"),
            apiFetch<{ deals: Deal[] }>("/deals/saved"),
          ]);
          const merged = new Map<string, Deal>();
          for (const deal of [...availableResponse.deals, ...savedResponse.deals]) {
            merged.set(deal._id, deal);
          }
          if (active) setDeals([...merged.values()]);
          return;
        }

        const response = await apiFetch<{ deals: Deal[] }>(
          mode === "saved" ? "/deals/saved" : "/deals/available",
        );
        if (active) setDeals(response.deals);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load opportunities.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [mode]);

  async function handleToggle(deal: Deal) {
    if (!user) return;

    const isSaved = deal.savedBy.includes(user.id);
    setBusyId(deal._id);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/deals/${deal._id}/save`, {
        method: isSaved ? "DELETE" : "POST",
      });
      setDeals((current) => {
        if (mode === "saved" && isSaved) {
          return current.filter((item) => item._id !== deal._id);
        }
        return current.map((item) =>
          item._id === deal._id
            ? {
                ...item,
                savedBy: isSaved
                  ? item.savedBy.filter((id) => id !== user.id)
                  : [...item.savedBy, user.id],
              }
            : item,
        );
      });
      setSuccess(isSaved ? "Opportunity removed from your saved list." : "Opportunity saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update your saved list.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="grid gap-8">
      <PageIntro title={copy[mode].title} description={copy[mode].description} />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <Panel title="Opportunities" description={`${deals.length} deal${deals.length === 1 ? "" : "s"} in view`}>
        {loading ? (
          <p className="text-sm text-charcoal-500">Loading opportunities…</p>
        ) : deals.length === 0 ? (
          <div className="grid gap-4">
            <EmptyState>{copy[mode].empty}</EmptyState>
            <p className="text-center text-xs text-charcoal-500">
              Have you added your investment criteria?{" "}
              <Link href="/dashboard/buyer/profile" className="font-semibold text-gold-600 underline">
                Update your buyer profile
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {deals.map((deal) => {
              const isSaved = deal.savedBy.includes(user?.id ?? "");
              return (
                <li
                  key={deal._id}
                  className="flex flex-col border border-navy-900/10 bg-white p-5 transition-colors hover:border-gold-500/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl text-navy-900">{deal.title}</h3>
                      <p className="mt-1 text-xs text-charcoal-500">
                        {deal.seller?.companyName ?? "Seller details withheld"}
                        {deal.seller?.industry ? ` · ${deal.seller.industry}` : ""}
                      </p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${stageTone(deal.stage)}`}
                    >
                      {STAGE_LABELS[deal.stage]}
                    </span>
                  </div>

                  {deal.description && (
                    <p className="mt-4 text-sm leading-6 text-charcoal-600">{deal.description}</p>
                  )}

                  <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-navy-900/10 py-4 text-xs">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.12em] text-charcoal-500">
                        Enterprise value
                      </dt>
                      <dd className="mt-1 font-medium text-navy-900">
                        {formatMoneyMillions(deal.enterpriseValue)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.12em] text-charcoal-500">
                        EBITDA
                      </dt>
                      <dd className="mt-1 font-medium text-navy-900">
                        {formatMoneyMillions(deal.ebitda)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={dealHref("buyer", deal._id)}
                      className={primaryButtonClass}
                    >
                      View details
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleToggle(deal)}
                      disabled={busyId === deal._id}
                      className={secondaryButtonClass}
                    >
                      {busyId === deal._id
                        ? "Updating…"
                        : isSaved
                          ? "Remove from saved"
                          : "Save opportunity"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
