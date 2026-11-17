import { body } from "express-validator";
import { TASK_PRIORITIES, TASK_STATUSES } from "../constants/collaboration";
import { idParam } from "./common";

/** Factories keep create and update rules independent. */
const title = () =>
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required.")
    .isLength({ max: 160 })
    .withMessage("Task title must be 160 characters or fewer.");

const description = () =>
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description must be 2000 characters or fewer.");

const deal = () =>
  body("deal")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("Select a valid deal.");

const assignedTo = (required: boolean) => {
  const chain = body("assignedTo");
  return required
    ? chain
        .notEmpty()
        .withMessage("Choose who should complete this task.")
        .isMongoId()
        .withMessage("Select a valid assignee.")
    : chain.optional().isMongoId().withMessage("Select a valid assignee.");
};

const dueDate = () =>
  body("dueDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Enter a valid due date.")
    .toDate();

const status = () =>
  body("status")
    .optional()
    .isIn([...TASK_STATUSES])
    .withMessage("Choose a valid task status.");

const priority = () =>
  body("priority")
    .optional()
    .isIn([...TASK_PRIORITIES])
    .withMessage("Choose a valid task priority.");

export const createTaskValidation = [
  title(),
  description(),
  deal(),
  assignedTo(true),
  dueDate(),
  status(),
  priority(),
];

export const updateTaskValidation = [
  idParam,
  title().optional(),
  description(),
  deal(),
  assignedTo(false),
  dueDate(),
  status(),
  priority(),
];

export const taskByIdValidation = [idParam];
