import type { Request, Response } from "express";
import { Types } from "mongoose";
import { NDA_STATUSES, type NdaStatus } from "../constants/collaboration";
import { Buyer } from "../models/Buyer";
import { Deal } from "../models/Deal";
import { DocumentFile } from "../models/Document";
import { Nda, type INda } from "../models/NDA";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  canAccessDeal,
  canSeeDealOpportunity,
  getAccessibleDealIds,
  getBuyerProfileId,
  sameId,
} from "../utils/dealAccess";
import { notify } from "../utils/notify";
import { queryObjectId } from "../utils/queryObjectId";
import { sendResponse } from "../utils/sendResponse";

type Filter = Record<string, unknown>;

function routeId(value: unknown) {
  return typeof value === "string" ? value : "";
}

function findNdaById(id: string) {
  return Nda.findById(id)
    .populate("deal", "title stage")
    .populate({ path: "buyer", select: "companyName user", populate: { path: "user", select: "name email" } })
    .populate("requestedBy", "name email role")
    .populate("document", "title fileName size category");
}

async function ndaFilter(req: Request): Promise<Filter> {
  const role = req.user?.role;

  if (role === "admin") return {};
  if (role === "advisor" || role === "seller") {
    const dealIds = await getAccessibleDealIds(req);
    return { deal: { $in: dealIds } };
  }
  if (role === "buyer") {
    const profileId = await getBuyerProfileId(req.user?.id);
    return profileId
      ? { buyer: new Types.ObjectId(profileId) }
      : { requestedBy: req.user?.id };
  }

  return { _id: null };
}

async function canViewNda(req: Request, nda: INda) {
  const role = req.user?.role;
  if (role === "admin") return true;

  if (role === "buyer") {
    const profileId = await getBuyerProfileId(req.user?.id);
    return (
      sameId(nda.requestedBy, req.user?.id) ||
      (Boolean(profileId) && sameId(nda.buyer, profileId ?? undefined))
    );
  }

  if (role === "advisor" || role === "seller") {
    const deal = await Deal.findById(nda.deal);
    return canAccessDeal(req, deal);
  }

  return false;
}

async function canManageNda(req: Request, nda: INda) {
  if (req.user?.role === "admin") return true;
  if (req.user?.role !== "advisor" && req.user?.role !== "seller") return false;

  const deal = await Deal.findById(nda.deal);
  return canAccessDeal(req, deal);
}

/** GET /api/ndas */
export const listNdas = asyncHandler(async (req: Request, res: Response) => {
  const scope = await ndaFilter(req);
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const dealId = queryObjectId(req.query.dealId, "deal");

  // Filters are combined with $and so a query parameter can only narrow the
  // role-based scope. It must never replace it and widen access.
  const extra: Filter = {};
  if ((NDA_STATUSES as readonly string[]).includes(status)) extra.status = status;
  if (dealId) extra.deal = dealId;
  const filter: Filter = Object.keys(extra).length ? { $and: [scope, extra] } : scope;

  const ndas = await Nda.find(filter)
    .populate("deal", "title stage")
    .populate({
      path: "buyer",
      select: "companyName user",
      populate: { path: "user", select: "name email" },
    })
    .populate("requestedBy", "name email role")
    .populate("document", "title fileName size category")
    .sort({ updatedAt: -1 });

  sendResponse(res, 200, "NDA requests retrieved.", { ndas });
});

/** POST /api/ndas */
export const createNda = asyncHandler(async (req: Request, res: Response) => {
  const profileId = await getBuyerProfileId(req.user?.id);
  if (!profileId) {
    throw new ApiError(400, "Create your buyer profile before requesting an NDA.");
  }

  const deal = await Deal.findById(req.body.deal);
  if (!deal) throw new ApiError(404, "Deal not found.");
  if (!(await canSeeDealOpportunity(req, deal))) {
    throw new ApiError(403, "This opportunity is not available to you.");
  }

  const existing = await Nda.findOne({
    deal: deal._id,
    buyer: new Types.ObjectId(profileId),
    status: { $in: ["requested", "under_review", "signed"] },
  });
  if (existing) {
    throw new ApiError(409, "An active NDA already exists for this opportunity.");
  }

  const nda = await Nda.create({
    deal: deal._id,
    buyer: profileId,
    requestedBy: req.user?.id,
    notes: typeof req.body.notes === "string" ? req.body.notes : undefined,
    status: "requested",
  });

  if (deal.advisor) {
    await notify({
      userId: String(deal.advisor),
      title: "New NDA request",
      message: `A buyer requested an NDA for ${deal.title}.`,
      type: "nda",
    });
  }

  const populated = await findNdaById(nda.id);
  sendResponse(res, 201, "NDA request submitted.", { nda: populated });
});

