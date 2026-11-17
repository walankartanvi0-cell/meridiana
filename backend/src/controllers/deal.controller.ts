import type { Request, Response } from "express";
import { Types } from "mongoose";
import { BUYER_VISIBLE_STAGES, DEAL_STAGES } from "../constants/deals";
import { Buyer } from "../models/Buyer";
import { Deal, type IDeal } from "../models/Deal";
import { Seller } from "../models/Seller";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { notify } from "../utils/notify";
import { sendResponse } from "../utils/sendResponse";

type Filter = Record<string, unknown>;

function routeId(value: unknown) {
  return typeof value === "string" ? value : "";
}

function pick(input: Record<string, unknown>, keys: readonly string[]) {
  const result: Filter = {};
  for (const key of keys) {
    if (input[key] !== undefined) result[key] = input[key];
  }
  return result;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sameId(value: unknown, id?: string) {
  if (!id || value === undefined || value === null) return false;
  if (typeof value === "string") return value === id;
  if (typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id) === id;
  }
  return String(value) === id;
}

function managedFilter(req: Request): Filter {
  return req.user?.role === "admin" ? {} : { advisor: req.user?.id };
}

async function findDeals(filter: Filter) {
  return Deal.find(filter)
    .populate({
      path: "seller",
      select: "companyName industry location status user",
      populate: { path: "user", select: "name email" },
    })
    .populate({
      path: "buyer",
      select: "companyName industries geographies status user",
      populate: { path: "user", select: "name email" },
    })
    .populate("advisor", "name email")
    .populate("createdBy", "name email")
    .sort({ updatedAt: -1 });
}

async function findDealById(id: string) {
  return Deal.findById(id)
    .populate({
      path: "seller",
      select: "companyName industry location status user",
      populate: { path: "user", select: "name email" },
    })
    .populate({
      path: "buyer",
      select: "companyName industries geographies status user",
      populate: { path: "user", select: "name email" },
    })
    .populate("advisor", "name email")
    .populate("createdBy", "name email");
}

async function buyerProfileId(req: Request) {
  const profile = await Buyer.findOne({ user: req.user?.id }).select("_id");
  return profile ? String(profile._id) : null;
}

async function sellerProfileId(req: Request) {
  const profile = await Seller.findOne({ user: req.user?.id }).select("_id");
  return profile ? String(profile._id) : null;
}

function canManage(req: Request, deal: IDeal | null) {
  if (!deal) return false;
  if (req.user?.role === "admin") return true;
  return sameId(deal.advisor, req.user?.id);
}

/** GET /api/deals */
export const listDeals = asyncHandler(async (req: Request, res: Response) => {
  const filter = managedFilter(req);
  const stage = typeof req.query.stage === "string" ? req.query.stage : "";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  if ((DEAL_STAGES as readonly string[]).includes(stage)) filter.stage = stage;
  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }

  const deals = await findDeals(filter);
  sendResponse(res, 200, "Deals retrieved.", { deals });
});

/** GET /api/deals/pipeline */
export const getPipeline = asyncHandler(async (req: Request, res: Response) => {
  const deals = await Deal.find(managedFilter(req)).select("stage enterpriseValue");
  const byStage = Object.fromEntries(DEAL_STAGES.map((stage) => [stage, 0])) as Record<string, number>;
  let totalValue = 0;

  for (const deal of deals) {
    byStage[deal.stage] = (byStage[deal.stage] ?? 0) + 1;
    totalValue += deal.enterpriseValue ?? 0;
  }

  sendResponse(res, 200, "Pipeline summary retrieved.", {
    pipeline: {
      byStage,
      totalDeals: deals.length,
      totalValue,
    },
  });
});

/** GET /api/deals/options */
export const getDealOptions = asyncHandler(async (_req: Request, res: Response) => {
  const [buyers, sellers, advisors] = await Promise.all([
    Buyer.find().populate("user", "name email").select("companyName industries geographies status user"),
    Seller.find().populate("user", "name email").select("companyName industry location status user"),
    User.find({ role: "advisor" }).select("name email"),
  ]);

  sendResponse(res, 200, "Deal options retrieved.", { buyers, sellers, advisors });
});

