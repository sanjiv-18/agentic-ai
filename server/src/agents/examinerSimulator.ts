import Anthropic from '@anthropic-ai/sdk';
import {
  ClaimDraftResult,
  ExaminerResult,
  ExaminerResultSchema,
  NoveltyDiffResult,
  PriorArtResult,
} from '../types';

const client = new Anthropic();
const MODEL = process.env.MODEL || 'claude-sonnet-4-6';

async function callClaude(
  idea: string,
  priorArt: PriorArtResult,
  noveltyDiff: NoveltyDiffResult,
  claimDraft: ClaimDraftResult
): Promise<ExaminerResult> {
  const prompt = `You are a USPTO patent examiner. Review the invention and its draft claims. Identify the most critical objections under US patent law.

For each objection return:
- issue: string (specific legal issue)
- type: "obviousness" | "clarity" | "enablement" | "other"
- severity: "high" | "medium" | "low"
- fix: string (concrete amendment or specification change to overcome it)

Also provide:
- recommendation: string (overall filing strategy advice)
- gaps: string[] (3-5 gaps in the current application that need addressing)

Return ONLY valid JSON:
{
  "objections": [{"issue": "...", "type": "...", "severity": "...", "fix": "..."}],
  "recommendation": "...",
  "gaps": ["...", "..."]
}

Idea: ${idea}

Prior art:
${priorArt.references.map((r) => `- ${r.id}: ${r.title} (relevance: ${r.relevance})`).join('\n')}

Novelty assessment:
${noveltyDiff.features.map((f) => `- [${f.status}] ${f.feature}`).join('\n')}

Draft claims:
Independent: ${claimDraft.independentClaim}
Dependent 1: ${claimDraft.dependentClaims[0]}
Dependent 2: ${claimDraft.dependentClaims[1]}`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = res.content.map((b) => ('text' in b ? b.text : '')).join('');
  return ExaminerResultSchema.parse(JSON.parse(text));
}

export async function runExaminerSimulator(
  idea: string,
  priorArt: PriorArtResult,
  noveltyDiff: NoveltyDiffResult,
  claimDraft: ClaimDraftResult
): Promise<ExaminerResult> {
  try {
    return await callClaude(idea, priorArt, noveltyDiff, claimDraft);
  } catch {
    return await callClaude(idea, priorArt, noveltyDiff, claimDraft);
  }
}
