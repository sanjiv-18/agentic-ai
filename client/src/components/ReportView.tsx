import { useRef } from 'react';
import { AnalysisReport, ExaminerObjection, NoveltyFeature } from '../types';

interface Props {
  report: AnalysisReport;
}

function SeverityBadge({ severity }: { severity: ExaminerObjection['severity'] }) {
  const classes = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  }[severity];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${classes}`}>{severity}</span>;
}

function StatusChip({ status }: { status: NoveltyFeature['status'] }) {
  const classes = {
    Covered: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    Partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    New: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  }[status];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes}`}>{status}</span>;
}

function RelevanceMeter({ value }: { value: number }) {
  const color = value >= 75 ? 'bg-red-500' : value >= 50 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-mono text-slate-500 w-8 text-right">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-2">{title}</h3>
      {children}
    </section>
  );
}

function buildMarkdown(report: AnalysisReport): string {
  const { idea, timestamp, priorArt, noveltyDiff, claimDraft, examiner } = report;
  const lines: string[] = [
    `# Agentic Research Assistant Report`,
    `**Idea:** ${idea}`,
    `**Generated:** ${new Date(timestamp).toLocaleString()}`,
    '',
    '## Prior Art',
    ...priorArt.references.map((r) => `- **${r.id}** — ${r.title} (relevance: ${r.relevance}/100)`),
    '',
    '## Novelty Assessment',
    ...noveltyDiff.features.map((f) => `- [${f.status}] **${f.feature}**${f.note ? ` — ${f.note}` : ''}`),
    '',
    '## Draft Claims',
    claimDraft.independentClaim,
    '',
    ...claimDraft.dependentClaims,
    '',
    `*Summary: ${claimDraft.summary}*`,
    '',
    '## Examiner Objections',
    ...examiner.objections.map((o) => `### [${o.severity.toUpperCase()}] ${o.issue}\n**Fix:** ${o.fix}`),
    '',
    `**Recommendation:** ${examiner.recommendation}`,
    '',
    '## Gaps & Next Steps',
    ...examiner.gaps.map((g) => `- ${g}`),
  ];
  return lines.join('\n');
}

export function ReportView({ report }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { priorArt, noveltyDiff, claimDraft, examiner, timestamp } = report;

  const copyMarkdown = () => {
    navigator.clipboard.writeText(buildMarkdown(report));
  };

  const downloadMarkdown = () => {
    const blob = new Blob([buildMarkdown(report)], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-report.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Report header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold">Analysis Report</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Generated {new Date(timestamp).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyMarkdown}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            Copy MD
          </button>
          <button
            onClick={downloadMarkdown}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            ↓ .md
          </button>
          <button
            onClick={downloadPDF}
            className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            Print / PDF
          </button>
        </div>
      </div>

      {/* Report body */}
      <div ref={reportRef} className="p-5 space-y-8 font-serif text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {/* Summary */}
        <Section title="Summary">
          <p className="text-slate-600 dark:text-slate-300">{report.idea}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-sans mt-2">{claimDraft.summary}</p>
        </Section>

        {/* Prior art */}
        <Section title="Closest Prior Art">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <th className="pb-2 pr-4">ID</th>
                  <th className="pb-2 pr-4">Title</th>
                  <th className="pb-2 w-32">Relevance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {priorArt.references.map((ref) => (
                  <tr key={ref.id} className="group">
                    <td className="py-2.5 pr-4 align-top">
                      {ref.url ? (
                        <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline font-mono text-xs">{ref.id}</a>
                      ) : (
                        <span className="font-mono text-xs text-slate-500">{ref.id}</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 align-top">
                      <p className="font-medium text-slate-800 dark:text-slate-100 text-xs">{ref.title}</p>
                      {ref.abstract && <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-2">{ref.abstract}</p>}
                    </td>
                    <td className="py-2.5 align-top w-32">
                      <RelevanceMeter value={ref.relevance} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Novelty diff */}
        <Section title="Novelty Assessment">
          <div className="space-y-2 font-sans">
            {noveltyDiff.features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900">
                <StatusChip status={f.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-100">{f.feature}</p>
                  {f.note && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{f.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Claims */}
        <Section title="Draft Claims">
          <div className="space-y-3 font-sans">
            <div className="p-3 rounded-lg border-l-4 border-brand-500 bg-brand-50 dark:bg-brand-900/20">
              <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 mb-1">Independent Claim</p>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{claimDraft.independentClaim}</p>
            </div>
            {claimDraft.dependentClaims.map((claim, i) => (
              <div key={i} className="p-3 rounded-lg border-l-4 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Dependent Claim {i + 2}</p>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{claim}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Examiner objections */}
        <Section title="Examiner Objections">
          <div className="space-y-3 font-sans">
            {examiner.objections.map((obj, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
                <div className="flex items-start gap-2 flex-wrap">
                  <SeverityBadge severity={obj.severity} />
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">{obj.type}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200">{obj.issue}</p>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">Suggested fix:</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{obj.fix}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 font-sans mt-3">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 mb-1">Examiner Recommendation</p>
            <p className="text-xs text-slate-700 dark:text-slate-200">{examiner.recommendation}</p>
          </div>
        </Section>

        {/* Gaps */}
        <Section title="Gaps &amp; Next Steps">
          <ul className="space-y-2 font-sans">
            {examiner.gaps.map((gap, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="text-brand-500 mt-0.5 flex-shrink-0">→</span>
                <span className="text-slate-700 dark:text-slate-200">{gap}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
