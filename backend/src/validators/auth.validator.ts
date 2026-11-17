import { body } from "express-validator";
import { PUBLIC_REGISTRATION_ROLES, USER_ROLES } from "../constants/roles";

const nameRule = body("name")
  .trim()
  .notEmpty()
  .withMessage("Full name is required.")
  .isLength({ max: 100 })
  .withMessage("Full name must be 100 characters or fewer.");

const emailRule = body("email")
  .trim()
  .notEmpty()
  .withMessage("Email address is required.")
  .isEmail()
  .withMessage("Enter a valid email address.")
  .normalizeEmail();

const passwordRule = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters.")
  .matches(/[A-Za-z]/)
  .withMessage("Password must include at least one letter.")
  .matches(/\d/)
  .withMessage("Password must include at least one number.");

const optionalCompanyRule = body("company")
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 120 })
  .withMessage("Company name must be 120 characters or fewer.");

const optionalPhoneRule = body("phone")
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 30 })
  .withMessage("Phone number must be 30 characters or fewer.");

/** Public signup: buyers and sellers only. */
export const registerValidation = [
  nameRule,
  emailRule,
  passwordRule,
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match.");
    }
    return true;
  }),
  body("role")
    .isIn([...PUBLIC_REGISTRATION_ROLES])
    .withMessage("Choose either Buyer or Seller."),
  optionalCompanyRule,
  optionalPhoneRule,
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required.")
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

/** Admin-only user creation: any role may be assigned. */
export const adminCreateUserValidation = [
  nameRule,
  emailRule,
  passwordRule,
  body("role")
    .isIn([...USER_ROLES])
    .withMessage("Choose a valid role."),
  body("status")
    .optional()
    .isIn(["active", "suspended"])
    .withMessage("Status must be active or suspended."),
  optionalCompanyRule,
  optionalPhoneRule,
];
