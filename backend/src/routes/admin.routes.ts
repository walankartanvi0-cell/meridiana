import { Router } from "express";
import { authorize, protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createBuyer,
  createSeller,
  deleteBuyer,
  deleteSeller,
  deleteUser,
  getAnalytics,
  listBuyers,
  listSellers,
  listUsers,
  updateBuyer,
  updateSeller,
  updateUser,
} from "../controllers/admin.controller";
import {
  createBuyerValidation,
  createSellerValidation,
  deleteByIdValidation,
  updateBuyerValidation,
  updateSellerValidation,
  updateUserValidation,
} from "../validators/admin.validator";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/users", listUsers);
router.patch("/users/:id", updateUserValidation, validate, updateUser);
router.delete("/users/:id", deleteByIdValidation, validate, deleteUser);

router.get("/buyers", listBuyers);
router.post("/buyers", createBuyerValidation, validate, createBuyer);
router.patch("/buyers/:id", updateBuyerValidation, validate, updateBuyer);
router.delete("/buyers/:id", deleteByIdValidation, validate, deleteBuyer);

router.get("/sellers", listSellers);
router.post("/sellers", createSellerValidation, validate, createSeller);
router.patch("/sellers/:id", updateSellerValidation, validate, updateSeller);
router.delete("/sellers/:id", deleteByIdValidation, validate, deleteSeller);

router.get("/analytics", getAnalytics);

export default router;
