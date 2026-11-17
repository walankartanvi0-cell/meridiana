import fs from "fs";
import path from "path";
import type { Request, Response } from "express";
import { UPLOAD_DIR } from "../config/upload";
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "../constants/collaboration";
import { isUserRole, type UserRole } from "../constants/roles";
import { Deal } from "../models/Deal";
import { DocumentFile, type IDocument } from "../models/Document";
import { Nda } from "../models/NDA";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  canAccessDeal,
  getAccessibleDealIds,
  getAccessibleDeals,
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

function parseVisibleTo(value: unknown): UserRole[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const roles = raw.map((item) => String(item).trim()).filter(isUserRole);
  return [...new Set(roles)];
}

function parseCategory(value: unknown): DocumentCategory {
  return typeof value === "string" &&
    (DOCUMENT_CATEGORIES as readonly string[]).includes(value)
    ? (value as DocumentCategory)
    : "other";
}

function findDocumentById(id: string) {
  return DocumentFile.findById(id)
    .populate("deal", "title stage")
    .populate("uploadedBy", "name email role");
}

async function canViewDocument(req: Request, document: IDocument) {
  if (req.user?.role === "admin") return true;
  if (sameId(document.uploadedBy, req.user?.id)) return true;
  if (!document.deal) {
    // A signed NDA is often stored as a personal file. The buyer named on the
    // NDA (or the person who requested it) may still download it.
    return canViewViaNda(req, document._id);
  }

  const role = req.user?.role;
  if (!role || !document.visibleTo.includes(role)) {
    return canViewViaNda(req, document._id);
  }

  const deal = await Deal.findById(document.deal);
  return (await canAccessDeal(req, deal)) || canViewViaNda(req, document._id);
}

async function canViewViaNda(req: Request, documentId: unknown) {
  const nda = await Nda.findOne({ document: documentId }).select(
    "buyer requestedBy",
  );
  if (!nda) return false;
  if (sameId(nda.requestedBy, req.user?.id)) return true;
  if (req.user?.role !== "buyer") return false;

  const profileId = await getBuyerProfileId(req.user?.id);
  return Boolean(profileId) && sameId(nda.buyer, profileId ?? undefined);
}

function canManageDocument(req: Request, document: IDocument) {
  return req.user?.role === "admin" || sameId(document.uploadedBy, req.user?.id);
}

/** GET /api/documents */
export const listDocuments = asyncHandler(async (req: Request, res: Response) => {
  const filter: Filter = {};
  const role = req.user?.role;

  if (role !== "admin") {
    const dealIds = await getAccessibleDealIds(req);
    const or: Filter[] = [{ uploadedBy: req.user?.id }];
    if (dealIds.length) or.push({ deal: { $in: dealIds }, visibleTo: role });
    filter.$or = or;
  }

  const category = typeof req.query.category === "string" ? req.query.category : "";
  if ((DOCUMENT_CATEGORIES as readonly string[]).includes(category)) {
    filter.category = category;
  }

  const dealId = queryObjectId(req.query.dealId, "deal");
  if (dealId) filter.deal = dealId;

  const documents = await DocumentFile.find(filter)
    .populate("deal", "title stage")
    .populate("uploadedBy", "name email role")
    .sort({ createdAt: -1 });

  sendResponse(res, 200, "Documents retrieved.", { documents });
});

/** GET /api/documents/options */
export const getDocumentOptions = asyncHandler(async (req: Request, res: Response) => {
  const deals = await getAccessibleDeals(req);
  sendResponse(res, 200, "Document options retrieved.", { deals });
});

