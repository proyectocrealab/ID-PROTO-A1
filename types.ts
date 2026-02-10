export type ForceCategory = 'keyTrends' | 'marketForces' | 'industryForces' | 'macroEconomicForces';

export interface AnalysisSection {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  description: string;
}

export interface ForceData {
  id: ForceCategory;
  title: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  subSections: AnalysisSection[];
}

export interface AnalysisState {
  author: string;
  description: string;
  keyTrends: Record<string, string>;
  marketForces: Record<string, string>;
  industryForces: Record<string, string>;
  macroEconomicForces: Record<string, string>;
}

export interface AIInsight {
  opportunities: string[];
  threats: string[];
  strategicAdvice: string;
  dataQualityScore: number;
  dataQualityFeedback: string;
}

export interface ComparativeReport {
  executiveSummary: string;
  commonPatterns: string[];
  outliers: string[];
  aggregatedStats: { label: string; count: number; description: string }[];
}