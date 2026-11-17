/** The stages used by the Meridiana transaction pipeline. */
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

/** Stages where a buyer can see an opportunity. */
export const BUYER_VISIBLE_STAGES: readonly DealStage[] = [
  "marketing",
  "diligence",
  "negotiation",
];