/** GET /api/ndas/:id */
export const getNda = asyncHandler(async (req: Request, res: Response) => {
  const nda = await findNdaById(routeId(req.params.id));
  if (!nda) throw new ApiError(404, "NDA request not found.");
  if (!(await canViewNda(req, nda))) {
    throw new ApiError(403, "You do not have access to this NDA.");
  }

  sendResponse(res, 200, "NDA request retrieved.", { nda });
});

/** PATCH /api/ndas/:id */
export const updateNda = asyncHandler(async (req: Request, res: Response) => {
  const nda = await Nda.findById(routeId(req.params.id));
  if (!nda) throw new ApiError(404, "NDA request not found.");
  if (!(await canManageNda(req, nda))) {
    throw new ApiError(403, "You do not have permission to update this NDA.");
  }

  const previousStatus = nda.status;

  if (typeof req.body.status === "string") {
    nda.status = req.body.status as NdaStatus;
  }
  if (typeof req.body.notes === "string") nda.notes = req.body.notes;
  if (req.body.expiresAt !== undefined) {
    nda.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : undefined;
  }

  if (req.body.document !== undefined) {
    if (!req.body.document) {
      nda.document = undefined;
    } else {
      const document = await DocumentFile.findById(req.body.document);
      if (!document) throw new ApiError(400, "Select an existing signed document.");

      // Only a document tied to this deal, uploaded by the acting user, uploaded
      // by the advisory team, or uploaded by this NDA's own buyer may be
      // linked. Otherwise an NDA could expose another client's private file.
      const [uploader, buyerProfile] = await Promise.all([
        User.findById(document.uploadedBy).select("role"),
        Buyer.findById(nda.buyer).select("user"),
      ]);
      const sameDeal = document.deal && String(document.deal) === String(nda.deal);
      const uploadedByMe = sameId(document.uploadedBy, req.user?.id);
      const staffDocument = Boolean(
        uploader && (uploader.role === "admin" || uploader.role === "advisor"),
      );
      const uploadedByNdaBuyer = Boolean(
        buyerProfile?.user && sameId(document.uploadedBy, String(buyerProfile.user)),
      );

      if (!sameDeal && !uploadedByMe && !staffDocument && !uploadedByNdaBuyer) {
        throw new ApiError(400, "Choose a document linked to this deal or uploaded by you.");
      }

      nda.document = document._id;
    }
  }

  if (nda.status === "signed" && !nda.signedAt) nda.signedAt = new Date();

  await nda.save();

  if (nda.status !== previousStatus) {
    const buyerProfile = await Buyer.findById(nda.buyer).select("user");
    if (buyerProfile?.user) {
      await notify({
        userId: String(buyerProfile.user),
        title: "NDA status updated",
        message: `Your NDA request is now marked as ${nda.status.replace("_", " ")}.`,
        type: "nda",
      });
    }
  }

  const populated = await findNdaById(nda.id);
  sendResponse(res, 200, "NDA request updated.", { nda: populated });
});

/** DELETE /api/ndas/:id */
export const deleteNda = asyncHandler(async (req: Request, res: Response) => {
  const nda = await Nda.findById(routeId(req.params.id));
  if (!nda) throw new ApiError(404, "NDA request not found.");

  const isAdmin = req.user?.role === "admin";
  const isRequester = sameId(nda.requestedBy, req.user?.id);
  if (!isAdmin && !isRequester) {
    throw new ApiError(403, "You do not have permission to delete this NDA.");
  }
  if (!isAdmin && !["requested", "under_review"].includes(nda.status)) {
    throw new ApiError(400, "Only pending NDA requests can be withdrawn.");
  }

  await nda.deleteOne();
  sendResponse(res, 200, "NDA request deleted.");
});
