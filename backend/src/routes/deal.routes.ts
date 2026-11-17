import { Router } from "express";
import {
  createDeal,
  deleteDeal,
  getDeal,
  getDealOptions,
  getPipeline,
  listAvailableDeals,
  listDeals,
  listMyDeals,
  listSavedDeals,
  saveDeal,
  unsaveDeal,
  updateDeal,
} from "../controllers/deal.controller";
import { authorize, protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createDealValidation,
  dealByIdValidation,
  updateDealValidation,
} from "../validators/deal.validator";

const router = Router();

const manage = authorize("admin", "advisor");
const buyerOnly = authorize("buyer");
const sellerOnly = authorize("seller");

router.use(protect);

// Static paths must be registered before the /:id detail route.
router.get("/", manage, listDeals);
router.get("/pipeline", manage, getPipeline);
router.get("/options", manage, getDealOptions);
router.get("/available", buyerOnly, listAvailableDeals);
router.get("/saved", buyerOnly, listSavedDeals);
router.get("/mine", sellerOnly, listMyDeals);

router.post("/:id/save", buyerOnly, dealByIdValidation, validate, saveDeal);
router.delete("/:id/save", buyerOnly, dealByIdValidation, validate, unsaveDeal);

router.get("/:id", dealByIdValidation, validate, getDeal);
router.post("/", manage, createDealValidation, validate, createDeal);
router.patch("/:id", manage, updateDealValidation, validate, updateDeal);
router.delete("/:id", manage, dealByIdValidation, validate, deleteDeal);

export default router;
