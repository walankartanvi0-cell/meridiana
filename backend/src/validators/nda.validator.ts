import { body } from "express-validator";
import { NDA_STATUSES } from "../constants/collaboration";
import { idParam } from "./common";

const notes = () =>
  body("notes")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Notes must be 2000 characters or fewer.");

export const createNdaValidation = [
  body("deal").isMongoId().withMessage("Select a valid deal."),
  notes(),
];

export const updateNdaValidation = [
  idParam,
  body("status")
    .optional()
    .isIn([...NDA_STATUSES])
    .withMessage("Choose a valid NDA status."),
  notes(),
  body("expiresAt")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Enter a valid expiry date.")
    .toDate(),
  body("document")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("Select a valid signed document."),
];

export const ndaByIdValidation = [idParam];
