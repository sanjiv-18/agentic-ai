import { z } from 'zod';

export const PriorArtRefSchema = z.object({
  id: z.string(),
  title: z.string(),
  relevance: z.number().min(0).max(100),
  abstract: z.string().optional(),
  url: z.string().optional(),
});
export type PriorArtRef = z.infer<typeof PriorArtRefSchema>;

export const PriorArtResultSchema = z.object({
  references: z.array(PriorArtRefSchema),
});
export type PriorArtResult = z.infer<typeof PriorArtResultSchema>;

export const NoveltyFeatureSchema = z.object({
  feature: z.string(),
  status: z.enum(['Covered', 'Partial', 'New']),
  note: z.string().optional(),
});
export type NoveltyFeature = z.infer<typeof NoveltyFeatureSchema>;

export const NoveltyDiffResultSchema = z.object({
  features: z.array(NoveltyFeatureSchema),
});
export type NoveltyDiffResult = z.infer<typeof NoveltyDiffResultSchema>;

export const ClaimDraftResultSchema = z.object({
  independentClaim: z.string(),
  dependentClaims: z.array(z.string()).length(2),
  summary: z.string(),
});
export type ClaimDraftResult = z.infer<typeof ClaimDraftResultSchema>;

export const ExaminerObjectionSchema = z.object({
  issue: z.string(),
  type: z.enum(['obviousness', 'clarity', 'enablement', 'other']),
  severity: z.enum(['high', 'medium', 'low']),
  fix: z.string(),
});
export type ExaminerObjection = z.infer<typeof ExaminerObjectionSchema>;

export const ExaminerResultSchema = z.object({
  objections: z.array(ExaminerObjectionSchema),
  recommendation: z.string(),
  gaps: z.array(z.string()),
});
export type ExaminerResult = z.infer<typeof ExaminerResultSchema>;

export interface AnalysisReport {
  idea: string;
  mode: 'patent' | 'research';
  timestamp: string;
  priorArt: PriorArtResult;
  noveltyDiff: NoveltyDiffResult;
  claimDraft: ClaimDraftResult;
  examiner: ExaminerResult;
}

export type AgentName =
  | 'Prior Art Search'
  | 'Novelty Diff'
  | 'Claim Drafter'
  | 'Examiner Simulator';

export type AgentStatus = 'idle' | 'running' | 'done' | 'error';

export interface SSEAgentEvent {
  name: AgentName;
  status: 'running' | 'done';
  message?: string;
}

export interface SSEResultEvent {
  report: AnalysisReport;
}

export interface SSEErrorEvent {
  message: string;
}
