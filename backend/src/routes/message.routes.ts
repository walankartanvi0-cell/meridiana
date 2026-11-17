import { Router } from "express";
import {
  createMessage,
  deleteMessage,
  getMessageContacts,
  listMessages,
  markMessageRead,
} from "../controllers/message.controller";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createMessageValidation,
  messageByIdValidation,
} from "../validators/message.validator";

const router = Router();

router.use(protect);

router.get("/", listMessages);
router.get("/contacts", getMessageContacts);
router.post("/", createMessageValidation, validate, createMessage);
router.patch("/:id/read", messageByIdValidation, validate, markMessageRead);
router.delete("/:id", messageByIdValidation, validate, deleteMessage);

export default router;
