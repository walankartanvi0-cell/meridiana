"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  DOCUMENT_VISIBILITY_ROLES,
  collaborationUserId,
  downloadDocumentFile,
  formatFileSize,
  formatVisibility,
} from "@/lib/collaboration";
import { ROLE_LABELS, type UserRole } from "@/types/auth";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  type CollaborationDeal,
  type DocumentCategory,
  type DocumentRecord,
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
} from "./DashboardUI";

const copy: Record<UserRole, { title: string; description: string }> = {
  admin: {
    title: "Secure document room",
    description:
      "Review every file shared across Meridiana, confirm who can see it and keep deal records complete.",
  },
  advisor: {
    title: "Deal documents",
    description:
      "Upload and share confidential materials for your assigned mandates. Every download is access-checked.",
  },
  buyer: {
    title: "Buyer documents",
    description:
      "Confidential materials shared with you and files you have uploaded for your acquisition work.",
  },
  seller: {
    title: "Sale documents",
    description:
      "Keep financial, legal and diligence materials organised for your sale process in one private room.",
  },
};

type UploadForm = {
  title: string;
  description: string;
  category: DocumentCategory;
  deal: string;
  visibleTo: UserRole[];
};

const emptyUploadForm: UploadForm = {
  title: "",
  description: "",
  category: "other",
  deal: "",
  visibleTo: ["admin", "advisor"],
};

function toggleRole(roles: UserRole[], role: UserRole) {
  return roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role];
}

function fileTypeLabel(fileName: string) {
  const extension = fileName.split(".").pop();
  return extension ? extension.toUpperCase().slice(0, 4) : "FILE";
}

