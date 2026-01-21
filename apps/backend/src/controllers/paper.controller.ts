import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response";
import * as paperService from "../services/paper.service";
import { ResearchDomain, ReadingStage, ImpactScore } from "@prisma/client";
import { DateRangeFilterType } from "@shared";

/**
 * Paper Controller
 * 
 * Orchestrates HTTP requests and responses for paper management.
 * Contains NO business logic - delegates to paper.service.ts
 */

/**
 * Create a new paper
 * POST /papers
 */
export async function createPaper(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userKeyId = req.userKey.id;
    const { title, firstAuthor, researchDomain, readingStage, citationCount, impactScore } = req.body;

    const paper = await paperService.createPaper(userKeyId, {
      title,
      firstAuthor,
      researchDomain,
      readingStage,
      citationCount,
      impactScore
    });

    sendResponse(
      res,
      201,
      "PAPER_CREATED",
      { id: paper.id },
      "Paper created successfully"
    );
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_PAPER") {
      sendResponse(
        res,
        409,
        "DUPLICATE_PAPER",
        null,
        "A paper with the same title and author already exists"
      );
      return;
    }
    next(error);
  }
}

/**
 * Update an existing paper
 * PATCH /papers/:id
 */
export async function updatePaper(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userKeyId = req.userKey.id;
    const paperId = req.params.id as string;
    const { researchDomain, readingStage, citationCount } = req.body;

    await paperService.updatePaper(paperId, userKeyId, {
      researchDomain,
      readingStage,
      citationCount
    });

    sendResponse(
      res,
      200,
      "PAPER_UPDATED",
      null,
      "Paper updated successfully"
    );
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      sendResponse(
        res,
        404,
        "NOT_FOUND",
        null,
        "Resource not found"
      );
      return;
    }
    next(error);
  }
}

/**
 * Archive a paper
 * PATCH /papers/:id/archive
 */
export async function archivePaper(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userKeyId = req.userKey.id;
    const paperId = req.params.id as string;

    await paperService.archivePaper(paperId, userKeyId);

    sendResponse(
      res,
      200,
      "PAPER_ARCHIVED",
      null,
      "Paper archived successfully"
    );
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      sendResponse(
        res,
        404,
        "NOT_FOUND",
        null,
        "Resource not found"
      );
      return;
    }
    next(error);
  }
}

/**
 * Get papers with filters and pagination
 * GET /papers
 */
export async function getPapers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userKeyId = req.userKey.id;

    // Parse filters from query parameters
    const filters: paperService.PaperFilters = {};

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

    // Parse pagination
    const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
    const pageSizeParam = Array.isArray(req.query.pageSize) ? req.query.pageSize[0] : req.query.pageSize;

    const pagination: paperService.PaginationInput = {
      page: pageParam && typeof pageParam === "string" ? parseInt(pageParam, 10) : 1,
      pageSize: pageSizeParam && typeof pageSizeParam === "string" ? parseInt(pageSizeParam, 10) : 10
    };

    const result = await paperService.getPapers(userKeyId, filters, pagination);

    sendResponse(
      res,
      200,
      "PAPERS_FETCHED",
      result,
      "Papers fetched successfully"
    );
  } catch (error) {
    next(error);
  }
}
