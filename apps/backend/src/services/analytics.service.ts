import { prisma } from "../db/prisma";
import { ResearchDomain, ReadingStage, ImpactScore } from "@prisma/client";
import { DateRangeFilterType } from "@shared";

/**
 * Analytics Service
 * 
 * Contains all analytics computation logic.
 * This is pure business logic - no HTTP concerns, no response formatting.
 * All analytics are computed server-side from persisted data.
 */

// ============================================================================
// Types
// ============================================================================

export interface AnalyticsFilters {
  readingStages?: ReadingStage[];
  researchDomains?: ResearchDomain[];
  impactScores?: ImpactScore[];
  dateRange?: DateRangeFilterType;
}

export interface FunnelData {
  stage: ReadingStage;
  count: number;
}

export interface ScatterData {
  citationCount: number;
  impactScore: ImpactScore;
}

export interface StackedBarData {
  domain: ResearchDomain;
  stages: Record<string, number>;
}

export interface SummaryMetrics {
  totalPapers: number;
  fullyRead: number;
  completionRate: number;
  avgCitationsByDomain: Record<string, number>;
}

export interface AnalyticsResponse {
  funnel: FunnelData[];
  scatter: ScatterData[];
  stackedBar: StackedBarData[];
  summary: SummaryMetrics;
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

/**
 * Build WHERE clause for analytics query
 */
function buildWhereClause(userKeyId: string, filters: AnalyticsFilters): any {
  const where: any = {
    userKeyId: userKeyId,
    isArchived: false // Always exclude archived papers
  };

  // Apply reading stage filter
  if (filters.readingStages && filters.readingStages.length > 0) {
    where.readingStage = {
      in: filters.readingStages
    };
  }

  // Apply research domain filter
  if (filters.researchDomains && filters.researchDomains.length > 0) {
    where.researchDomain = {
      in: filters.researchDomains
    };
  }

  // Apply impact score filter
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

  return where;
}

// ============================================================================
// Analytics Computation Functions
// ============================================================================

/**
 * Compute funnel data
 * Groups papers by reading stage and counts per stage
 * Returns all stages, even if count is zero
 */
function computeFunnelData(papers: any[]): FunnelData[] {
  // All possible reading stages
  const allStages: ReadingStage[] = [
    ReadingStage.ABSTRACT_READ,
    ReadingStage.INTRODUCTION_DONE,
    ReadingStage.METHODOLOGY_DONE,
    ReadingStage.RESULTS_ANALYZED,
    ReadingStage.FULLY_READ,
    ReadingStage.NOTES_COMPLETED
  ];

  // Count papers per stage
  const stageCounts = new Map<ReadingStage, number>();
  
  // Initialize all stages with 0
  allStages.forEach(stage => {
    stageCounts.set(stage, 0);
  });

  // Count papers
  papers.forEach(paper => {
    const currentCount = stageCounts.get(paper.readingStage) || 0;
    stageCounts.set(paper.readingStage, currentCount + 1);
  });

  // Convert to array
  return allStages.map(stage => ({
    stage,
    count: stageCounts.get(stage) || 0
  }));
}

/**
 * Compute scatter data
 * Each paper contributes its citation count and impact score
 */
function computeScatterData(papers: any[]): ScatterData[] {
  return papers.map(paper => ({
    citationCount: paper.citationCount,
    impactScore: paper.impactScore
  }));
}

/**
 * Compute stacked bar data
 * Groups papers by domain, then by stage within each domain
 */
function computeStackedBarData(papers: any[]): StackedBarData[] {
  // All possible domains
  const allDomains: ResearchDomain[] = [
    ResearchDomain.COMPUTER_SCIENCE,
    ResearchDomain.BIOLOGY,
    ResearchDomain.PHYSICS,
    ResearchDomain.CHEMISTRY,
    ResearchDomain.MATHEMATICS,
    ResearchDomain.SOCIAL_SCIENCES
  ];

  // Group by domain and stage
  const domainStages = new Map<ResearchDomain, Map<ReadingStage, number>>();

  // Initialize all domains
  allDomains.forEach(domain => {
    domainStages.set(domain, new Map());
  });

  // Count papers per (domain, stage)
  papers.forEach(paper => {
    const domainMap = domainStages.get(paper.researchDomain);
    if (domainMap) {
      const currentCount = domainMap.get(paper.readingStage) || 0;
      domainMap.set(paper.readingStage, currentCount + 1);
    }
  });

  // Convert to array format
  return allDomains.map(domain => {
    const stageMap = domainStages.get(domain) || new Map();
    const stages: Record<string, number> = {};
    
    stageMap.forEach((count, stage) => {
      stages[stage] = count;
    });

    return {
      domain,
      stages
    };
  });
}

/**
 * Compute summary metrics
 */
function computeSummaryMetrics(papers: any[]): SummaryMetrics {
  const totalPapers = papers.length;
  
  // Count fully read papers
  const fullyRead = papers.filter(
    paper => paper.readingStage === ReadingStage.FULLY_READ
  ).length;

  // Calculate completion rate
  const completionRate = totalPapers > 0 ? fullyRead / totalPapers : 0;

  // Calculate average citations by domain
  const avgCitationsByDomain: Record<string, number> = {};

  // All possible domains
  const allDomains: ResearchDomain[] = [
    ResearchDomain.COMPUTER_SCIENCE,
    ResearchDomain.BIOLOGY,
    ResearchDomain.PHYSICS,
    ResearchDomain.CHEMISTRY,
    ResearchDomain.MATHEMATICS,
    ResearchDomain.SOCIAL_SCIENCES
  ];

  allDomains.forEach(domain => {
    const domainPapers = papers.filter(paper => paper.researchDomain === domain);
    
    if (domainPapers.length > 0) {
      const totalCitations = domainPapers.reduce(
        (sum, paper) => sum + paper.citationCount,
        0
      );
      avgCitationsByDomain[domain] = totalCitations / domainPapers.length;
    } else {
      avgCitationsByDomain[domain] = 0;
    }
  });

  return {
    totalPapers,
    fullyRead,
    completionRate,
    avgCitationsByDomain
  };
}

// ============================================================================
// Service Method
// ============================================================================

/**
 * Get analytics data with filters
 * Computes all analytics server-side from persisted data
 */
export async function getAnalytics(
  userKeyId: string,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsResponse> {
  // Build WHERE clause with filters
  const where = buildWhereClause(userKeyId, filters);

  // Fetch all papers matching the filters
  const papers = await prisma.paper.findMany({
    where,
    select: {
      readingStage: true,
      researchDomain: true,
      citationCount: true,
      impactScore: true
    }
  });

  // Compute all analytics from the fetched papers
  const funnel = computeFunnelData(papers);
  const scatter = computeScatterData(papers);
  const stackedBar = computeStackedBarData(papers);
  const summary = computeSummaryMetrics(papers);

  return {
    funnel,
    scatter,
    stackedBar,
    summary
  };
}
