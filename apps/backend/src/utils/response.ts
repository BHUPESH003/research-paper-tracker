import { Response } from "express";
import { ApiResponse } from "shared";

/**
 * Standardized API response helper
 * Ensures all responses follow the { code, data, message } format
 */
export function sendResponse<T>(
  res: Response,
  statusCode: number,
  code: string,
  data: T,
  message: string
): void {
  const response: ApiResponse<T> = {
    code,
    data,
    message
  };
  res.status(statusCode).json(response);
}
