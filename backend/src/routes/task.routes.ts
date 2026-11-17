import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTaskOptions,
  getTaskSummary,
  listTasks,
  updateTask,
} from "../controllers/task.controller";
import { authorize, protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createTaskValidation,
  taskByIdValidation,
  updateTaskValidation,
} from "../validators/task.validator";

const router = Router();

router.use(protect);

router.get("/", listTasks);
router.get("/summary", getTaskSummary);
router.get("/options", authorize("admin", "advisor"), getTaskOptions);
router.post("/", authorize("admin", "advisor"), createTaskValidation, validate, createTask);
router.patch("/:id", updateTaskValidation, validate, updateTask);
router.delete("/:id", taskByIdValidation, validate, deleteTask);

export default router;
