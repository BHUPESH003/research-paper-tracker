import { ReadingStage } from "../enums/readingStage";
import { ResearchDomain } from "../enums/researchDomain";
import { ImpactScore } from "../enums/impactScore";

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
