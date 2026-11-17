import type { UserRole } from "@/types/auth";
import { DEAL_STAGES, type DealFormValues, type DealStage } from "@/types/deals";

export { DEAL_STAGES };

export const ACTIVE_DEAL_STAGES: readonly DealStage[] = [
  "sourcing",
  "preparing",
  "marketing",
  "diligence",
  "negotiation",
  "closing",
  "closed",
];

export const STAGE_LABELS: Record<DealStage, string> = {
  sourcing: "Sourcing",
  preparing: "Preparing",
  marketing: "Marketing",
  diligence: "Diligence",
  negotiation: "Negotiation",
  closing: "Closing",
  closed: "Closed",
  passed: "Passed",
};

export const emptyDealForm: DealFormValues = {
  title: "",
  seller: "",
  buyer: "",
  advisor: "",
  stage: "sourcing",
  enterpriseValue: "",
  ebitda: "",
  expectedCloseDate: "",
  probability: "",
  description: "",
  notes: "",
};

export function formatMoneyMillions(value?: number) {
  if (value === undefined || value === null) return "—";
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}m`;
}

export function dealHref(role: UserRole, id: string) {
  return `/dashboard/${role}/deals/${id}`;
}

export function dealListHref(role: UserRole) {
  if (role === "seller") return "/dashboard/seller/transactions";
  if (role === "buyer") return "/dashboard/buyer/deals";
  return `/dashboard/${role}/deals`;
}

export function stageTone(stage: DealStage) {
  if (stage === "closed") return "bg-emerald-50 text-emerald-700";
  if (stage === "passed") return "bg-red-50 text-red-700";
  if (stage === "negotiation" || stage === "closing") return "bg-gold-100 text-navy-900";
  return "bg-navy-900/5 text-charcoal-600";
}

export function toFormNumber(value: string) {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function formFromDeal(deal: {
  title: string;
  seller?: { _id: string } | null;
  buyer?: { _id: string } | null;
  advisor?: { id: string } | null;
  stage: DealStage;
  enterpriseValue?: number;
  ebitda?: number;
  expectedCloseDate?: string;
  probability?: number;
  description?: string;
  notes?: string;
}): DealFormValues {
  return {
    title: deal.title,
    seller: deal.seller?._id ?? "",
    buyer: deal.buyer?._id ?? "",
    advisor: deal.advisor?.id ?? "",
    stage: deal.stage,
    enterpriseValue: deal.enterpriseValue?.toString() ?? "",
    ebitda: deal.ebitda?.toString() ?? "",
    expectedCloseDate: deal.expectedCloseDate?.slice(0, 10) ?? "",
    probability: deal.probability?.toString() ?? "",
    description: deal.description ?? "",
    notes: deal.notes ?? "",
  };
}

export function dealFormPayload(
  values: DealFormValues,
  { includeAdvisor }: { includeAdvisor: boolean },
) {
  return {
    title: values.title,
    seller: values.seller || undefined,
    buyer: values.buyer || undefined,
    ...(includeAdvisor ? { advisor: values.advisor || undefined } : {}),
    stage: values.stage,
    enterpriseValue: toFormNumber(values.enterpriseValue),
    ebitda: toFormNumber(values.ebitda),
    expectedCloseDate: values.expectedCloseDate || undefined,
    probability: toFormNumber(values.probability),
    description: values.description || undefined,
    notes: values.notes || undefined,
  };
}
