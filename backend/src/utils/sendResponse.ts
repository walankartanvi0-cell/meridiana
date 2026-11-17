import type { Response } from "express";

/** Sends a consistent JSON shape for every successful API response. */
export function sendResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  });
}
