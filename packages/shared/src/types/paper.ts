import { ResearchDomain } from "../enums/researchDomain";
import { ReadingStage } from "../enums/readingStage";
import { ImpactScore } from "../enums/impactScore";

export interface Paper {
  id: string;
  title: string;
  firstAuthor: string;
  researchDomain: ResearchDomain;
  readingStage: ReadingStage;
  citationCount: number;
  impactScore: ImpactScore;
  dateAdded: string;
  isArchived: boolean;
}
