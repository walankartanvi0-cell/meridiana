import type { BuyerProfile, SellerProfile } from "./dashboard";

export const DEAL_STAGES = [
  "sourcing",
  "preparing",
  "marketing",
  "diligence",
  "negotiation",
  "closing",
  "closed",
  "passed",
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export type DealPartyUser = {
  id: string;
  name: string;
  email: string;
};

export type DealSeller = Pick<
  SellerProfile,
  "_id" | "companyName" | "industry" | "location" | "status"
> & {
  user?: DealPartyUser | null;
};

export type DealBuyer = Pick<
  BuyerProfile,
  "_id" | "companyName" | "industries" | "geographies" | "status"
> & {
  user?: DealPartyUser | null;
};

export type Deal = {
  _id: string;
  title: string;
  seller?: DealSeller | null;
  buyer?: DealBuyer | null;
  advisor?: DealPartyUser | null;
  stage: DealStage;
  enterpriseValue?: number;
  ebitda?: number;
  expectedCloseDate?: string;
  probability?: number;
  description?: string;
  notes?: string;
  savedBy: string[];
  createdBy?: DealPartyUser | null;
  createdAt: string;
  updatedAt: string;
};

export type DealPipeline = {
  byStage: Record<DealStage, number>;
  totalDeals: number;
  totalValue: number;
};

export type DealOptions = {
  buyers: DealBuyer[];
  sellers: DealSeller[];
  advisors: DealPartyUser[];
};

export type DealFormValues = {
  title: string;
  seller: string;
  buyer: string;
  advisor: string;
  stage: DealStage;
  enterpriseValue: string;
  ebitda: string;
  expectedCloseDate: string;
  probability: string;
  description: string;
  notes: string;
};
