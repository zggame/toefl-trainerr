import { ScoringResult } from '@/lib/gemini';

function getScoreColor(score: number): string {
  if (score >= 3.5) return 'var(--color-score-excellent)';
  if (score >= 2.5) return 'var(--color-score-good)';
  if (score >= 1.5) return 'var(--color-score-needs-work)';
  return 'var(--color-score-practice)';
}

interface ScoreBreakdownProps {
  scoring: ScoringResult;
}

function ScoreBar({ score, label, evidence, tip }: { score: number; label: string; evidence: string; tip: string }) {
  const pct = (score / 4) * 100;
  const color = getScoreColor(score);

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between mb-1">
        <span className="font-medium text-sm">{label}</span>
        <span className="font-bold text-sm" style={{ color }}>{score.toFixed(1)}</span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--color-bg-overlay)' }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color, transition: 'width 600ms ease' }}
        />
      </div>
      {evidence && (
        <p className="text-sm mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>Evidence:</strong> {evidence}
        </p>
      )}
      {tip && (
        <p className="text-sm italic" style={{ color: 'var(--color-primary)' }}>
          {tip}
        </p>
      )}
    </div>
  );
}

export function ScoreBreakdown({ scoring }: ScoreBreakdownProps) {
  return (
    <div>
      <ScoreBar score={scoring.delivery.score} label="Delivery" evidence={scoring.delivery.evidence} tip={scoring.delivery.tip} />
      <ScoreBar score={scoring.languageUse.score} label="Language Use" evidence={scoring.languageUse.evidence} tip={scoring.languageUse.tip} />
      <ScoreBar score={scoring.topicDev.score} label="Topic Development" evidence={scoring.topicDev.evidence} tip={scoring.topicDev.tip} />
    </div>
  );
}