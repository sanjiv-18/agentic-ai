import { AgentState } from '../types';

const AGENT_ICONS: Record<string, string> = {
  'Prior Art Search': '🔍',
  'Novelty Diff': '⚖️',
  'Claim Drafter': '✍️',
  'Examiner Simulator': '👨⚖️',
};

const AGENT_DESC: Record<string, string> = {
  'Prior Art Search': 'Queries PatentsView for related patents',
  'Novelty Diff': 'Compares features against prior art',
  'Claim Drafter': 'Drafts independent & dependent claims',
  'Examiner Simulator': 'Simulates USPTO examiner objections',
};

interface Props {
  agents: AgentState[];
  log: string[];
  isRunning: boolean;
}

function StatusDot({ status }: { status: AgentState['status'] }) {
  const base = 'w-2.5 h-2.5 rounded-full flex-shrink-0';
  if (status === 'idle') return <span className={`${base} bg-slate-300 dark:bg-slate-600`} />;
  if (status === 'running') return <span className={`${base} bg-amber-400 animate-pulse`} />;
  if (status === 'done') return <span className={`${base} bg-emerald-500`} />;
  return <span className={`${base} bg-red-500`} />;
}

function ProgressBar({ status }: { status: AgentState['status'] }) {
  const widthClass =
    status === 'idle' ? 'w-0' :
    status === 'running' ? 'w-2/3' :
    status === 'done' ? 'w-full' : 'w-full';
  const colorClass =
    status === 'running' ? 'bg-amber-400' :
    status === 'done' ? 'bg-emerald-500' :
    status === 'error' ? 'bg-red-500' : 'bg-slate-300';

  return (
    <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClass} ${widthClass} transition-all duration-700 ease-out rounded-full`}
      />
    </div>
  );
}

export function AgentPipeline({ agents, log, isRunning }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">Agent Pipeline</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {agents.map((agent, i) => (
            <div key={agent.name} className="px-4 py-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">{AGENT_ICONS[agent.name]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusDot status={agent.status} />
                    <span className="text-sm font-medium truncate">{agent.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{AGENT_DESC[agent.name]}</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{i + 1}/4</span>
              </div>
              <ProgressBar status={agent.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Activity log */}
      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">Activity Log</h2>
          {isRunning && <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />Live</span>}
        </div>
        <div className="p-3 h-40 overflow-y-auto scrollbar-thin font-mono text-xs space-y-1">
          {log.length === 0 ? (
            <p className="text-slate-400 dark:text-slate-500">No activity yet.</p>
          ) : (
            log.map((entry, i) => (
              <div key={i} className="text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 mr-2">&gt;</span>{entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
