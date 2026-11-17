import { body } from "express-validator";
import { idParam } from "./common";

export const createMessageValidation = [
  body("deal")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("Select a valid deal."),
  body("recipients")
    .isArray({ min: 1, max: 20 })
    .withMessage("Choose at least one recipient."),
  body("recipients.*").isMongoId().withMessage("Invalid recipient."),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Message subject is required.")
    .isLength({ max: 160 })
    .withMessage("Subject must be 160 characters or fewer."),
  body("body")
    .trim()
    .notEmpty()
    .withMessage("Write a message before sending.")
    .isLength({ max: 5000 })
    .withMessage("Message must be 5000 characters or fewer."),
];

export const messageByIdValidation = [idParam];
