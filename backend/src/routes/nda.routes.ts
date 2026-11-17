import { Router } from "express";
import {
  createNda,
  deleteNda,
  getNda,
  listNdas,
  updateNda,
} from "../controllers/nda.controller";
import { authorize, protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createNdaValidation,
  ndaByIdValidation,
  updateNdaValidation,
} from "../validators/nda.validator";

const router = Router();

router.use(protect);

router.get("/", listNdas);
router.post("/", authorize("buyer"), createNdaValidation, validate, createNda);
router.get("/:id", ndaByIdValidation, validate, getNda);
router.patch(
  "/:id",
  authorize("admin", "advisor", "seller"),
  updateNdaValidation,
  validate,
  updateNda,
);
router.delete("/:id", ndaByIdValidation, validate, deleteNda);

export default router;
