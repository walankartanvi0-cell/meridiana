import { body } from "express-validator";
import { DOCUMENT_CATEGORIES } from "../constants/collaboration";
import { idParam } from "./common";

/** Fresh chains per array so update rules never loosen create rules. */
const title = () =>
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Document title is required.")
    .isLength({ max: 160 })
    .withMessage("Document title must be 160 characters or fewer.");

const description = () =>
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be 1000 characters or fewer.");

const category = () =>
  body("category")
    .optional()
    .isIn([...DOCUMENT_CATEGORIES])
    .withMessage("Choose a valid document category.");

const deal = () =>
  body("deal")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("Select a valid deal.");

export const uploadDocumentValidation = [title(), description(), category(), deal()];

export const updateDocumentValidation = [
  idParam,
  title().optional(),
  description(),
  category(),
  deal(),
];

export const documentByIdValidation = [idParam];
