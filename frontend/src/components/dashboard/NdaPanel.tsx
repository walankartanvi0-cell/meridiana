"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { dateInputValue, downloadDocumentFile } from "@/lib/collaboration";
import type { UserRole } from "@/types/auth";
import {
  NDA_STATUSES,
  NDA_STATUS_LABELS,
  type CollaborationDeal,
  type DocumentRecord,
  type NdaRecord,
  type NdaStatus,
} from "@/types/collaboration";
import {
  EmptyState,
  formatDate,
  inputClass,
  Notice,
  PageIntro,
  Panel,
  primaryButtonClass,
  secondaryButtonClass,
  StatusPill,
} from "./DashboardUI";

const copy: Record<UserRole, { title: string; description: string }> = {
  admin: {
    title: "NDA management",
    description:
      "Track every confidentiality request, record signatures and keep buyer access to deal materials controlled.",
  },
  advisor: {
    title: "NDA management",
    description:
      "Review confidentiality requests for your mandates and record when a buyer is cleared to receive materials.",
  },
  buyer: {
    title: "NDA management",
    description:
      "Request access to confidential opportunity materials and follow the status of every agreement.",
  },
  seller: {
    title: "NDA management",
    description:
      "Review confidentiality requests from prospective buyers and confirm when they have been signed.",
  },
};

type EditForm = {
  status: NdaStatus;
  notes: string;
  expiresAt: string;
  document: string;
};

const emptyEditForm: EditForm = {
  status: "requested",
  notes: "",
  expiresAt: "",
  document: "",
};

function buyerLabel(nda: NdaRecord) {
  return nda.buyer?.companyName ?? nda.buyer?.user?.name ?? "Buyer";
}

