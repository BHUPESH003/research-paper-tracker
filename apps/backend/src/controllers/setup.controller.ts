import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response";
import * as setupService from "../services/setup.service";

/**
 * Setup Controller
 *
 * Handles initial user setup and API key registration
 */

/**
 * Register a new user with their email
 * POST /setup
 */
export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || typeof email !== "string" || email.trim().length === 0) {
      sendResponse(res, 400, "VALIDATION_ERROR", null, "Email is required");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      sendResponse(res, 400, "VALIDATION_ERROR", null, "Invalid email format");
      return;
    }

    const result = await setupService.registerUser(email.trim().toLowerCase());

    sendResponse(
      res,
      201,
      "USER_REGISTERED",
      { 
        id: result.id,
        apiKey: result.apiKey 
      },
      "User registered successfully"
    );
  } catch (error: any) {
    if (error.message === "EMAIL_EXISTS") {
      sendResponse(
        res,
        409,
        "EMAIL_EXISTS",
        null,
        "This email is already registered"
      );
      return;
    }
    next(error);
  }
}
