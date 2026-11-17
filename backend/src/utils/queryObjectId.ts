import { Types } from "mongoose";
import { ApiError } from "./ApiError";

/**
 * Reads an optional MongoDB id from a query string.
 * Missing or blank values are ignored; malformed values produce a clean 400
 * instead of letting Mongoose throw a CastError and return a 500.
 */
export function queryObjectId(value: unknown, field = "identifier"): string | undefined {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (!Types.ObjectId.isValid(trimmed)) {
    throw new ApiError(400, `Invalid ${field}.`);
  }

  return trimmed;
}
