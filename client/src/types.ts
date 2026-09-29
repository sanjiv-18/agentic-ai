export type AgentName =
  | 'Prior Art Search'
  | 'Novelty Diff'
  | 'Claim Drafter'
  | 'Examiner Simulator';

export type AgentStatus = 'idle' | 'running' | 'done' | 'error';

export interface AgentState {
  name: AgentName;
  status: AgentStatus;
}

export interface PriorArtRef {
  id: string;
  title: string;
  relevance: number;
  abstract?: string;
  url?: string;
}

export interface PriorArtResult {
  references: PriorArtRef[];
}

export interface NoveltyFeature {
  feature: string;
  status: 'Covered' | 'Partial' | 'New';
  note?: string;
}

export interface NoveltyDiffResult {
  features: NoveltyFeature[];
}

export interface ClaimDraftResult {
  independentClaim: string;
  dependentClaims: [string, string];
  summary: string;
}

export interface ExaminerObjection {
  issue: string;
  type: 'obviousness' | 'clarity' | 'enablement' | 'other';
  severity: 'high' | 'medium' | 'low';
  fix: string;
}

export interface ExaminerResult {
  objections: ExaminerObjection[];
  recommendation: string;
  gaps: string[];
}

export interface AnalysisReport {
  idea: string;
  mode: 'patent' | 'research';
  timestamp: string;
  priorArt: PriorArtResult;
  noveltyDiff: NoveltyDiffResult;
  claimDraft: ClaimDraftResult;
  examiner: ExaminerResult;
}
