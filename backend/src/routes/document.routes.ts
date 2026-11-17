import { Router } from "express";
import { uploadDocument as uploadMiddleware } from "../config/upload";
import {
  deleteDocument,
  downloadDocument,
  getDocument,
  getDocumentOptions,
  listDocuments,
  updateDocument,
  uploadDocument,
} from "../controllers/document.controller";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  documentByIdValidation,
  updateDocumentValidation,
  uploadDocumentValidation,
} from "../validators/document.validator";

const router = Router();

router.use(protect);

router.get("/", listDocuments);
router.get("/options", getDocumentOptions);
router.post("/", uploadMiddleware, uploadDocumentValidation, validate, uploadDocument);
router.get("/:id/download", documentByIdValidation, validate, downloadDocument);
router.get("/:id", documentByIdValidation, validate, getDocument);
router.patch("/:id", updateDocumentValidation, validate, updateDocument);
router.delete("/:id", documentByIdValidation, validate, deleteDocument);

export default router;
