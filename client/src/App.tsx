import { useState, useCallback } from 'react';
import { AgentPipeline } from './components/AgentPipeline';
import { InputCard } from './components/InputCard';
import { ReportView } from './components/ReportView';
import { AgentState, AgentName, AnalysisReport } from './types';

const AGENT_NAMES: AgentName[] = [
  'Prior Art Search',
  'Novelty Diff',
  'Claim Drafter',
  'Examiner Simulator',
];

const INITIAL_AGENTS: AgentState[] = AGENT_NAMES.map((name) => ({ name, status: 'idle' }));

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const appendLog = (msg: string) => setLog((prev) => [...prev.slice(-49), msg]);

  const runAnalysis = useCallback(async (idea: string, mode: 'patent' | 'research') => {
    setIsRunning(true);
    setReport(null);
    setError(null);
    setLog([]);
    setAgents(INITIAL_AGENTS);

    const url = `/api/analyze?idea=${encodeURIComponent(idea)}&mode=${mode}`;
    const es = new EventSource(url);

    es.addEventListener('agent', (e) => {
      const data = JSON.parse(e.data) as { name: AgentName; status: 'running' | 'done' };
      setAgents((prev) =>
        prev.map((a) => (a.name === data.name ? { ...a, status: data.status } : a))
      );
      appendLog(`[${data.name}] ${data.status === 'running' ? 'Starting...' : 'Completed ✓'}`);
    });

    es.addEventListener('result', (e) => {
      const data = JSON.parse(e.data) as { report: AnalysisReport };
      setReport(data.report);
      setIsRunning(false);
      es.close();
      appendLog('Analysis complete.');
    });

    es.addEventListener('error', (e) => {
      if ('data' in e) {
        const data = JSON.parse((e as MessageEvent).data) as { message: string };
        setError(data.message);
      } else {
        setError('Connection error. Is the server running?');
      }
      setIsRunning(false);
      setAgents((prev) => prev.map((a) => (a.status === 'running' ? { ...a, status: 'error' } : a)));
      es.close();
      appendLog('Error occurred.');
    });

    es.onerror = () => {
      if (!isRunning) return;
      setError('Connection lost. Is the server running on port 3001?');
      setIsRunning(false);
      es.close();
    };
  }, [isRunning]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔬</span>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Agentic Research Assistant</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI-powered patent & research analysis pipeline</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Main layout */}
        <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Left column */}
          <aside className="space-y-4">
            <AgentPipeline agents={agents} log={log} isRunning={isRunning} />
          </aside>

          {/* Right column */}
          <div className="space-y-6">
            <InputCard onRun={runAnalysis} isRunning={isRunning} />
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4 text-red-700 dark:text-red-300 text-sm">
                <strong>Error: </strong>{error}
              </div>
            )}
            {report && <ReportView report={report} />}
            {!report && !error && !isRunning && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center text-slate-400 dark:text-slate-500">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm">Your analysis report will appear here.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
