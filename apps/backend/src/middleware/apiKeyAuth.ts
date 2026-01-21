import { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma";
import { hashApiKey } from "../utils/hash";
import { sendResponse } from "../utils/response";

/**
 * API Key Authentication Middleware
 * 
 * Validates the X-API-KEY header and maps it to a UserAccessKey record.
 * Attaches the resolved user context to the request object.
 * Rejects invalid or missing keys with standardized error responses.
 */
export async function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // 1. Read X-API-KEY from headers
  const apiKey = req.headers["x-api-key"] as string | undefined;

  // 2. Check if API key is missing
  if (!apiKey) {
    sendResponse(
      res,
      401,
      "INVALID_API_KEY",
      null,
      "API key is required"
    );
    return;
  }

  // 3. Hash the incoming API key
  const hashedKey = hashApiKey(apiKey);

  try {
    // 4. Look up UserAccessKey by hashedKey
    const userKey = await prisma.userAccessKey.findUnique({
      where: {
        hashedKey: hashedKey
      },
      select: {
        id: true
      }
    });

    // 5. Check if user key was found
    if (!userKey) {
      sendResponse(
        res,
        401,
        "INVALID_API_KEY",
        null,
        "API key is invalid"
      );
      return;
    }

    // 6. Attach the resolved user key to request and proceed
    req.userKey = {
      id: userKey.id
    };

    next();
  } catch (error) {
    // Database error - pass to error handler
    next(error);
  }
}
