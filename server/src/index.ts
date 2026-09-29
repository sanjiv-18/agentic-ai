import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { AnalysisReport, SSEAgentEvent } from './types';
import { runPriorArtSearch } from './agents/priorArtSearch';
import { runNoveltyDiff } from './agents/noveltyDiff';
import { runClaimDrafter } from './agents/claimDrafter';
import { runExaminerSimulator } from './agents/examinerSimulator';
import { MOCK_REPORT } from './mock/mockData';

const app = express();
const PORT = process.env.PORT || 3001;
const MOCK_MODE = process.env.MOCK_MODE === 'true';

app.use(cors());
app.use(express.json());

function sendSSE(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.get('/api/analyze', async (req: Request, res: Response) => {
  const idea = String(req.query.idea || '').slice(0, 2000).trim();
  const mode = (req.query.mode === 'research' ? 'research' : 'patent') as 'patent' | 'research';

  if (!idea) {
    res.status(400).json({ error: "Missing 'idea' query parameter." });
    return;
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  const send = (event: string, data: unknown) => sendSSE(res, event, data);

  if (MOCK_MODE) {
    const agents: SSEAgentEvent['name'][] = ['Prior Art Search', 'Novelty Diff', 'Claim Drafter', 'Examiner Simulator'];
    for (const name of agents) {
      send('agent', { name, status: 'running' });
      await sleep(1200);
      send('agent', { name, status: 'done' });
      await sleep(300);
    }
    const report: AnalysisReport = { ...MOCK_REPORT, idea, mode, timestamp: new Date().toISOString() };
    send('result', { report });
    res.end();
    return;
  }

  try {
    send('agent', { name: 'Prior Art Search', status: 'running' });
    const priorArt = await runPriorArtSearch(idea);
    send('agent', { name: 'Prior Art Search', status: 'done' });

    send('agent', { name: 'Novelty Diff', status: 'running' });
    const noveltyDiff = await runNoveltyDiff(idea, priorArt);
    send('agent', { name: 'Novelty Diff', status: 'done' });

    send('agent', { name: 'Claim Drafter', status: 'running' });
    const claimDraft = await runClaimDrafter(idea, noveltyDiff, priorArt);
    send('agent', { name: 'Claim Drafter', status: 'done' });

    send('agent', { name: 'Examiner Simulator', status: 'running' });
    const examiner = await runExaminerSimulator(idea, priorArt, noveltyDiff, claimDraft);
    send('agent', { name: 'Examiner Simulator', status: 'done' });

    const report: AnalysisReport = {
      idea,
      mode,
      timestamp: new Date().toISOString(),
      priorArt,
      noveltyDiff,
      claimDraft,
      examiner,
    };

    send('result', { report });
  } catch (err) {
    console.error('Analysis error:', err);
    send('error', { message: 'Analysis failed. Check your API key and try again.' });
  }

  res.end();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mockMode: MOCK_MODE });
});

app.listen(PORT, () => {
  console.log(`\n🔬 Agentic Research Assistant API`);
  console.log(`   Listening on http://localhost:${PORT}`);
  console.log(`   Mock mode: ${MOCK_MODE}`);
  console.log(`   Model: ${process.env.MODEL || 'claude-sonnet-4-6'}\n`);
});
