import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { PriorArtResult, PriorArtResultSchema } from '../types';

const client = new Anthropic();
const MODEL = process.env.MODEL || 'claude-sonnet-4-6';

async function searchPatentsView(query: string): Promise<Array<{ id: string; title: string; abstract: string; url: string }>> {
  const apiKey = process.env.PATENTSVIEW_API_KEY;
  const url = new URL('https://search.patentsview.org/api/v1/patent/');
  
  const params: Record<string, unknown> = {
    q: { _text_any: { patent_title: query, patent_abstract: query } },
    f: ['patent_id', 'patent_title', 'patent_abstract'],
    o: { size: 5 },
  };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-Api-Key'] = apiKey;

  const resp = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  if (!resp.ok) throw new Error(`PatentsView API error: ${resp.status}`);
  const json = await resp.json() as { patents?: Array<{ patent_id: string; patent_title: string; patent_abstract: string }> };
  const patents = json.patents || [];

  return patents.map((p) => ({
    id: p.patent_id,
    title: p.patent_title,
    abstract: (p.patent_abstract || '').slice(0, 400),
    url: `https://patentsview.org/patents/${p.patent_id}`,
  }));
}

async function scoreRelevance(idea: string, patents: Array<{ id: string; title: string; abstract: string; url: string }>): Promise<PriorArtResult> {
  const prompt = `You are a patent analyst. Given an invention idea and a list of patents, return a JSON object with a "references" array.
Each reference must have:
- id: string (the patent id)
- title: string
- relevance: number 0-100 (how relevant to the idea)
- abstract: string (brief excerpt)
- url: string

Only include patents with relevance >= 40. Rank by relevance descending. Return at most 5.

Idea: ${idea}

Patents:
${JSON.stringify(patents, null, 2)}

Return ONLY valid JSON, no explanation.`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = res.content.map((b) => ('text' in b ? b.text : '')).join('');
  return PriorArtResultSchema.parse(JSON.parse(text));
}

export async function runPriorArtSearch(idea: string): Promise<PriorArtResult> {
  // Generate search queries via Claude
  const queryRes = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Generate 3 concise patent search queries for this invention idea. Return JSON: {"queries": ["...","...","..."]}\n\nIdea: ${idea}`,
    }],
  });

  const queryText = queryRes.content.map((b) => ('text' in b ? b.text : '')).join('');
  let queries: string[];
  try {
    const parsed = z.object({ queries: z.array(z.string()) }).parse(JSON.parse(queryText));
    queries = parsed.queries;
  } catch {
    queries = [idea.slice(0, 100)];
  }

  // Search PatentsView for each query
  const allPatents: Array<{ id: string; title: string; abstract: string; url: string }> = [];
  const seen = new Set<string>();

  for (const q of queries.slice(0, 3)) {
    try {
      const results = await searchPatentsView(q);
      for (const p of results) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          allPatents.push(p);
        }
      }
    } catch (err) {
      console.error('PatentsView query failed:', err);
    }
  }

  if (allPatents.length === 0) {
    // Fallback: return unverified references from Claude alone
    const fallback = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: `List 3 relevant existing patents or papers for this idea. Mark each as unverified. Return JSON: {"references": [{"id": "unverified", "title": "...", "relevance": 50, "abstract": "...", "url": ""}]}\n\nIdea: ${idea}`,
      }],
    });
    const fallbackText = fallback.content.map((b) => ('text' in b ? b.text : '')).join('');
    try {
      return PriorArtResultSchema.parse(JSON.parse(fallbackText));
    } catch {
      return { references: [] };
    }
  }

  // Score and rank
  let result: PriorArtResult;
  try {
    result = await scoreRelevance(idea, allPatents);
  } catch {
    // retry once
    result = await scoreRelevance(idea, allPatents);
  }
  return result;
}
