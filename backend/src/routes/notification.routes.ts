import { Router } from "express";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller";
import { idParam } from "../validators/common";

const router = Router();

router.use(protect);

router.get("/", listNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:id/read", idParam, validate, markNotificationRead);

export default router;
