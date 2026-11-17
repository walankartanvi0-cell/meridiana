"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  DEAL_STAGES,
  STAGE_LABELS,
  dealFormPayload,
  dealHref,
  emptyDealForm,
  formFromDeal,
  formatMoneyMillions,
  stageTone,
} from "@/lib/deals";
import type { Deal, DealOptions } from "@/types/deals";
import {
  EmptyState,
  formatDate,
  inputClass,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
  secondaryButtonClass,
} from "./DashboardUI";

type ManagerRole = "admin" | "advisor";

const copy: Record<ManagerRole, { title: string; description: string }> = {
  admin: {
    title: "Manage deals",
    description:
      "Create transactions, assign advisors and keep every mandate moving through the pipeline.",
  },
  advisor: {
    title: "Assigned deals",
    description:
      "Review the transactions assigned to you, update their stage and maintain deal records.",
  },
};

function sellerLabel(seller: DealOptions["sellers"][number]) {
  const account = seller.user && "name" in seller.user ? seller.user.name : null;
  return account ? `${seller.companyName} — ${account}` : seller.companyName;
}

function buyerLabel(buyer: DealOptions["buyers"][number]) {
  const account = buyer.user && "name" in buyer.user ? buyer.user.name : null;
  return account ? `${buyer.companyName} — ${account}` : buyer.companyName;
}

function partyNames(deal: Deal) {
  const parties: string[] = [];
  if (deal.seller) parties.push(`Seller: ${deal.seller.companyName}`);
  if (deal.buyer) parties.push(`Buyer: ${deal.buyer.companyName}`);
  return parties.length ? parties.join(" · ") : "No party linked";
}