/** POST /api/documents */
export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) throw new ApiError(400, "Choose a file to upload.");

  try {
    const dealId = typeof req.body.deal === "string" ? req.body.deal : "";
    let deal = null;

    if (dealId) {
      deal = await Deal.findById(dealId);
      if (!deal) throw new ApiError(404, "Deal not found.");
      if (!(await canAccessDeal(req, deal))) {
        throw new ApiError(403, "You do not have access to this deal.");
      }
    }

    const title =
      typeof req.body.title === "string" && req.body.title.trim()
        ? req.body.title.trim()
        : file.originalname;
    const visibleTo = parseVisibleTo(req.body.visibleTo);

    const document = await DocumentFile.create({
      title,
      description: typeof req.body.description === "string" ? req.body.description : undefined,
      fileName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype || "application/octet-stream",
      size: file.size,
      category: parseCategory(req.body.category),
      deal: deal?._id,
      uploadedBy: req.user?.id,
      visibleTo: visibleTo.length ? visibleTo : ["admin", "advisor"],
    });

    if (deal?.advisor && ["buyer", "seller"].includes(req.user?.role ?? "")) {
      await notify({
        userId: String(deal.advisor),
        title: "New document uploaded",
        message: `${req.user?.role === "buyer" ? "A buyer" : "A seller"} uploaded "${document.title}" for ${deal.title}.`,
        type: "document",
      });
    }

    const populated = await findDocumentById(document.id);
    sendResponse(res, 201, "Document uploaded.", { document: populated });
  } catch (error) {
    await fs.promises.unlink(file.path).catch(() => undefined);
    throw error;
  }
});

/** GET /api/documents/:id */
export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  const document = await findDocumentById(routeId(req.params.id));
  if (!document) throw new ApiError(404, "Document not found.");
  if (!(await canViewDocument(req, document))) {
    throw new ApiError(403, "You do not have access to this document.");
  }

  sendResponse(res, 200, "Document retrieved.", { document });
});

/** GET /api/documents/:id/download */
export const downloadDocument = asyncHandler(async (req: Request, res: Response) => {
  const document = await DocumentFile.findById(routeId(req.params.id));
  if (!document) throw new ApiError(404, "Document not found.");
  if (!(await canViewDocument(req, document))) {
    throw new ApiError(403, "You do not have access to this document.");
  }

  const filePath = path.join(UPLOAD_DIR, path.basename(document.storedName));
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
  } catch {
    throw new ApiError(404, "The stored file could not be found.");
  }

  res.setHeader("Cache-Control", "private, no-store");
  res.download(filePath, document.fileName);
});

/** PATCH /api/documents/:id */
export const updateDocument = asyncHandler(async (req: Request, res: Response) => {
  const document = await DocumentFile.findById(routeId(req.params.id));
  if (!document) throw new ApiError(404, "Document not found.");
  if (!canManageDocument(req, document)) {
    throw new ApiError(403, "You do not have permission to update this document.");
  }

  if (typeof req.body.title === "string") document.title = req.body.title.trim();
  if (typeof req.body.description === "string") document.description = req.body.description;
  if (typeof req.body.category === "string") {
    document.category = parseCategory(req.body.category);
  }

  if (req.body.visibleTo !== undefined) {
    const visibleTo = parseVisibleTo(req.body.visibleTo);
    if (visibleTo.length) document.visibleTo = visibleTo;
  }

  if (req.body.deal !== undefined) {
    const dealId = typeof req.body.deal === "string" ? req.body.deal : "";
    if (!dealId) {
      document.deal = undefined;
    } else {
      const deal = await Deal.findById(dealId);
      if (!deal) throw new ApiError(404, "Deal not found.");
      if (!(await canAccessDeal(req, deal))) {
        throw new ApiError(403, "You do not have access to this deal.");
      }
      document.deal = deal._id;
    }
  }

  await document.save();
  const populated = await findDocumentById(document.id);
  sendResponse(res, 200, "Document updated.", { document: populated });
});

/** DELETE /api/documents/:id */
export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  const document = await DocumentFile.findById(routeId(req.params.id));
  if (!document) throw new ApiError(404, "Document not found.");
  if (!canManageDocument(req, document)) {
    throw new ApiError(403, "You do not have permission to delete this document.");
  }

  const storedName = document.storedName;
  await Nda.updateMany({ document: document._id }, { $unset: { document: 1 } });
  await document.deleteOne();
  await fs.promises
    .unlink(path.join(UPLOAD_DIR, path.basename(storedName)))
    .catch(() => undefined);

  sendResponse(res, 200, "Document deleted.");
});
