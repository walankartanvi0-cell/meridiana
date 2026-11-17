import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "./env";
import { ALLOWED_DOCUMENT_EXTENSIONS } from "../constants/collaboration";
import { ApiError } from "../utils/ApiError";

/**
 * Files live outside the source tree in backend/uploads. The folder is ignored
 * by Git and is never served as a static directory – every download goes
 * through an authenticated API route.
 */
export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const allowedExtensions = new Set<string>(ALLOWED_DOCUMENT_EXTENSIONS);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      callback(
        new ApiError(
          400,
          "Unsupported file type. Upload a PDF, Word, Excel, PowerPoint, text, CSV or image file.",
        ),
      );
      return;
    }
    callback(null, true);
  },
});

export const uploadDocument = upload.single("file");
