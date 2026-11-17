import { body } from "express-validator";
import { MEETING_STATUSES } from "../constants/collaboration";
import { idParam } from "./common";

/** Factories keep create and update rules independent. */
const title = () =>
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Meeting title is required.")
    .isLength({ max: 160 })
    .withMessage("Meeting title must be 160 characters or fewer.");

const deal = () =>
  body("deal")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("Select a valid deal.");

const startAt = () =>
  body("startAt")
    .notEmpty()
    .withMessage("Choose a meeting date and time.")
    .isISO8601()
    .withMessage("Enter a valid meeting date and time.")
    .toDate();

const durationMinutes = () =>
  body("durationMinutes")
    .optional({ checkFalsy: true })
    .isInt({ min: 15, max: 480 })
    .withMessage("Duration must be between 15 and 480 minutes.");

const location = () =>
  body("location")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Location must be 200 characters or fewer.");

const meetingUrl = () =>
  body("meetingUrl")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Enter a valid http or https meeting link.")
    .isLength({ max: 500 })
    .withMessage("Meeting link must be 500 characters or fewer.");

const agenda = () =>
  body("agenda")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage("Agenda must be 3000 characters or fewer.");

const notes = () =>
  body("notes")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage("Notes must be 3000 characters or fewer.");

const attendees = () =>
  body("attendees")
    .optional()
    .isArray({ max: 25 })
    .withMessage("Select up to 25 attendees.");

const attendeeIds = () =>
  body("attendees.*").optional().isMongoId().withMessage("Invalid attendee.");

const status = () =>
  body("status")
    .optional()
    .isIn([...MEETING_STATUSES])
    .withMessage("Choose a valid meeting status.");

export const createMeetingValidation = [
  title(),
  deal(),
  startAt(),
  durationMinutes(),
  location(),
  meetingUrl(),
  agenda(),
  notes(),
  attendees(),
  attendeeIds(),
  status(),
];

export const updateMeetingValidation = [
  idParam,
  title().optional(),
  deal(),
  startAt().optional(),
  durationMinutes(),
  location(),
  meetingUrl(),
  agenda(),
  notes(),
  attendees(),
  attendeeIds(),
  status(),
];

export const meetingByIdValidation = [idParam];
