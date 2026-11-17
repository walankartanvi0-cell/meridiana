"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  ACTIVE_DEAL_STAGES,
  STAGE_LABELS,
  dealHref,
  formatMoneyMillions,
  stageTone,
} from "@/lib/deals";
import type { Deal } from "@/types/deals";
import {
  EmptyState,
  formatDate,
  Notice,
  PageIntro,
  Panel,
} from "./DashboardUI";

type Mode = "progress" | "interest";

const copy: Record<Mode, { title: string; description: string; empty: string }> = {
  progress: {
    title: "Transaction progress",
    description: "Follow your mandate through each stage of the sale process.",
    empty: "No transaction has been linked to your business profile yet.",
  },
  interest: {
    title: "Buyer interest",
    description: "See which buyers are engaged with your business and where discussions stand.",
    empty: "There is no buyer interest to show yet.",
  },
};

const interestStages = ["marketing", "diligence", "negotiation", "closing"];

function StageTracker({ stage }: { stage: Deal["stage"] }) {
  if (stage === "passed") {
    return (
      <span className="inline-flex px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] bg-red-50 text-red-700">
        Passed
      </span>
    );
  }

  const currentIndex = ACTIVE_DEAL_STAGES.indexOf(stage);

  return (
    <ol className="grid gap-2 sm:grid-cols-7">
      {ACTIVE_DEAL_STAGES.map((step, index) => (
        <li key={step} className="flex flex-col gap-1">
          <span
            className={`h-1 w-full ${
              index <= currentIndex ? "bg-gold-500" : "bg-navy-900/10"
            }`}
          />
          <span
            className={`text-[9px] uppercase tracking-[0.08em] ${
              index <= currentIndex ? "font-semibold text-navy-900" : "text-charcoal-500"
            }`}
          >
            {STAGE_LABELS[step]}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function SellerTransactionsPanel({ mode }: { mode: Mode }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await apiFetch<{ deals: Deal[] }>("/deals/mine");
        if (active) setDeals(response.deals);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load your transactions.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const visibleDeals = useMemo(() => {
    if (mode === "interest") {
      return deals.filter(
        (deal) => Boolean(deal.buyer) || interestStages.includes(deal.stage),
      );
    }
    return deals;
  }, [deals, mode]);

  return (
    <div className="grid gap-8">
      <PageIntro title={copy[mode].title} description={copy[mode].description} />

      {error && <Notice tone="error">{error}</Notice>}

      <Panel title="Your transactions" description={`${visibleDeals.length} deal${visibleDeals.length === 1 ? "" : "s"} in view`}>
        {loading ? (
          <p className="text-sm text-charcoal-500">Loading transactions…</p>
        ) : visibleDeals.length === 0 ? (
          <div className="grid gap-4">
            <EmptyState>{copy[mode].empty}</EmptyState>
            <p className="text-center text-xs text-charcoal-500">
              Keep your company details current in your{" "}
              <Link
                href="/dashboard/seller/business-profile"
                className="font-semibold text-gold-600 underline"
              >
                business profile
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="grid gap-5">
            {visibleDeals.map((deal) => (
              <li key={deal._id} className="border border-navy-900/10 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-xl text-navy-900">{deal.title}</h3>
                      <span
                        className={`inline-flex px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${stageTone(deal.stage)}`}
                      >
                        {STAGE_LABELS[deal.stage]}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-charcoal-500">
                      Updated {formatDate(deal.updatedAt)}
                    </p>
                  </div>
                  <Link
                    href={dealHref("seller", deal._id)}
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900"
                  >
                    View details
                  </Link>
                </div>

                {mode === "progress" ? (
                  <div className="mt-6">
                    <StageTracker stage={deal.stage} />
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 border-t border-navy-900/10 pt-5 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-charcoal-500">
                        Interested buyer
                      </p>
                      <p className="mt-1 text-sm font-medium text-navy-900">
                        {deal.buyer?.companyName ?? "To be confirmed"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-charcoal-500">
                        Buyer criteria
                      </p>
                      <p className="mt-1 text-xs text-charcoal-600">
                        {deal.buyer?.industries.length
                          ? deal.buyer.industries.join(", ")
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-charcoal-500">
                        Indicative value
                      </p>
                      <p className="mt-1 text-sm font-medium text-navy-900">
                        {formatMoneyMillions(deal.enterpriseValue)}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
