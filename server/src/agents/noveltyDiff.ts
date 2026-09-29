import Anthropic from '@anthropic-ai/sdk';
import { NoveltyDiffResult, NoveltyDiffResultSchema, PriorArtResult } from '../types';

const client = new Anthropic();
const MODEL = process.env.MODEL || 'claude-sonnet-4-6';

async function callClaude(idea: string, priorArt: PriorArtResult): Promise<NoveltyDiffResult> {
  const prompt = `You are a patent novelty analyst. Split the invention idea into key technical features and evaluate each against the provided prior art references.

For each feature, assign a status:
- "Covered": clearly disclosed in one or more references
- "Partial": partially disclosed or disclosed in a different context
- "New": not found in any reference

Return ONLY valid JSON: {"features": [{"feature": "...", "status": "Covered|Partial|New", "note": "brief explanation"}]}

Invention idea: ${idea}

Prior art references:
${JSON.stringify(priorArt.references, null, 2)}`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = res.content.map((b) => ('text' in b ? b.text : '')).join('');
  return NoveltyDiffResultSchema.parse(JSON.parse(text));
}

export async function runNoveltyDiff(idea: string, priorArt: PriorArtResult): Promise<NoveltyDiffResult> {
  try {
    return await callClaude(idea, priorArt);
  } catch {
    // Retry once
    return await callClaude(idea, priorArt);
  }
}
