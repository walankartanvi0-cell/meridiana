import { Router } from "express";
import { createContact, createConsultation } from "../controllers/inquiry.controller";
import { validate } from "../middleware/validate";
import { consultationRules, contactRules } from "../validators/inquiry.validator";

export const contactRouter = Router();
contactRouter.post("/", contactRules, validate, createContact);

export const consultationRouter = Router();
consultationRouter.post("/", consultationRules, validate, createConsultation);