/** GET /api/deals/available */
export const listAvailableDeals = asyncHandler(async (req: Request, res: Response) => {
  const profileId = await buyerProfileId(req);
  if (!profileId) {
    sendResponse(res, 200, "Available deals retrieved.", { deals: [] });
    return;
  }

  const deals = await findDeals({
    stage: { $in: [...BUYER_VISIBLE_STAGES] },
    $or: [{ buyer: { $exists: false } }, { buyer: null }, { buyer: new Types.ObjectId(profileId) }],
  });

  sendResponse(res, 200, "Available deals retrieved.", { deals });
});

/** GET /api/deals/saved */
export const listSavedDeals = asyncHandler(async (req: Request, res: Response) => {
  const profileId = await buyerProfileId(req);
  if (!profileId) {
    sendResponse(res, 200, "Saved deals retrieved.", { deals: [] });
    return;
  }

  const deals = await findDeals({
    savedBy: new Types.ObjectId(req.user?.id ?? ""),
    $or: [{ buyer: { $exists: false } }, { buyer: null }, { buyer: new Types.ObjectId(profileId) }],
  });

  sendResponse(res, 200, "Saved deals retrieved.", { deals });
});

/** GET /api/deals/mine */
export const listMyDeals = asyncHandler(async (req: Request, res: Response) => {
  const profileId = await sellerProfileId(req);
  if (!profileId) {
    sendResponse(res, 200, "Your deals retrieved.", { deals: [] });
    return;
  }

  const deals = await findDeals({ seller: new Types.ObjectId(profileId) });
  sendResponse(res, 200, "Your deals retrieved.", { deals });
});

/** GET /api/deals/:id */
export const getDeal = asyncHandler(async (req: Request, res: Response) => {
  const deal = await findDealById(routeId(req.params.id));
  if (!deal) throw new ApiError(404, "Deal not found.");

  if (req.user?.role === "admin" || req.user?.role === "advisor") {
    if (!canManage(req, deal)) throw new ApiError(403, "You do not have access to this deal.");
  } else if (req.user?.role === "buyer") {
    const profileId = await buyerProfileId(req);
    const visible =
      !!profileId &&
      (sameId(deal.buyer, profileId) ||
        (!deal.buyer && (BUYER_VISIBLE_STAGES as readonly string[]).includes(deal.stage)));
    if (!visible) throw new ApiError(403, "You do not have access to this deal.");
  } else if (req.user?.role === "seller") {
    const profileId = await sellerProfileId(req);
    if (!profileId || !sameId(deal.seller, profileId)) {
      throw new ApiError(403, "You do not have access to this deal.");
    }
  }

  sendResponse(res, 200, "Deal retrieved.", { deal });
});

/** POST /api/deals */
export const createDeal = asyncHandler(async (req: Request, res: Response) => {
  const changes = pick(req.body, [
    "title",
    "seller",
    "buyer",
    "advisor",
    "stage",
    "enterpriseValue",
    "ebitda",
    "expectedCloseDate",
    "probability",
    "description",
    "notes",
  ]);

  if (!changes.seller && !changes.buyer) {
    throw new ApiError(400, "Select at least a seller or a buyer for this deal.");
  }

  if (req.user?.role !== "admin") delete changes.advisor;

  if (changes.advisor) {
    const advisorUser = await User.findById(changes.advisor);
    if (!advisorUser || !["admin", "advisor"].includes(advisorUser.role)) {
      throw new ApiError(400, "Select an existing user with the Advisor role.");
    }
  }
  if (changes.seller && !(await Seller.findById(changes.seller))) {
    throw new ApiError(400, "Select an existing seller profile.");
  }
  if (changes.buyer && !(await Buyer.findById(changes.buyer))) {
    throw new ApiError(400, "Select an existing buyer profile.");
  }

  const advisorId = req.user?.role === "admin" && changes.advisor ? changes.advisor : req.user?.id;
  const deal = await Deal.create({
    ...changes,
    advisor: advisorId,
    createdBy: req.user?.id,
  });

  await notify({
    userId: String(advisorId),
    title: "New deal assigned",
    message: `You have been assigned to ${deal.title}.`,
    type: "deal",
  });

  const populated = await findDealById(deal.id);
  sendResponse(res, 201, "Deal created.", { deal: populated });
});