export default function DealManagementPanel({ role }: { role: ManagerRole }) {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [options, setOptions] = useState<DealOptions>({ buyers: [], sellers: [], advisors: [] });
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyDealForm);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState(emptyDealForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const response = await apiFetch<DealOptions>("/deals/options");
        if (active) setOptions(response);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load deal options.");
      } finally {
        if (active) setOptionsLoading(false);
      }
    }

    void loadOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadDeals() {
      const query = new URLSearchParams();
      if (stageFilter) query.set("stage", stageFilter);
      if (search) query.set("search", search);
      const suffix = query.size ? `?${query.toString()}` : "";

      try {
        const response = await apiFetch<{ deals: Deal[] }>(`/deals${suffix}`);
        if (active) setDeals(response.deals);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load deals.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDeals();
    return () => {
      active = false;
    };
  }, [search, stageFilter]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch<{ deal: Deal }>("/deals", {
        method: "POST",
        body: JSON.stringify(dealFormPayload(createForm, { includeAdvisor: role === "admin" })),
      });
      setDeals((current) => [response.deal, ...current]);
      setCreateForm(emptyDealForm);
      setShowCreate(false);
      setSuccess("Deal created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the deal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch<{ deal: Deal }>(`/deals/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(dealFormPayload(editForm, { includeAdvisor: role === "admin" })),
      });
      setDeals((current) =>
        current.map((deal) => (deal._id === response.deal._id ? response.deal : deal)),
      );
      setEditingId("");
      setSuccess("Deal updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the deal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(deal: Deal) {
    if (!window.confirm(`Delete the deal "${deal.title}"?`)) return;

    setError("");
    setSuccess("");
    try {
      await apiFetch(`/deals/${deal._id}`, { method: "DELETE" });
      setDeals((current) => current.filter((item) => item._id !== deal._id));
      if (editingId === deal._id) setEditingId("");
      setSuccess("Deal deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the deal.");
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSearch(searchDraft.trim());
  }

  const formFields = (
    form: typeof createForm,
    onChange: (next: typeof createForm) => void,
    includeAdvisor: boolean,
  ) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Deal title
        </span>
        <input
          required
          value={form.title}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          className={inputClass}
          placeholder="Sale of Northline Manufacturing"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Seller profile
        </span>
        <select
          value={form.seller}
          onChange={(event) => onChange({ ...form, seller: event.target.value })}
          className={inputClass}
        >
          <option value="">No seller linked</option>
          {options.sellers.map((seller) => (
            <option key={seller._id} value={seller._id}>
              {sellerLabel(seller)}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Buyer profile
        </span>
        <select
          value={form.buyer}
          onChange={(event) => onChange({ ...form, buyer: event.target.value })}
          className={inputClass}
        >
          <option value="">No buyer linked</option>
          {options.buyers.map((buyer) => (
            <option key={buyer._id} value={buyer._id}>
              {buyerLabel(buyer)}
            </option>
          ))}
        </select>
      </label>
      {includeAdvisor && (
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Assigned advisor
          </span>
          <select
            value={form.advisor}
            onChange={(event) => onChange({ ...form, advisor: event.target.value })}
            className={inputClass}
          >
            <option value="">Assign to me</option>
            {options.advisors.map((advisor) => (
              <option key={advisor.id} value={advisor.id}>
                {advisor.name} — {advisor.email}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Stage
        </span>
        <select
          value={form.stage}
          onChange={(event) =>
            onChange({ ...form, stage: event.target.value as typeof createForm.stage })
          }
          className={inputClass}
        >
          {DEAL_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {STAGE_LABELS[stage]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Enterprise value ($m)
        </span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={form.enterpriseValue}
          onChange={(event) => onChange({ ...form, enterpriseValue: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          EBITDA ($m)
        </span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={form.ebitda}
          onChange={(event) => onChange({ ...form, ebitda: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Expected close
        </span>
        <input
          type="date"
          value={form.expectedCloseDate}
          onChange={(event) => onChange({ ...form, expectedCloseDate: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Probability (%)
        </span>
        <input
          type="number"
          min="0"
          max="100"
          value={form.probability}
          onChange={(event) => onChange({ ...form, probability: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Deal summary
        </span>
        <textarea
          rows={3}
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Internal notes
        </span>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(event) => onChange({ ...form, notes: event.target.value })}
          className={inputClass}
        />
      </label>
    </div>
  );

  return (
    <div className="grid gap-8">
      <PageIntro title={copy[role].title} description={copy[role].description} />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <Panel
        title="Deal register"
        description={`${deals.length} deal${deals.length === 1 ? "" : "s"} in view`}
        actions={
          <button
            type="button"
            onClick={() => setShowCreate((current) => !current)}
            className={primaryButtonClass}
          >
            {showCreate ? "Close form" : "Create deal"}
          </button>
        }
      >
        {showCreate && (
          <form
            onSubmit={(event) => void handleCreate(event)}
            className="mb-8 grid gap-4 border border-navy-900/10 bg-ivory-50 p-5"
          >
            {optionsLoading ? (
              <p className="text-sm text-charcoal-500">Loading deal options…</p>
            ) : (
              <>
                <p className="text-xs text-charcoal-600">
                  {user?.role === "advisor"
                    ? "New deals are automatically assigned to you."
                    : "Choose an advisor or leave the selection blank to assign the deal to yourself."}
                </p>
                {formFields(createForm, setCreateForm, role === "admin")}
                <div>
                  <button type="submit" disabled={saving} className={primaryButtonClass}>
                    {saving ? "Creating…" : "Create deal"}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {editingId && (
          <form
            onSubmit={(event) => void handleUpdate(event)}
            className="mb-8 grid gap-4 border border-gold-500/40 bg-gold-100/30 p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-xl text-navy-900">Edit deal</h3>
              <button
                type="button"
                onClick={() => setEditingId("")}
                className={secondaryButtonClass}
              >
                Cancel
              </button>
            </div>
            {formFields(editForm, setEditForm, role === "admin")}
            <div>
              <button type="submit" disabled={saving} className={primaryButtonClass}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}

        <div className="mb-6 flex flex-wrap items-end gap-3">
          <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Search title
              </span>
              <input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                className={`${inputClass} min-w-[220px]`}
                placeholder="Search deals"
              />
            </label>
            <button type="submit" className={secondaryButtonClass}>
              Search
            </button>
          </form>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
              Stage
            </span>
            <select
              value={stageFilter}
              onChange={(event) => {
                setLoading(true);
                setStageFilter(event.target.value);
              }}
              className={inputClass}
            >
              <option value="">All stages</option>
              {DEAL_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {STAGE_LABELS[stage]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="text-sm text-charcoal-500">Loading deals…</p>
        ) : deals.length === 0 ? (
          <EmptyState>
            No deals match the current filters.{" "}
            {options.sellers.length === 0 && options.buyers.length === 0
              ? "Create a buyer or seller profile before adding a deal."
              : "Create a deal to begin the pipeline."}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-900/10 text-[10px] uppercase tracking-[0.14em] text-charcoal-500">
                  <th className="pb-3 pr-4 font-semibold">Deal</th>
                  <th className="pb-3 pr-4 font-semibold">Parties</th>
                  <th className="pb-3 pr-4 font-semibold">Stage</th>
                  <th className="pb-3 pr-4 font-semibold">Value</th>
                  <th className="pb-3 pr-4 font-semibold">Advisor</th>
                  <th className="pb-3 pr-4 font-semibold">Updated</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal._id} className="border-b border-navy-900/5 align-top">
                    <td className="py-4 pr-4">
                      <Link
                        href={dealHref(role, deal._id)}
                        className="font-medium text-navy-900 hover:text-gold-600"
                      >
                        {deal.title}
                      </Link>
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-600">{partyNames(deal)}</td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${stageTone(deal.stage)}`}
                      >
                        {STAGE_LABELS[deal.stage]}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-600">
                      {formatMoneyMillions(deal.enterpriseValue)}
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-600">
                      {deal.advisor?.name ?? "Unassigned"}
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-500">
                      {formatDate(deal.updatedAt)}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={dealHref(role, deal._id)}
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(deal._id);
                            setEditForm(formFromDeal(deal));
                            setShowCreate(false);
                          }}
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(deal)}
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
