import { Router } from "express";
import { authorize, protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  adminCreateUser,
  getMe,
  login,
  logout,
  register,
} from "../controllers/auth.controller";
import {
  adminCreateUserValidation,
  loginValidation,
  registerValidation,
} from "../validators/auth.validator";

const router = Router();

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.post(
  "/users",
  protect,
  authorize("admin"),
  adminCreateUserValidation,
  validate,
  adminCreateUser,
);

export default router;
