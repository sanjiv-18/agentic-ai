import Anthropic from '@anthropic-ai/sdk';
import { ClaimDraftResult, ClaimDraftResultSchema, NoveltyDiffResult, PriorArtResult } from '../types';

const client = new Anthropic();
const MODEL = process.env.MODEL || 'claude-sonnet-4-6';

async function callClaude(idea: string, noveltyDiff: NoveltyDiffResult, priorArt: PriorArtResult): Promise<ClaimDraftResult> {
  const newOrPartial = noveltyDiff.features.filter((f) => f.status === 'New' || f.status === 'Partial');

  const prompt = `You are a patent claim drafter. Draft patent claims using ONLY the features marked "New" or "Partial". Do NOT use "Covered" features as they lack novelty.

Craft:
1. One independent claim (broad, covering the core inventive concept)
2. Two dependent claims (each narrowing Claim 1 with a specific implementation detail)

Return ONLY valid JSON:
{
  "independentClaim": "Claim 1: ...",
  "dependentClaims": ["Claim 2 (dependent on Claim 1): ...", "Claim 3 (dependent on Claim 1): ..."],
  "summary": "One sentence explaining what makes this patentably distinct."
}

Idea: ${idea}

Novel/Partial features to claim:
${JSON.stringify(newOrPartial, null, 2)}

Prior art context (for reference, do not claim anything fully covered):
${priorArt.references.map((r) => `- ${r.id}: ${r.title}`).join('\n')}`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = res.content.map((b) => ('text' in b ? b.text : '')).join('');
  return ClaimDraftResultSchema.parse(JSON.parse(text));
}

export async function runClaimDrafter(idea: string, noveltyDiff: NoveltyDiffResult, priorArt: PriorArtResult): Promise<ClaimDraftResult> {
  try {
    return await callClaude(idea, noveltyDiff, priorArt);
  } catch {
    return await callClaude(idea, noveltyDiff, priorArt);
  }
}
