import { Router } from "express";
import { authorize, protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  changePassword,
  getBuyerProfile,
  getSellerProfile,
  updateAccount,
  upsertBuyerProfile,
  upsertSellerProfile,
} from "../controllers/profile.controller";
import {
  changePasswordValidation,
  updateAccountValidation,
  updateBuyerProfileValidation,
  updateSellerProfileValidation,
} from "../validators/profile.validator";

const router = Router();

router.use(protect);

router.get("/buyer", authorize("buyer"), getBuyerProfile);
router.put("/buyer", authorize("buyer"), updateBuyerProfileValidation, validate, upsertBuyerProfile);

router.get("/seller", authorize("seller"), getSellerProfile);
router.put("/seller", authorize("seller"), updateSellerProfileValidation, validate, upsertSellerProfile);

router.patch("/profile", updateAccountValidation, validate, updateAccount);
router.post("/password", changePasswordValidation, validate, changePassword);

export default router;
