import { body } from "express-validator";

const companyName = body("companyName")
  .trim()
  .notEmpty()
  .withMessage("Company name is required.")
  .isLength({ max: 150 });

const optionalPhone = body("phone")
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 30 });

export const updateBuyerProfileValidation = [
  companyName,
  body("contactName").optional({ checkFalsy: true }).trim(),
  body("email").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  optionalPhone,
  body("industries").optional().isArray(),
  body("geographies").optional().isArray(),
  body("ebitdaMin").optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body("ebitdaMax").optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body("dealType").optional({ checkFalsy: true }).trim(),
  body("notes").optional({ checkFalsy: true }).trim(),
];

export const updateSellerProfileValidation = [
  companyName,
  body("industry").optional({ checkFalsy: true }).trim(),
  body("location").optional({ checkFalsy: true }).trim(),
  body("revenue").optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body("ebitda").optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body("yearFounded").optional({ checkFalsy: true }).isInt({ min: 1800, max: 2100 }),
  body("description").optional({ checkFalsy: true }).trim(),
  body("contactName").optional({ checkFalsy: true }).trim(),
  body("email").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  optionalPhone,
];

export const updateAccountValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ max: 100 }),
  body("company").optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body("title").optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  optionalPhone,
];

export const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required."),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters.")
    .matches(/[A-Za-z]/)
    .withMessage("New password must include a letter.")
    .matches(/\d/)
    .withMessage("New password must include a number."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error("Passwords do not match.");
    return true;
  }),
];
