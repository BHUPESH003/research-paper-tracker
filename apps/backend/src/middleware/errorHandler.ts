import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response";

/**
 * Centralized error handling middleware
 * Catches all unhandled errors and returns standardized error response
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", err);

  sendResponse(
    res,
    500,
    "INTERNAL_ERROR",
    null,
    "Unexpected server error"
  );
}
