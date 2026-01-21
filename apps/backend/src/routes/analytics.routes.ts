import { Router } from "express";
import { apiKeyAuth } from "../middleware/apiKeyAuth";
import { rateLimiter } from "../middleware/rateLimiter";
import * as analyticsController from "../controllers/analytics.controller";

/**
 * Analytics Routes
 * 
 * Defines HTTP routes for analytics.
 * All routes require authentication and rate limiting.
 */

const router: Router = Router();

// Middleware order: apiKeyAuth → rateLimiter → controller
// This order is MANDATORY and must not be changed

/**
 * GET /analytics
 * Get analytics with optional filters
 */
router.get(
  "/analytics",
  apiKeyAuth,
  rateLimiter,
  analyticsController.getAnalytics
);

export default router;
