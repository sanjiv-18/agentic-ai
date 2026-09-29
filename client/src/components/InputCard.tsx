import { useState } from 'react';

const PREFILL = 'An AI-based smart irrigation system that reads soil sensors and weather data, then doses water and nutrients per crop zone.';

interface Props {
  onRun: (idea: string, mode: 'patent' | 'research') => void;
  isRunning: boolean;
}

export function InputCard({ onRun, isRunning }: Props) {
  const [idea, setIdea] = useState(PREFILL);
  const [mode, setMode] = useState<'patent' | 'research'>('patent');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isRunning) return;
    onRun(idea.trim(), mode);
  };

  const charCount = idea.length;
  const isOverLimit = charCount > 2000;

  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-sm font-semibold">Research Idea or Invention Description</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Describe your idea in detail. The more specific, the better the analysis.</p>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your research idea or invention..."
            rows={5}
            maxLength={2100}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
            disabled={isRunning}
          />
          <div className={`text-right text-xs mt-1 ${isOverLimit ? 'text-red-500' : 'text-slate-400'}`}>
            {charCount}/2000
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">Output mode:</label>
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
            {(['patent', 'research'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-sm capitalize transition-colors ${
                  mode === m
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isRunning || isOverLimit || !idea.trim()}
          className="w-full py-2.5 px-4 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analysing...
            </span>
          ) : (
            'Run Analysis →'
          )}
        </button>
      </form>
    </div>
  );
}
