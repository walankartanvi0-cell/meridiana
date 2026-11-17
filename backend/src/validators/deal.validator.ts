import { body } from "express-validator";
import { DEAL_STAGES } from "../constants/deals";
import { idParam } from "./common";

const title = body("title")
  .trim()
  .notEmpty()
  .withMessage("Deal title is required.")
  .isLength({ max: 150 });

const seller = body("seller")
  .optional({ checkFalsy: true })
  .isMongoId()
  .withMessage("Select a valid seller profile.");

const buyer = body("buyer")
  .optional({ checkFalsy: true })
  .isMongoId()
  .withMessage("Select a valid buyer profile.");

const advisor = body("advisor")
  .optional({ checkFalsy: true })
  .isMongoId()
  .withMessage("Select a valid advisor.");

const stage = body("stage")
  .optional()
  .isIn([...DEAL_STAGES])
  .withMessage("Choose a valid deal stage.");

const enterpriseValue = body("enterpriseValue")
  .optional({ checkFalsy: true })
  .isFloat({ min: 0 })
  .withMessage("Enterprise value must be a positive number.");

const ebitda = body("ebitda")
  .optional({ checkFalsy: true })
  .isFloat({ min: 0 })
  .withMessage("EBITDA must be a positive number.");

const expectedCloseDate = body("expectedCloseDate")
  .optional({ checkFalsy: true })
  .isISO8601()
  .withMessage("Enter a valid expected close date.")
  .toDate();

const probability = body("probability")
  .optional({ checkFalsy: true })
  .isInt({ min: 0, max: 100 })
  .withMessage("Probability must be between 0 and 100.");

const description = body("description").optional({ checkFalsy: true }).trim();
const notes = body("notes").optional({ checkFalsy: true }).trim();

const requireParty = body().custom((value: { seller?: string; buyer?: string }) => {
  if (!value?.seller && !value?.buyer) {
    throw new Error("Select at least a seller or a buyer for this deal.");
  }
  return true;
});

export const createDealValidation = [
  title,
  seller,
  buyer,
  advisor,
  stage,
  enterpriseValue,
  ebitda,
  expectedCloseDate,
  probability,
  description,
  notes,
  requireParty,
];

export const updateDealValidation = [
  idParam,
  title.optional(),
  seller.optional(),
  buyer.optional(),
  advisor.optional(),
  stage.optional(),
  enterpriseValue.optional(),
  ebitda.optional(),
  expectedCloseDate.optional(),
  probability.optional(),
  description.optional(),
  notes.optional(),
];

export const dealByIdValidation = [idParam];
