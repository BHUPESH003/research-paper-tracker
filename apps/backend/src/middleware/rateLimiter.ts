import { Request, Response, NextFunction } from "express";
import { READ_LIMIT, WRITE_LIMIT } from "shared";
import { sendResponse } from "../utils/response";

/**
 * Rate Limiter Middleware
 * 
 * Implements per-API-key rate limiting with separate limits for read and write operations.
 * Uses in-memory storage with automatic window reset.
 */

// Request type classification
type RequestType = "read" | "write";

// Rate limit tracking structure
interface RateLimitInfo {
  count: number;
  resetTime: number;
}

interface UserRateLimits {
  read: RateLimitInfo;
  write: RateLimitInfo;
}

// In-memory storage for rate limit tracking
const rateLimitStore = new Map<string, UserRateLimits>();

// Window duration in milliseconds (1 minute)
const WINDOW_DURATION_MS = 60 * 1000;

/**
 * Determine if a request is read or write based on HTTP method
 */
function getRequestType(method: string): RequestType {
  return method === "GET" ? "read" : "write";
}

/**
 * Get or initialize rate limit info for a user and request type
 */
function getRateLimitInfo(userKeyId: string, requestType: RequestType): RateLimitInfo {
  let userLimits = rateLimitStore.get(userKeyId);

  if (!userLimits) {
    userLimits = {
      read: { count: 0, resetTime: Date.now() + WINDOW_DURATION_MS },
      write: { count: 0, resetTime: Date.now() + WINDOW_DURATION_MS }
    };
    rateLimitStore.set(userKeyId, userLimits);
  }

  return userLimits[requestType];
}

/**
 * Reset rate limit info if window has expired
 */
function resetIfExpired(info: RateLimitInfo): void {
  const now = Date.now();
  if (now >= info.resetTime) {
    info.count = 0;
    info.resetTime = now + WINDOW_DURATION_MS;
  }
}

/**
 * Get the applicable limit for a request type
 */
function getLimit(requestType: RequestType): number {
  return requestType === "read" ? READ_LIMIT : WRITE_LIMIT;
}

/**
 * Rate limiting middleware
 * Must be used AFTER apiKeyAuth middleware (requires req.userKey)
 */
export function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 1. Determine request type (read vs write)
  const requestType = getRequestType(req.method);

  // 2. Get user identifier from authenticated context
  const userKeyId = req.userKey.id;

  // 3. Get rate limit info for this user and request type
  const limitInfo = getRateLimitInfo(userKeyId, requestType);

  // 4. Reset counter if window has expired
  resetIfExpired(limitInfo);

  // 5. Get applicable limit
  const limit = getLimit(requestType);

  // 6. Check if limit exceeded
  if (limitInfo.count >= limit) {
    sendResponse(
      res,
      429,
      "RATE_LIMITED",
      null,
      "Too many requests"
    );
    return;
  }

  // 7. Increment counter and proceed
  limitInfo.count++;
  next();
}