/** PATCH /api/deals/:id */
export const updateDeal = asyncHandler(async (req: Request, res: Response) => {
  const deal = await Deal.findById(routeId(req.params.id));
  if (!deal) throw new ApiError(404, "Deal not found.");
  if (!canManage(req, deal)) throw new ApiError(403, "You do not have permission to update this deal.");

  const changes = pick(req.body, [
    "title",
    "seller",
    "buyer",
    "advisor",
    "stage",
    "enterpriseValue",
    "ebitda",
    "expectedCloseDate",
    "probability",
    "description",
    "notes",
  ]);

  if (req.user?.role !== "admin") {
    if (changes.advisor && !sameId(changes.advisor, req.user?.id)) {
      throw new ApiError(400, "Advisors can only edit deals assigned to them.");
    }
    delete changes.advisor;
  } else if (changes.advisor) {
    const advisorUser = await User.findById(changes.advisor);
    if (!advisorUser || !["admin", "advisor"].includes(advisorUser.role)) {
      throw new ApiError(400, "Select an existing user with the Advisor role.");
    }
  }

  if (changes.seller && !(await Seller.findById(changes.seller))) {
    throw new ApiError(400, "Select an existing seller profile.");
  }
  if (changes.buyer && !(await Buyer.findById(changes.buyer))) {
    throw new ApiError(400, "Select an existing buyer profile.");
  }

  const finalSeller = changes.seller !== undefined ? changes.seller : deal.seller;
  const finalBuyer = changes.buyer !== undefined ? changes.buyer : deal.buyer;
  if (!finalSeller && !finalBuyer) {
    throw new ApiError(400, "A deal must have at least a seller or a buyer.");
  }

  const previousStage = deal.stage;
  Object.assign(deal, changes);
  await deal.save();

  if (changes.stage && changes.stage !== previousStage) {
    await notify({
      userId: String(deal.advisor),
      title: "Deal stage updated",
      message: `${deal.title} moved to ${String(changes.stage)}.`,
      type: "deal",
    });
  }

  const populated = await findDealById(deal.id);
  sendResponse(res, 200, "Deal updated.", { deal: populated });
});

/** DELETE /api/deals/:id */
export const deleteDeal = asyncHandler(async (req: Request, res: Response) => {
  const deal = await Deal.findById(routeId(req.params.id));
  if (!deal) throw new ApiError(404, "Deal not found.");
  if (!canManage(req, deal)) throw new ApiError(403, "You do not have permission to delete this deal.");

  await deal.deleteOne();
  sendResponse(res, 200, "Deal deleted.");
});

/** POST /api/deals/:id/save */
export const saveDeal = asyncHandler(async (req: Request, res: Response) => {
  const profileId = await buyerProfileId(req);
  if (!profileId) throw new ApiError(404, "Create a buyer profile before saving opportunities.");

  const deal = await Deal.findById(routeId(req.params.id));
  if (!deal) throw new ApiError(404, "Deal not found.");

  const visible =
    sameId(deal.buyer, profileId) ||
    (!deal.buyer && (BUYER_VISIBLE_STAGES as readonly string[]).includes(deal.stage));
  if (!visible) throw new ApiError(403, "This opportunity is not available to you.");

  const userId = new Types.ObjectId(req.user?.id ?? "");
  if (!deal.savedBy.some((id) => String(id) === String(userId))) {
    deal.savedBy.push(userId);
    await deal.save();
  }

  sendResponse(res, 200, "Opportunity saved.");
});

/** DELETE /api/deals/:id/save */
export const unsaveDeal = asyncHandler(async (req: Request, res: Response) => {
  const deal = await Deal.findById(routeId(req.params.id));
  if (!deal) throw new ApiError(404, "Deal not found.");

  deal.savedBy = deal.savedBy.filter((id) => String(id) !== req.user?.id);
  await deal.save();

  sendResponse(res, 200, "Opportunity removed from saved list.");
});
