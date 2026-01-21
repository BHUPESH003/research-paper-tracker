import { prisma } from "../db/prisma";
import { ResearchDomain, ReadingStage, ImpactScore } from "@prisma/client";
import { DateRangeFilterType } from "@shared";

/**
 * Paper Service
 * 
 * Contains all business logic for paper management.
 * This is pure business logic - no HTTP concerns, no response formatting.
 */

// ============================================================================
// Types
// ============================================================================

export interface CreatePaperInput {
  title: string;
  firstAuthor: string;
  researchDomain: ResearchDomain;
  readingStage: ReadingStage;
  citationCount: number;
  impactScore: ImpactScore;
}

export interface UpdatePaperInput {
  researchDomain?: ResearchDomain;
  readingStage?: ReadingStage;
  citationCount?: number;
}

export interface PaperFilters {
  readingStages?: ReadingStage[];
  researchDomains?: ResearchDomain[];
  impactScores?: ImpactScore[];
  dateRange?: DateRangeFilterType;
}

export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate the start date for a given date range filter
 */
function getDateRangeStart(dateRange: DateRangeFilterType): Date | null {
  const now = new Date();
  
  switch (dateRange) {
    case "THIS_WEEK": {
      const startOfWeek = new Date(now);
      const dayOfWeek = startOfWeek.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start
      startOfWeek.setDate(startOfWeek.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);
      return startOfWeek;
    }
    
    case "THIS_MONTH": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      return startOfMonth;
    }
    
    case "LAST_3_MONTHS": {
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      threeMonthsAgo.setHours(0, 0, 0, 0);
      return threeMonthsAgo;
    }
    
    case "ALL_TIME":
      return null;
    
    default:
      return null;
  }
}

// ============================================================================
// Service Methods
// ============================================================================

/**
 * Create a new paper
 * Enforces uniqueness on (title, firstAuthor, userKeyId)
 */
export async function createPaper(
  userKeyId: string,
  data: CreatePaperInput
) {
  // Check for duplicate (title + firstAuthor + userKeyId)
  const existingPaper = await prisma.paper.findFirst({
    where: {
      title: data.title,
      firstAuthor: data.firstAuthor,
      userKeyId: userKeyId
    }
  });

  if (existingPaper) {
    throw new Error("DUPLICATE_PAPER");
  }

  // Create paper with current date and archived = false
  const paper = await prisma.paper.create({
    data: {
      title: data.title,
      firstAuthor: data.firstAuthor,
      researchDomain: data.researchDomain,
      readingStage: data.readingStage,
      citationCount: data.citationCount,
      impactScore: data.impactScore,
      dateAdded: new Date(),
      isArchived: false,
      userKeyId: userKeyId
    },
    select: {
      id: true
    }
  });

  return paper;
}

/**
 * Update a paper
 * Only allows updates to: researchDomain, readingStage, citationCount
 */
export async function updatePaper(
  paperId: string,
  userKeyId: string,
  data: UpdatePaperInput
) {
  // Ensure paper exists and belongs to user
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
    select: { userKeyId: true }
  });

  if (!paper) {
    throw new Error("NOT_FOUND");
  }

  if (paper.userKeyId !== userKeyId) {
    throw new Error("NOT_FOUND");
  }

  // Update only allowed fields
  await prisma.paper.update({
    where: { id: paperId },
    data: {
      researchDomain: data.researchDomain,
      readingStage: data.readingStage,
      citationCount: data.citationCount
    }
  });
}

/**
 * Archive a paper
 * Sets isArchived = true
 */
export async function archivePaper(
  paperId: string,
  userKeyId: string
) {
  // Ensure paper exists and belongs to user
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
    select: { userKeyId: true }
  });

  if (!paper) {
    throw new Error("NOT_FOUND");
  }

  if (paper.userKeyId !== userKeyId) {
    throw new Error("NOT_FOUND");
  }

  // Archive the paper
  await prisma.paper.update({
    where: { id: paperId },
    data: { isArchived: true }
  });
}

/**
 * Get papers with filters
 * Excludes archived papers by default
 * Applies AND-based filtering
 */
export async function getPapers(
  userKeyId: string,
  filters: PaperFilters = {},
  pagination: PaginationInput = {}
) {
  const { page = 1, pageSize = 10 } = pagination;
  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {
    userKeyId: userKeyId,
    isArchived: false // Always exclude archived papers
  };

  // Apply reading stage filter (AND-based: must be in the provided list)
  if (filters.readingStages && filters.readingStages.length > 0) {
    where.readingStage = {
      in: filters.readingStages
    };
  }

  // Apply research domain filter (AND-based: must be in the provided list)
  if (filters.researchDomains && filters.researchDomains.length > 0) {
    where.researchDomain = {
      in: filters.researchDomains
    };
  }

  // Apply impact score filter (AND-based: must be in the provided list)
  if (filters.impactScores && filters.impactScores.length > 0) {
    where.impactScore = {
      in: filters.impactScores
    };
  }

  // Apply date range filter
  if (filters.dateRange) {
    const startDate = getDateRangeStart(filters.dateRange);
    if (startDate) {
      where.dateAdded = {
        gte: startDate
      };
    }
  }

  // Get total count for pagination
  const total = await prisma.paper.count({ where });

  // Get papers with pagination
  const papers = await prisma.paper.findMany({
    where,
    skip,
    take: pageSize,
    orderBy: {
      dateAdded: "desc"
    },
    select: {
      id: true,
      title: true,
      firstAuthor: true,
      researchDomain: true,
      readingStage: true,
      citationCount: true,
      impactScore: true,
      dateAdded: true
    }
  });

  return {
    items: papers,
    pagination: {
      page,
      pageSize,
      total
    }
  };
}
