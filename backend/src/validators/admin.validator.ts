import { body } from "express-validator";
import { USER_ROLES } from "../constants/roles";
import { idParam } from "./common";

const optionalName = body("name")
  .optional()
  .trim()
  .notEmpty()
  .withMessage("Name cannot be empty.")
  .isLength({ max: 100 });

const optionalEmail = body("email")
  .optional()
  .trim()
  .isEmail()
  .withMessage("Enter a valid email address.")
  .normalizeEmail();

const optionalPhone = body("phone")
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 30 });

export const updateUserValidation = [
  idParam,
  optionalName,
  optionalEmail,
  body("role").optional().isIn([...USER_ROLES]).withMessage("Choose a valid role."),
  body("status")
    .optional()
    .isIn(["active", "suspended"])
    .withMessage("Status must be active or suspended."),
  body("company").optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body("title").optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  optionalPhone,
];

const companyName = body("companyName")
  .trim()
  .notEmpty()
  .withMessage("Company name is required.")
  .isLength({ max: 150 });

const industries = body("industries")
  .optional()
  .isArray()
  .withMessage("Industries must be a list.");

const geographies = body("geographies")
  .optional()
  .isArray()
  .withMessage("Geographies must be a list.");

const ebitdaMin = body("ebitdaMin")
  .optional({ checkFalsy: true })
  .isFloat({ min: 0 })
  .withMessage("Minimum EBITDA must be a positive number.");

const ebitdaMax = body("ebitdaMax")
  .optional({ checkFalsy: true })
  .isFloat({ min: 0 })
  .withMessage("Maximum EBITDA must be a positive number.");

const buyerStatus = body("status")
  .optional()
  .isIn(["active", "paused"])
  .withMessage("Status must be active or paused.");

export const createBuyerValidation = [
  body("user").isMongoId().withMessage("Select a valid buyer user."),
  companyName,
  body("contactName").optional({ checkFalsy: true }).trim(),
  optionalEmail,
  optionalPhone,
  industries,
  geographies,
  ebitdaMin,
  ebitdaMax,
  body("dealType").optional({ checkFalsy: true }).trim(),
  body("notes").optional({ checkFalsy: true }).trim(),
  buyerStatus,
];

export const updateBuyerValidation = [
  idParam,
  companyName.optional(),
  body("contactName").optional({ checkFalsy: true }).trim(),
  optionalEmail,
  optionalPhone,
  industries,
  geographies,
  ebitdaMin,
  ebitdaMax,
  body("dealType").optional({ checkFalsy: true }).trim(),
  body("notes").optional({ checkFalsy: true }).trim(),
  buyerStatus,
];

const sellerStatus = body("status")
  .optional()
  .isIn(["draft", "active", "closed"])
  .withMessage("Status must be draft, active or closed.");

const numericField = (field: string, message: string) =>
  body(field)
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage(message);

export const createSellerValidation = [
  body("user").isMongoId().withMessage("Select a valid seller user."),
  companyName,
  body("industry").optional({ checkFalsy: true }).trim(),
  body("location").optional({ checkFalsy: true }).trim(),
  numericField("revenue", "Revenue must be a positive number."),
  numericField("ebitda", "EBITDA must be a positive number."),
  body("yearFounded")
    .optional({ checkFalsy: true })
    .isInt({ min: 1800, max: 2100 })
    .withMessage("Enter a valid year founded."),
  body("description").optional({ checkFalsy: true }).trim(),
  body("contactName").optional({ checkFalsy: true }).trim(),
  optionalEmail,
  optionalPhone,
  sellerStatus,
];

export const updateSellerValidation = [
  idParam,
  companyName.optional(),
  body("industry").optional({ checkFalsy: true }).trim(),
  body("location").optional({ checkFalsy: true }).trim(),
  numericField("revenue", "Revenue must be a positive number."),
  numericField("ebitda", "EBITDA must be a positive number."),
  body("yearFounded")
    .optional({ checkFalsy: true })
    .isInt({ min: 1800, max: 2100 })
    .withMessage("Enter a valid year founded."),
  body("description").optional({ checkFalsy: true }).trim(),
  body("contactName").optional({ checkFalsy: true }).trim(),
  optionalEmail,
  optionalPhone,
  sellerStatus,
];

export const deleteByIdValidation = [idParam];
