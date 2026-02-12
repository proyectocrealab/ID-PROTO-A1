export interface AnalysisState {
  [key: string]: any;
}

export interface PrototypingExperiment {
  hypothesis: string;
  method: string;
  metric: string;
}

export interface AIInsight {
  opportunities: string[];
  threats: string[];
  strategicAdvice: string;
  prototypingExperiments: PrototypingExperiment[];
  dataQualityScore: number;
  dataQualityFeedback: string;
}