export default function DocumentsPanel({ role }: { role: UserRole }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [deals, setDeals] = useState<CollaborationDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadForm>(emptyUploadForm);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState<UploadForm>(emptyUploadForm);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const response = await apiFetch<{ deals: CollaborationDeal[] }>("/documents/options");
        if (active) setDeals(response.deals);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load deal options.");
      }
    }

    void loadOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadDocuments() {
      const query = categoryFilter ? `?category=${encodeURIComponent(categoryFilter)}` : "";
      try {
        const response = await apiFetch<{ documents: DocumentRecord[] }>(`/documents${query}`);
        if (active) setDocuments(response.documents);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load documents.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDocuments();
    return () => {
      active = false;
    };
  }, [categoryFilter]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Choose a file to upload.");
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("title", uploadForm.title);
      data.append("category", uploadForm.category);
      data.append("visibleTo", uploadForm.visibleTo.join(","));
      if (uploadForm.description) data.append("description", uploadForm.description);
      if (uploadForm.deal) data.append("deal", uploadForm.deal);

      const response = await apiFetch<{ document: DocumentRecord }>("/documents", {
        method: "POST",
        body: data,
      });

      if (!categoryFilter || response.document.category === categoryFilter) {
        setDocuments((current) => [response.document, ...current]);
      }
      setUploadForm(emptyUploadForm);
      setFile(null);
      setShowUpload(false);
      setSuccess("Document uploaded to the secure room.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload the document.");
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBusyId(editingId);

    try {
      const response = await apiFetch<{ document: DocumentRecord }>(`/documents/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          category: editForm.category,
          deal: editForm.deal,
          visibleTo: editForm.visibleTo,
        }),
      });
      setDocuments((current) =>
        current.map((item) => (item._id === response.document._id ? response.document : item)),
      );
      setEditingId("");
      setSuccess("Document details updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the document.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(documentRecord: DocumentRecord) {
    if (!window.confirm(`Delete "${documentRecord.title}"? This cannot be undone.`)) return;

    setError("");
    setSuccess("");
    setBusyId(documentRecord._id);
    try {
      await apiFetch(`/documents/${documentRecord._id}`, { method: "DELETE" });
      setDocuments((current) => current.filter((item) => item._id !== documentRecord._id));
      if (editingId === documentRecord._id) setEditingId("");
      setSuccess("Document deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the document.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDownload(documentRecord: DocumentRecord) {
    setError("");
    setSuccess("");
    setBusyId(documentRecord._id);
    try {
      await downloadDocumentFile(documentRecord);
      setSuccess(`Downloaded ${documentRecord.fileName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download the document.");
    } finally {
      setBusyId("");
    }
  }

  function canManage(documentRecord: DocumentRecord) {
    return (
      role === "admin" ||
      collaborationUserId(documentRecord.uploadedBy) === collaborationUserId(user)
    );
  }

  const roleFields = (form: UploadForm, onChange: (next: UploadForm) => void) => (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Document title
          </span>
          <input
            required
            value={form.title}
            onChange={(event) => onChange({ ...form, title: event.target.value })}
            className={inputClass}
            placeholder="FY2025 audited accounts"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Category
          </span>
          <select
            value={form.category}
            onChange={(event) =>
              onChange({ ...form, category: event.target.value as DocumentCategory })
            }
            className={inputClass}
          >
            {DOCUMENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {DOCUMENT_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Link to a deal
          </span>
          <select
            value={form.deal}
            onChange={(event) => onChange({ ...form, deal: event.target.value })}
            className={inputClass}
          >
            <option value="">Personal file (no deal)</option>
            {deals.map((deal) => (
              <option key={deal._id} value={deal._id}>
                {deal.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
            Description
          </span>
          <textarea
            rows={2}
            value={form.description}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            className={inputClass}
            placeholder="What should the reader know about this file?"
          />
        </label>
      </div>

      <fieldset className="mt-4 border border-navy-900/10 bg-white p-4">
        <legend className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
          Share with
        </legend>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {DOCUMENT_VISIBILITY_ROLES.map((targetRole) => (
            <label key={targetRole} className="flex items-center gap-2 text-sm text-charcoal-600">
              <input
                type="checkbox"
                checked={form.visibleTo.includes(targetRole)}
                onChange={() => onChange({ ...form, visibleTo: toggleRole(form.visibleTo, targetRole) })}
                className="h-4 w-4 accent-navy-900"
              />
              {ROLE_LABELS[targetRole]}
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-charcoal-500">
          You and administrators can always see the file. Deal-linked files are only visible to people
          with access to that deal. Files without a deal stay private to you.
        </p>
      </fieldset>
    </>
  );

  return (
    <div className="grid gap-8">
      <PageIntro title={copy[role].title} description={copy[role].description} />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      <Panel
        title="Document register"
        description={`${documents.length} file${documents.length === 1 ? "" : "s"} in view · private, access-checked downloads`}
        actions={
          <button
            type="button"
            onClick={() => {
              setShowUpload((current) => !current);
              setEditingId("");
            }}
            className={primaryButtonClass}
          >
            {showUpload ? "Close form" : "Upload document"}
          </button>
        }
      >
        {showUpload && (
          <form
            onSubmit={(event) => void handleUpload(event)}
            className="mb-8 border border-navy-900/10 bg-ivory-50 p-5"
          >
            <div className="mb-5">
              <h3 className="font-display text-xl text-navy-900">Upload a private file</h3>
              <p className="mt-1 text-xs leading-6 text-charcoal-500">
                Maximum size: 10 MB. PDF, Word, Excel, PowerPoint, text, CSV and image files are accepted.
              </p>
            </div>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                File
              </span>
              <input
                type="file"
                required
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null;
                  setFile(selected);
                  if (selected && !uploadForm.title) {
                    setUploadForm((current) => ({
                      ...current,
                      title: selected.name.replace(/\.[^.]+$/, ""),
                    }));
                  }
                }}
                className="block w-full border border-navy-900/15 bg-white px-3 py-2.5 text-sm text-navy-900 file:mr-4 file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-[10px] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-white"
              />
            </label>

            {roleFields(uploadForm, setUploadForm)}

            <div className="mt-5">
              <button type="submit" disabled={uploading} className={primaryButtonClass}>
                {uploading ? "Uploading…" : "Upload to secure room"}
              </button>
            </div>
          </form>
        )}

        {editingId && (
          <form
            onSubmit={(event) => void handleUpdate(event)}
            className="mb-8 border border-gold-500/40 bg-gold-100/30 p-5"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl text-navy-900">Edit document details</h3>
              <button type="button" onClick={() => setEditingId("")} className={secondaryButtonClass}>
                Cancel
              </button>
            </div>
            {roleFields(editForm, setEditForm)}
            <div className="mt-5">
              <button type="submit" disabled={busyId === editingId} className={primaryButtonClass}>
                {busyId === editingId ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}

        <div className="mb-6 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
              Filter by category
            </span>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setLoading(true);
                setCategoryFilter(event.target.value);
              }}
              className={inputClass}
            >
              <option value="">All categories</option>
              {DOCUMENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {DOCUMENT_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="text-sm text-charcoal-500">Loading documents…</p>
        ) : documents.length === 0 ? (
          <EmptyState>
            No documents match this view. Upload a file to start the secure document room.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-900/10 text-[10px] uppercase tracking-[0.14em] text-charcoal-500">
                  <th className="pb-3 pr-4 font-semibold">Document</th>
                  <th className="pb-3 pr-4 font-semibold">Deal</th>
                  <th className="pb-3 pr-4 font-semibold">Category</th>
                  <th className="pb-3 pr-4 font-semibold">Shared with</th>
                  <th className="pb-3 pr-4 font-semibold">Uploaded by</th>
                  <th className="pb-3 pr-4 font-semibold">Size</th>
                  <th className="pb-3 pr-4 font-semibold">Updated</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((documentRecord) => (
                  <tr key={documentRecord._id} className="border-b border-navy-900/5 align-top">
                    <td className="py-4 pr-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-10 shrink-0 items-center justify-center bg-navy-900 text-[9px] font-semibold tracking-[0.08em] text-gold-400">
                          {fileTypeLabel(documentRecord.fileName)}
                        </span>
                        <div>
                          <p className="font-medium text-navy-900">{documentRecord.title}</p>
                          <p className="mt-1 text-xs text-charcoal-500">{documentRecord.fileName}</p>
                          {documentRecord.description && (
                            <p className="mt-1 max-w-md text-xs leading-5 text-charcoal-500">
                              {documentRecord.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-600">
                      {documentRecord.deal?.title ?? "Personal file"}
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-600">
                      {DOCUMENT_CATEGORY_LABELS[documentRecord.category]}
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-600">
                      {formatVisibility(documentRecord.visibleTo)}
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-600">
                      {documentRecord.uploadedBy?.name ?? "—"}
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-500">
                      {formatFileSize(documentRecord.size)}
                    </td>
                    <td className="py-4 pr-4 text-xs text-charcoal-500">
                      {formatDate(documentRecord.updatedAt)}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => void handleDownload(documentRecord)}
                          disabled={busyId === documentRecord._id}
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900 disabled:opacity-50"
                        >
                          {busyId === documentRecord._id ? "Working…" : "Download"}
                        </button>
                        {canManage(documentRecord) && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(documentRecord._id);
                                setEditForm({
                                  title: documentRecord.title,
                                  description: documentRecord.description ?? "",
                                  category: documentRecord.category,
                                  deal: documentRecord.deal?._id ?? "",
                                  visibleTo: documentRecord.visibleTo,
                                });
                                setShowUpload(false);
                              }}
                              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 hover:text-navy-900"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(documentRecord)}
                              disabled={busyId === documentRecord._id}
                              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700 hover:text-red-900 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </>
                        )}
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
