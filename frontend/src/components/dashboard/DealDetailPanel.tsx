"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  DEAL_STAGES,
  STAGE_LABELS,
  dealListHref,
  formatMoneyMillions,
  stageTone,
} from "@/lib/deals";
import type { UserRole } from "@/types/auth";
import type { Deal, DealStage } from "@/types/deals";
import {
  formatDate,
  inputClass,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
  secondaryButtonClass,
} from "./DashboardUI";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-navy-900/5 pb-3">
      <dt className="text-[10px] uppercase tracking-[0.12em] text-charcoal-500">{label}</dt>
      <dd className="mt-1 text-sm text-navy-900">{value}</dd>
    </div>
  );
}

export default function DealDetailPanel({ id, role }: { id: string; role: UserRole }) {
  const { user } = useAuth();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [stageDraft, setStageDraft] = useState<DealStage>("sourcing");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updating, setUpdating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canManage = role === "admin" || role === "advisor";

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await apiFetch<{ deal: Deal }>(`/deals/${id}`);
        if (active) {
          setDeal(response.deal);
          setStageDraft(response.deal.stage);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load this deal.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [id]);

  async function handleStageUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deal) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch<{ deal: Deal }>(`/deals/${deal._id}`, {
        method: "PATCH",
        body: JSON.stringify({ stage: stageDraft }),
      });
      setDeal(response.deal);
      setStageDraft(response.deal.stage);
      setSuccess("Deal stage updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the deal stage.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!deal || !window.confirm(`Delete the deal "${deal.title}"?`)) return;

    setDeleting(true);
    setError("");
    try {
      await apiFetch(`/deals/${deal._id}`, { method: "DELETE" });
      router.push(dealListHref(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the deal.");
      setDeleting(false);
    }
  }

  async function handleSaveToggle() {
    if (!deal || !user) return;

    const isSaved = deal.savedBy.includes(user.id);
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/deals/${deal._id}/save`, {
        method: isSaved ? "DELETE" : "POST",
      });
      setDeal({
        ...deal,
        savedBy: isSaved
          ? deal.savedBy.filter((savedId) => savedId !== user.id)
          : [...deal.savedBy, user.id],
      });
      setSuccess(isSaved ? "Removed from your saved list." : "Opportunity saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update your saved list.");
    } finally {
      setSaving(false);
    }
  }

  const isSaved = Boolean(deal && user && deal.savedBy.includes(user.id));

  return (
    <div className="grid gap-8">
      <PageIntro
        title="Deal details"
        description="A focused view of the transaction, the parties involved and the current stage."
      />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      {loading ? (
        <Panel title="Loading" description="Fetching the latest deal record">
          <p className="text-sm text-charcoal-500">Loading deal details…</p>
        </Panel>
      ) : !deal ? (
        <Panel title="Deal unavailable" description="This record could not be loaded">
          <p className="text-sm text-charcoal-600">
            The deal may have been removed or you may not have permission to view it.
          </p>
        </Panel>
      ) : (
        <>
          <Panel
            title={deal.title}
            description={`Last updated ${formatDate(deal.updatedAt)}`}
            actions={
              <span
                className={`inline-flex px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${stageTone(deal.stage)}`}
              >
                {STAGE_LABELS[deal.stage]}
              </span>
            }
          >
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <DetailRow label="Enterprise value" value={formatMoneyMillions(deal.enterpriseValue)} />
              <DetailRow label="EBITDA" value={formatMoneyMillions(deal.ebitda)} />
              <DetailRow
                label="Expected close"
                value={formatDate(deal.expectedCloseDate)}
              />
              <DetailRow
                label="Probability"
                value={deal.probability !== undefined ? `${deal.probability}%` : "—"}
              />
            </div>

            {deal.description && (
              <div className="mt-6 border-t border-navy-900/10 pt-6">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Transaction summary
                </h3>
                <p className="mt-3 text-sm leading-7 text-charcoal-600">{deal.description}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={dealListHref(role)} className={secondaryButtonClass}>
                Back to deals
              </Link>
              {role === "buyer" && (
                <button
                  type="button"
                  onClick={() => void handleSaveToggle()}
                  disabled={saving}
                  className={primaryButtonClass}
                >
                  {saving ? "Updating…" : isSaved ? "Remove from saved" : "Save opportunity"}
                </button>
              )}
            </div>
          </Panel>

          <Panel title="Parties" description="Companies and advisors connected to this transaction">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border border-navy-900/10 bg-ivory-50 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal-500">
                  Seller
                </p>
                <p className="mt-3 font-display text-xl text-navy-900">
                  {deal.seller?.companyName ?? "Not assigned"}
                </p>
                {deal.seller?.industry && (
                  <p className="mt-2 text-xs text-charcoal-600">{deal.seller.industry}</p>
                )}
                {deal.seller?.user && "name" in deal.seller.user && (
                  <p className="mt-2 text-xs text-charcoal-500">
                    {deal.seller.user.name} · {deal.seller.user.email}
                  </p>
                )}
              </div>
              <div className="border border-navy-900/10 bg-ivory-50 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal-500">
                  Buyer
                </p>
                <p className="mt-3 font-display text-xl text-navy-900">
                  {deal.buyer?.companyName ?? "Not assigned"}
                </p>
                {deal.buyer?.industries.length ? (
                  <p className="mt-2 text-xs text-charcoal-600">
                    {deal.buyer.industries.join(", ")}
                  </p>
                ) : null}
                {deal.buyer?.user && "name" in deal.buyer.user && (
                  <p className="mt-2 text-xs text-charcoal-500">
                    {deal.buyer.user.name} · {deal.buyer.user.email}
                  </p>
                )}
              </div>
              <div className="border border-navy-900/10 bg-ivory-50 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal-500">
                  Advisor
                </p>
                <p className="mt-3 font-display text-xl text-navy-900">
                  {deal.advisor?.name ?? "Unassigned"}
                </p>
                {deal.advisor?.email && (
                  <p className="mt-2 text-xs text-charcoal-500">{deal.advisor.email}</p>
                )}
              </div>
            </div>
          </Panel>

          {canManage && (
            <Panel
              title="Deal controls"
              description="Update the transaction stage or remove the record if it is no longer needed."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <form onSubmit={(event) => void handleStageUpdate(event)} className="grid gap-4">
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                      Pipeline stage
                    </span>
                    <select
                      value={stageDraft}
                      onChange={(event) => setStageDraft(event.target.value as DealStage)}
                      className={inputClass}
                    >
                      {DEAL_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {STAGE_LABELS[stage]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div>
                    <button type="submit" disabled={updating} className={primaryButtonClass}>
                      {updating ? "Updating…" : "Update stage"}
                    </button>
                  </div>
                </form>

                <div className="border border-red-200 bg-red-50/40 p-5">
                  <h3 className="font-display text-xl text-navy-900">Delete this deal</h3>
                  <p className="mt-2 text-xs leading-6 text-charcoal-600">
                    This removes the deal record from the workspace. This action cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={deleting}
                    className="mt-4 border border-red-700 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-700 transition-colors hover:bg-red-700 hover:text-white disabled:opacity-60"
                  >
                    {deleting ? "Deleting…" : "Delete deal"}
                  </button>
                </div>
              </div>

              {deal.notes && (
                <div className="mt-6 border-t border-navy-900/10 pt-6">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                    Internal notes
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-charcoal-600">{deal.notes}</p>
                </div>
              )}
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
