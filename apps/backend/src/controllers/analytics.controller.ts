import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response";
import * as analyticsService from "../services/analytics.service";
import { ResearchDomain, ReadingStage, ImpactScore } from "@prisma/client";
import { DateRangeFilterType } from "shared";

/**
 * Analytics Controller
 * 
 * Orchestrates HTTP requests and responses for analytics.
 * Contains NO analytics logic - delegates to analytics.service.ts
 */

/**
 * Get analytics with filters
 * GET /analytics
 */
export async function getAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userKeyId = req.userKey.id;

    // Parse filters from query parameters (same structure as paper filters)
    const filters: analyticsService.AnalyticsFilters = {};

    if (req.query.readingStages) {
      const stages = Array.isArray(req.query.readingStages) 
        ? req.query.readingStages 
        : [req.query.readingStages];
      filters.readingStages = stages.filter(s => typeof s === "string") as ReadingStage[];
    }

    if (req.query.domains) {
      const domains = Array.isArray(req.query.domains)
        ? req.query.domains
        : [req.query.domains];
      filters.researchDomains = domains.filter(d => typeof d === "string") as ResearchDomain[];
    }

    if (req.query.impactScores) {
      const scores = Array.isArray(req.query.impactScores)
        ? req.query.impactScores
        : [req.query.impactScores];
      filters.impactScores = scores.filter(s => typeof s === "string") as ImpactScore[];
    }

    if (req.query.dateRange && typeof req.query.dateRange === "string") {
      filters.dateRange = req.query.dateRange as DateRangeFilterType;
    }

    // Call analytics service
    const result = await analyticsService.getAnalytics(userKeyId, filters);

    sendResponse(
      res,
      200,
      "ANALYTICS_FETCHED",
      result,
      "Analytics fetched successfully"
    );
  } catch (error) {
    next(error);
  }
}
