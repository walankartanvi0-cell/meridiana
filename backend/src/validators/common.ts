import { param } from "express-validator";
import { Types } from "mongoose";

export const idParam = param("id").custom((value) => {
  if (!Types.ObjectId.isValid(value)) {
    throw new Error("Invalid identifier.");
  }
  return true;
});
