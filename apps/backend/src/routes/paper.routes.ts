import { Router } from "express";
import { apiKeyAuth } from "../middleware/apiKeyAuth";
import { rateLimiter } from "../middleware/rateLimiter";
import * as paperController from "../controllers/paper.controller";

/**
 * Paper Routes
 * 
 * Defines HTTP routes for paper management.
 * All routes require authentication and rate limiting.
 */

const router: Router = Router();

// Middleware order: apiKeyAuth → rateLimiter → controller
// This order is MANDATORY and must not be changed

/**
 * POST /papers
 * Create a new paper
 */
router.post(
  "/papers",
  apiKeyAuth,
  rateLimiter,
  paperController.createPaper
);

/**
 * PATCH /papers/:id
 * Update an existing paper
 */
router.patch(
  "/papers/:id",
  apiKeyAuth,
  rateLimiter,
  paperController.updatePaper
);

/**
 * PATCH /papers/:id/archive
 * Archive a paper
 */
router.patch(
  "/papers/:id/archive",
  apiKeyAuth,
  rateLimiter,
  paperController.archivePaper
);

/**
 * GET /papers
 * Get papers with filters and pagination
 */
router.get(
  "/papers",
  apiKeyAuth,
  rateLimiter,
  paperController.getPapers
);

export default router;
