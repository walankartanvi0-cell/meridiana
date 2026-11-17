import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

/** Converts different error types into one clean JSON error format. */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  let statusCode = 500;
  let message = "Something went wrong. Please try again.";
  let details: unknown;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof mongoose.Error.CastError) {
    // A malformed id reached the database. Validators catch most of these, but
    // this is a safety net so clients never receive a 500 for bad input.
    statusCode = 400;
    message = "Invalid identifier.";
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(error.errors).map((item) => item.message)[0] ?? message;
  } else if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  ) {
    statusCode = 409;
    message = "A record with these details already exists.";
  } else if (error instanceof Error && error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token.";
  } else if (error instanceof Error && error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please sign in again.";
  } else if (error instanceof Error && error.name === "MulterError") {
    const code = (error as Error & { code?: string }).code;
    statusCode = code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message =
      code === "LIMIT_FILE_SIZE"
        ? "The file is larger than the allowed upload limit."
        : error.message;
  } else if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    (error as { type?: string }).type === "entity.too.large"
  ) {
    statusCode = 413;
    message = "The request is too large.";
  } else if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    (error as { type?: string }).type === "entity.parse.failed"
  ) {
    statusCode = 400;
    message = "The request contains invalid JSON.";
  } else if (error instanceof SyntaxError && "body" in error) {
    statusCode = 400;
    message = "The request contains invalid JSON.";
  } else if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number" &&
    (error as { status: number }).status >= 400 &&
    (error as { status: number }).status < 500
  ) {
    // Body-parser and similar middleware attach a safe HTTP status.
    statusCode = (error as { status: number }).status;
    message = statusCode === 413 ? "The request is too large." : "The request could not be processed.";
  } else if (error instanceof Error && env.nodeEnv === "development") {
    message = error.message;
  }

  if (env.nodeEnv === "development" && error instanceof Error) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined ? { errors: details } : {}),
    ...(env.nodeEnv === "development" && error instanceof Error
      ? { stack: error.stack }
      : {}),
  });
}
