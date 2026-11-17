"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  ACTIVE_DEAL_STAGES,
  DEAL_STAGES,
  STAGE_LABELS,
  dealHref,
  formatMoneyMillions,
  stageTone,
} from "@/lib/deals";
import type { Deal, DealPipeline } from "@/types/deals";
import {
  EmptyState,
  formatDate,
  Notice,
  PageIntro,
  Panel,
  StatCard,
} from "./DashboardUI";

type ManagerRole = "admin" | "advisor";
type Mode = "all" | "buyer" | "seller" | "progress";

const copy: Record<Mode, { title: string; description: string }> = {
  all: {
    title: "Transaction pipeline",
    description: "Follow every mandate from first conversation through closing in one live board.",
  },
  buyer: {
    title: "Buyer pipeline",
    description: "Track mandates with an identified buyer and the stage of each acquisition.",
  },
  seller: {
    title: "Seller pipeline",
    description: "Track every sell-side mandate and the progress of each client transaction.",
  },
  progress: {
    title: "Deal progress",
    description: "Review active transactions, probability and expected closing dates.",
  },
};

function stageValue(deals: Deal[], stage: string) {
  return deals
    .filter((deal) => deal.stage === stage)
    .reduce((total, deal) => total + (deal.enterpriseValue ?? 0), 0);
}

export default function TransactionPipelinePanel({
  role,
  mode = "all",
}: {
  role: ManagerRole;
  mode?: Mode;
}) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pipeline, setPipeline] = useState<DealPipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [dealResponse, pipelineResponse] = await Promise.all([
          apiFetch<{ deals: Deal[] }>("/deals"),
          apiFetch<{ pipeline: DealPipeline }>("/deals/pipeline"),
        ]);
        if (active) {
          setDeals(dealResponse.deals);
          setPipeline(pipelineResponse.pipeline);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load the pipeline.");
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
    if (mode === "buyer") return deals.filter((deal) => Boolean(deal.buyer));
    if (mode === "seller") return deals.filter((deal) => Boolean(deal.seller));
    return deals;
  }, [deals, mode]);

  const activeDeals = useMemo(
    () => visibleDeals.filter((deal) => deal.stage !== "closed" && deal.stage !== "passed"),
    [visibleDeals],
  );

  const pipelineValue = useMemo(
    () => visibleDeals.reduce((total, deal) => total + (deal.enterpriseValue ?? 0), 0),
    [visibleDeals],
  );

  const watchlist = useMemo(
    () =>
      [...activeDeals]
        .sort((a, b) => (b.probability ?? 0) - (a.probability ?? 0))
        .slice(0, 8),
    [activeDeals],
  );

  return (
    <div className="grid gap-8">
      <PageIntro title={copy[mode].title} description={copy[mode].description} />

      {error && <Notice tone="error">{error}</Notice>}

      <Panel title="Pipeline snapshot" description="Live totals from your assigned transactions">
        {loading ? (
          <p className="text-sm text-charcoal-500">Loading pipeline…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Deals in view" value={visibleDeals.length} />
            <StatCard label="Active mandates" value={activeDeals.length} />
            <StatCard label="Pipeline value" value={formatMoneyMillions(pipelineValue)} />
            <StatCard label="Closed" value={pipeline?.byStage.closed ?? 0} />
          </div>
        )}
      </Panel>

      <Panel
        title="Stage board"
        description="Each card links to the full deal record. Counts reflect the current view."
      >
        {loading ? (
          <p className="text-sm text-charcoal-500">Loading stage board…</p>
        ) : visibleDeals.length === 0 ? (
          <EmptyState>No deals are available in this pipeline view yet.</EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {DEAL_STAGES.map((stage) => {
              const stageDeals = visibleDeals.filter((deal) => deal.stage === stage);
              return (
                <div key={stage} className="border border-navy-900/10 bg-ivory-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                      {STAGE_LABELS[stage]}
                    </h3>
                    <span className="bg-white px-2 py-1 text-[10px] font-semibold text-charcoal-500">
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] text-charcoal-500">
                    {formatMoneyMillions(stageValue(visibleDeals, stage))}
                  </p>
                  <div className="mt-4 grid gap-3">
                    {stageDeals.length === 0 ? (
                      <p className="border border-dashed border-navy-900/10 px-3 py-4 text-center text-[11px] text-charcoal-500">
                        No deals at this stage
                      </p>
                    ) : (
                      stageDeals.map((deal) => (
                        <Link
                          key={deal._id}
                          href={dealHref(role, deal._id)}
                          className="border border-navy-900/10 bg-white p-3 transition-colors hover:border-gold-500"
                        >
                          <p className="text-sm font-medium leading-5 text-navy-900">{deal.title}</p>
                          <p className="mt-2 text-[10px] text-charcoal-500">
                            {deal.seller?.companyName ?? deal.buyer?.companyName ?? "Party to be set"}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span
                              className={`px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] ${stageTone(deal.stage)}`}
                            >
                              {STAGE_LABELS[deal.stage]}
                            </span>
                            <span className="text-[10px] text-charcoal-600">
                              {formatMoneyMillions(deal.enterpriseValue)}
                            </span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {mode === "progress" && !loading && watchlist.length > 0 && (
        <Panel
          title="Progress watchlist"
          description="Active mandates ordered by probability of closing."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-900/10 text-[10px] uppercase tracking-[0.14em] text-charcoal-500">
                  <th className="pb-3 pr-4 font-semibold">Deal</th>
                  <th className="pb-3 pr-4 font-semibold">Stage</th>
                  <th className="pb-3 pr-4 font-semibold">Probability</th>
                  <th className="pb-3 pr-4 font-semibold">Expected close</th>
                  <th className="pb-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((deal) => (
                  <tr key={deal._id} className="border-b border-navy-900/5 align-top">
                    <td className="py-4 pr-4 font-medium text-navy-900">{deal.title}</td>
                    <td className="py-4 pr-4 text-xs text-charcoal-600">
                      {STAGE_LABELS[deal.stage]}
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-600">
                      {deal.probability !== undefined ? `${deal.probability}%` : "—"}
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-500">
                      {formatDate(deal.expectedCloseDate)}
                    </td>
                    <td className="py-4">
                      <Link
                        href={dealHref(role, deal._id)}
                        className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {pipeline && (
        <Panel title="Stage totals" description="Portfolio-wide counts, including deals outside this view">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {ACTIVE_DEAL_STAGES.map((stage) => (
              <div key={stage} className="border border-navy-900/10 bg-white px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-charcoal-500">
                  {STAGE_LABELS[stage]}
                </p>
                <p className="mt-2 font-display text-2xl text-navy-900">
                  {pipeline.byStage[stage] ?? 0}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
