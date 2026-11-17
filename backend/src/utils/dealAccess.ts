import type { Request } from "express";
import { Types } from "mongoose";
import { BUYER_VISIBLE_STAGES } from "../constants/deals";
import { Buyer } from "../models/Buyer";
import { Deal, type IDeal } from "../models/Deal";
import { Seller } from "../models/Seller";
import { User } from "../models/User";

type Filter = Record<string, unknown>;

/** Safely compares a populated or raw ObjectId with a string id. */
export function sameId(value: unknown, id?: string) {
  if (!id || value === undefined || value === null) return false;
  if (typeof value === "string") return value === id;
  if (typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id) === id;
  }
  return String(value) === id;
}

export async function getBuyerProfileId(userId?: string) {
  if (!userId) return null;
  const profile = await Buyer.findOne({ user: userId }).select("_id");
  return profile ? String(profile._id) : null;
}

export async function getSellerProfileId(userId?: string) {
  if (!userId) return null;
  const profile = await Seller.findOne({ user: userId }).select("_id");
  return profile ? String(profile._id) : null;
}

/**
 * Mongo filter for deals the signed-in user actively collaborates on.
 * Admins see everything, advisors see assigned deals, and buyers/sellers see
 * only deals linked to their own profile.
 */
export async function getAccessibleDealFilter(req: Request): Promise<Filter | null> {
  const role = req.user?.role;

  if (role === "admin") return {};
  if (role === "advisor") return { advisor: req.user?.id };
  if (role === "buyer") {
    const profileId = await getBuyerProfileId(req.user?.id);
    return profileId ? { buyer: new Types.ObjectId(profileId) } : null;
  }
  if (role === "seller") {
    const profileId = await getSellerProfileId(req.user?.id);
    return profileId ? { seller: new Types.ObjectId(profileId) } : null;
  }

  return null;
}

export async function getAccessibleDealIds(req: Request) {
  const filter = await getAccessibleDealFilter(req);
  if (!filter) return [];

  const deals = await Deal.find(filter).select("_id");
  return deals.map((deal) => deal._id);
}

export async function getAccessibleDeals(req: Request) {
  const filter = await getAccessibleDealFilter(req);
  if (!filter) return [];

  return Deal.find(filter).select("title stage").sort({ updatedAt: -1 });
}

/** True when the user is an active participant on this specific deal. */
export async function canAccessDeal(req: Request, deal: IDeal | null) {
  if (!deal) return false;

  const role = req.user?.role;
  if (role === "admin") return true;
  if (role === "advisor") return sameId(deal.advisor, req.user?.id);
  if (role === "buyer") {
    const profileId = await getBuyerProfileId(req.user?.id);
    return Boolean(profileId) && sameId(deal.buyer, profileId ?? undefined);
  }
  if (role === "seller") {
    const profileId = await getSellerProfileId(req.user?.id);
    return Boolean(profileId) && sameId(deal.seller, profileId ?? undefined);
  }

  return false;
}

/**
 * Buyers may request an NDA on a deal assigned to them or on an unassigned
 * opportunity that is visible in their pipeline.
 */
export async function canSeeDealOpportunity(req: Request, deal: IDeal | null) {
  if (!deal) return false;
  if (await canAccessDeal(req, deal)) return true;
  if (req.user?.role !== "buyer") return false;

  const profileId = await getBuyerProfileId(req.user?.id);
  if (!profileId) return false;

  return (
    sameId(deal.buyer, profileId) ||
    (!deal.buyer && (BUYER_VISIBLE_STAGES as readonly string[]).includes(deal.stage))
  );
}

/** User ids for the advisor, buyer and seller attached to a deal. */
export async function getDealPartyUserIds(deal: IDeal | null) {
  if (!deal) return [] as string[];

  const ids = new Set<string>();
  if (deal.advisor) ids.add(String(deal.advisor));

  if (deal.seller) {
    const seller = await Seller.findById(deal.seller).select("user");
    if (seller?.user) ids.add(String(seller.user));
  }

  if (deal.buyer) {
    const buyer = await Buyer.findById(deal.buyer).select("user");
    if (buyer?.user) ids.add(String(buyer.user));
  }

  return [...ids];
}

/**
 * Users the signed-in person is allowed to invite or message.
 * Admins/advisors can reach the whole active team. Buyers and sellers can
 * reach the advisory team plus the parties on their own deals.
 */
export async function getContactableUsers(req: Request) {
  const role = req.user?.role;
  if (!role) return [];

  if (role === "admin" || role === "advisor") {
    return User.find({ status: "active" }).select("name email role").sort({ name: 1 });
  }

  const dealIds = await getAccessibleDealIds(req);
  const deals = await Deal.find({ _id: { $in: dealIds } })
    .select("advisor buyer seller")
    .populate({ path: "buyer", select: "user" })
    .populate({ path: "seller", select: "user" });

  const userIds = new Set<string>([req.user?.id ?? ""]);
  for (const deal of deals) {
    if (deal.advisor) userIds.add(String(deal.advisor));
    const buyer = deal.buyer as unknown as { user?: unknown } | null;
    if (buyer?.user) userIds.add(String(buyer.user));
    const seller = deal.seller as unknown as { user?: unknown } | null;
    if (seller?.user) userIds.add(String(seller.user));
  }

  const advisoryTeam = await User.find({
    role: { $in: ["admin", "advisor"] },
    status: "active",
  }).select("_id");

  for (const member of advisoryTeam) userIds.add(String(member._id));

  return User.find({ _id: { $in: [...userIds] }, status: "active" })
    .select("name email role")
    .sort({ name: 1 });
}