export default function NdaPanel({ role }: { role: UserRole }) {
  const [ndas, setNdas] = useState<NdaRecord[]>([]);
  const [deals, setDeals] = useState<CollaborationDeal[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({ deal: "", notes: "" });
  const [requesting, setRequesting] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState<EditForm>(emptyEditForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  const editingNda = ndas.find((nda) => nda._id === editingId) ?? null;
  const canManage = role !== "buyer";

  useEffect(() => {
    let active = true;

    async function loadDeals() {
      if (role !== "buyer") return;
      try {
        const response = await apiFetch<{ deals: CollaborationDeal[] }>("/deals/available");
        if (active) setDeals(response.deals);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load opportunities.");
      }
    }

    void loadDeals();
    return () => {
      active = false;
    };
  }, [role]);

  useEffect(() => {
    let active = true;

    async function loadDocuments() {
      if (role === "buyer") return;
      try {
        const response = await apiFetch<{ documents: DocumentRecord[] }>("/documents");
        if (active) setDocuments(response.documents);
      } catch {
        // A missing document room should not stop the NDA register from loading.
      }
    }

    void loadDocuments();
    return () => {
      active = false;
    };
  }, [role]);

  useEffect(() => {
    let active = true;

    async function loadNdas() {
      const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
      try {
        const response = await apiFetch<{ ndas: NdaRecord[] }>(`/ndas${query}`);
        if (active) setNdas(response.ndas);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load NDA requests.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadNdas();
    return () => {
      active = false;
    };
  }, [statusFilter]);

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!requestForm.deal) {
      setError("Choose an opportunity before requesting an NDA.");
      return;
    }

    setRequesting(true);
    try {
      const response = await apiFetch<{ nda: NdaRecord }>("/ndas", {
        method: "POST",
        body: JSON.stringify({
          deal: requestForm.deal,
          notes: requestForm.notes || undefined,
        }),
      });
      setNdas((current) => [response.nda, ...current]);
      setRequestForm({ deal: "", notes: "" });
      setShowRequest(false);
      setSuccess("NDA request submitted. Your advisor will review it.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request an NDA.");
    } finally {
      setRequesting(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await apiFetch<{ nda: NdaRecord }>(`/ndas/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: editForm.status,
          notes: editForm.notes,
          expiresAt: editForm.expiresAt,
          document: editForm.document,
        }),
      });
      setNdas((current) =>
        current.map((item) => (item._id === response.nda._id ? response.nda : item)),
      );
      setEditingId("");
      setSuccess("NDA request updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the NDA request.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(nda: NdaRecord) {
    const label = role === "buyer" ? "Withdraw" : "Delete";
    if (!window.confirm(`${label} the NDA request for "${nda.deal?.title ?? "this opportunity"}"?`)) return;

    setError("");
    setSuccess("");
    setBusyId(nda._id);
    try {
      await apiFetch(`/ndas/${nda._id}`, { method: "DELETE" });
      setNdas((current) => current.filter((item) => item._id !== nda._id));
      if (editingId === nda._id) setEditingId("");
      setSuccess(role === "buyer" ? "NDA request withdrawn." : "NDA request deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the NDA request.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDownload(nda: NdaRecord) {
    if (!nda.document) return;
    setError("");
    setSuccess("");
    setBusyId(nda._id);
    try {
      await downloadDocumentFile(nda.document);
      setSuccess("Signed NDA downloaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download the signed NDA.");
    } finally {
      setBusyId("");
    }
  }

  const documentOptions = editingNda
    ? documents.filter(
        (documentRecord) =>
          !documentRecord.deal || documentRecord.deal._id === editingNda.deal?._id,
      )
    : documents;

  return (
    <div className="grid gap-8">
      <PageIntro title={copy[role].title} description={copy[role].description} />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <Panel
        title="Confidentiality register"
        description={`${ndas.length} request${ndas.length === 1 ? "" : "s"} in view`}
        actions={
          role === "buyer" ? (
            <button
              type="button"
              onClick={() => setShowRequest((current) => !current)}
              className={primaryButtonClass}
            >
              {showRequest ? "Close form" : "Request an NDA"}
            </button>
          ) : undefined
        }
      >
        {role === "buyer" && showRequest && (
          <form
            onSubmit={(event) => void handleRequest(event)}
            className="mb-8 grid gap-4 border border-navy-900/10 bg-ivory-50 p-5"
          >
            <div>
              <h3 className="font-display text-xl text-navy-900">Request confidentiality</h3>
              <p className="mt-1 text-xs leading-6 text-charcoal-500">
                Choose an opportunity from your pipeline. Meridiana will review the request before
                releasing confidential materials.
              </p>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Opportunity
              </span>
              <select
                required
                value={requestForm.deal}
                onChange={(event) => setRequestForm({ ...requestForm, deal: event.target.value })}
                className={inputClass}
              >
                <option value="">Select an opportunity</option>
                {deals.map((deal) => (
                  <option key={deal._id} value={deal._id}>
                    {deal.title}
                  </option>
                ))}
              </select>
              {deals.length === 0 && (
                <p className="mt-2 text-xs text-charcoal-500">
                  No opportunities are available yet. Complete your buyer profile and check back.
                </p>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                Notes for the advisory team
              </span>
              <textarea
                rows={3}
                value={requestForm.notes}
                onChange={(event) => setRequestForm({ ...requestForm, notes: event.target.value })}
                className={inputClass}
                placeholder="Explain your interest and any timing considerations."
              />
            </label>
            <div>
              <button type="submit" disabled={requesting} className={primaryButtonClass}>
                {requesting ? "Submitting…" : "Submit request"}
              </button>
            </div>
          </form>
        )}

        {editingNda && (
          <form
            onSubmit={(event) => void handleUpdate(event)}
            className="mb-8 grid gap-4 border border-gold-500/40 bg-gold-100/30 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl text-navy-900">Manage NDA</h3>
                <p className="mt-1 text-xs text-charcoal-600">
                  {buyerLabel(editingNda)} · {editingNda.deal?.title ?? "Opportunity removed"}
                </p>
              </div>
              <button type="button" onClick={() => setEditingId("")} className={secondaryButtonClass}>
                Cancel
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Status
                </span>
                <select
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm({ ...editForm, status: event.target.value as NdaStatus })
                  }
                  className={inputClass}
                >
                  {NDA_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {NDA_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Expiry date
                </span>
                <input
                  type="date"
                  value={editForm.expiresAt}
                  onChange={(event) => setEditForm({ ...editForm, expiresAt: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Signed NDA document
                </span>
                <select
                  value={editForm.document}
                  onChange={(event) => setEditForm({ ...editForm, document: event.target.value })}
                  className={inputClass}
                >
                  <option value="">No signed document attached</option>
                  {documentOptions.map((documentRecord) => (
                    <option key={documentRecord._id} value={documentRecord._id}>
                      {documentRecord.title} — {documentRecord.fileName}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-charcoal-500">
                  Upload the signed agreement in the document room first, then attach it here.
                </p>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                  Notes
                </span>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(event) => setEditForm({ ...editForm, notes: event.target.value })}
                  className={inputClass}
                />
              </label>
            </div>

            <div>
              <button type="submit" disabled={saving} className={primaryButtonClass}>
                {saving ? "Saving…" : "Save NDA"}
              </button>
            </div>
          </form>
        )}

        <div className="mb-6 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
              Filter by status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setLoading(true);
                setStatusFilter(event.target.value);
              }}
              className={inputClass}
            >
              <option value="">All statuses</option>
              {NDA_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {NDA_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="text-sm text-charcoal-500">Loading NDA requests…</p>
        ) : ndas.length === 0 ? (
          <EmptyState>
            {role === "buyer"
              ? "You have not requested an NDA yet. Choose an opportunity above to begin."
              : "No NDA requests match this view."}
          </EmptyState>
        ) : (
          <ul className="grid gap-4">
            {ndas.map((nda) => (
              <li key={nda._id} className="border border-navy-900/10 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-xl text-navy-900">{nda.deal?.title ?? "Opportunity removed"}</h3>
                      <StatusPill value={NDA_STATUS_LABELS[nda.status]} />
                    </div>
                    <p className="mt-2 text-sm text-charcoal-600">
                      Buyer: <span className="font-medium text-navy-900">{buyerLabel(nda)}</span>
                    </p>
                    <p className="mt-1 text-xs text-charcoal-500">
                      Requested by {nda.requestedBy?.name ?? "a portal user"} ·{" "}
                      {formatDate(nda.createdAt)}
                    </p>
                    {nda.notes && (
                      <p className="mt-3 border-l-2 border-gold-500/50 pl-3 text-sm leading-6 text-charcoal-600">
                        {nda.notes}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-charcoal-500">
                      <span>Signed: {formatDate(nda.signedAt)}</span>
                      <span>Expires: {formatDate(nda.expiresAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {nda.document && (
                      <button
                        type="button"
                        onClick={() => void handleDownload(nda)}
                        disabled={busyId === nda._id}
                        className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900 disabled:opacity-50"
                      >
                        {busyId === nda._id ? "Working…" : "Download signed NDA"}
                      </button>
                    )}
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(nda._id);
                          setEditForm({
                            status: nda.status,
                            notes: nda.notes ?? "",
                            expiresAt: dateInputValue(nda.expiresAt),
                            document: nda.document?._id ?? "",
                          });
                        }}
                        className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900"
                      >
                        Manage
                      </button>
                    )}
                    {(role === "admin" ||
                      (role === "buyer" && ["requested", "under_review"].includes(nda.status))) && (
                      <button
                        type="button"
                        onClick={() => void handleDelete(nda)}
                        disabled={busyId === nda._id}
                        className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700 hover:text-red-900 disabled:opacity-50"
                      >
                        {role === "buyer" ? "Withdraw" : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
