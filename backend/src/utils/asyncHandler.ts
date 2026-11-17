import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Passes rejected promises from async route handlers to Express error middleware,
 * so we do not need try/catch in every controller.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
