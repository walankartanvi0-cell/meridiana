import fs from "fs";
import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError";

/** Collects results from express-validator rules and returns a readable error. */
export function validate(req: Request, _res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  // A multipart upload is parsed before validation, so remove the saved file
  // when the accompanying fields are rejected.
  if (req.file?.path) {
    void fs.promises.unlink(req.file.path).catch(() => undefined);
  }

  const errors = result.array().map((item) => ({
    field: "path" in item ? item.path : "unknown",
    message: item.msg,
  }));
  next(new ApiError(400, errors[0]?.message ?? "Invalid input", errors));
}
