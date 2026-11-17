import { body } from "express-validator";

export const contactRules = [
  body("name").trim().notEmpty().withMessage("Please enter your name.").isLength({ max: 120 }),
  body("email").trim().isEmail().withMessage("Please enter a valid email address.").normalizeEmail(),
  body("subject").trim().notEmpty().withMessage("Please enter a subject.").isLength({ max: 180 }),
  body("message").trim().notEmpty().withMessage("Please enter a message.").isLength({ max: 5000 }),
  body("company").optional().trim().isLength({ max: 180 }),
];

export const consultationRules = [
  body("firstName").trim().notEmpty().withMessage("Please enter your first name.").isLength({ max: 100 }),
  body("lastName").trim().notEmpty().withMessage("Please enter your last name.").isLength({ max: 100 }),
  body("email").trim().isEmail().withMessage("Please enter a valid email address.").normalizeEmail(),
  body("phone").optional({ checkFalsy: true }).trim().isLength({ max: 40 }),
  body("company").trim().notEmpty().withMessage("Please enter your company name.").isLength({ max: 180 }),
  body("role").trim().notEmpty().withMessage("Please select your role."),
  body("ebitdaRange").trim().notEmpty().withMessage("Please select an EBITDA range."),
  body("interest").trim().notEmpty().withMessage("Please select your nature of interest."),
  body("message").optional({ checkFalsy: true }).trim().isLength({ max: 5000 }),
  body("consent")
    .isBoolean()
    .withMessage("Please confirm that we may contact you.")
    .custom((value) => value === true)
    .withMessage("Please confirm that we may contact you."),
];
