import { Router } from "express";
import {
  createMeeting,
  deleteMeeting,
  getMeeting,
  getMeetingOptions,
  listMeetings,
  updateMeeting,
} from "../controllers/meeting.controller";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createMeetingValidation,
  meetingByIdValidation,
  updateMeetingValidation,
} from "../validators/meeting.validator";

const router = Router();

router.use(protect);

router.get("/", listMeetings);
router.get("/options", getMeetingOptions);
router.post("/", createMeetingValidation, validate, createMeeting);
router.get("/:id", meetingByIdValidation, validate, getMeeting);
router.patch("/:id", updateMeetingValidation, validate, updateMeeting);
router.delete("/:id", meetingByIdValidation, validate, deleteMeeting);

export default router;
