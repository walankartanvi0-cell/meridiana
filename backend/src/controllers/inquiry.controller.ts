import type { Request, Response } from "express";
import { Inquiry } from "../models/Inquiry";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/sendResponse";

/** POST /api/contact – public contact form. */
export const createContact = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, company, subject, message } = req.body;

  const inquiry = await Inquiry.create({
    type: "contact",
    name,
    email,
    company,
    subject,
    message,
    consent: true,
  });

  sendResponse(res, 201, "Thank you. Your message has been received.", {
    id: inquiry._id,
  });
});

/** POST /api/consultations – public consultation request form. */
export const createConsultation = asyncHandler(async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    company,
    role,
    ebitdaRange,
    interest,
    message,
    consent,
  } = req.body;

  const inquiry = await Inquiry.create({
    type: "consultation",
    firstName,
    lastName,
    email,
    phone,
    company,
    role,
    ebitdaRange,
    interest,
    message: message ?? "",
    consent,
  });

  sendResponse(res, 201, "Thank you. Your consultation request has been received.", {
    id: inquiry._id,
  });
});
