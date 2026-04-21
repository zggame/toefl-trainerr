import { ScoringResult } from '@/lib/gemini';

interface ScoreBreakdownProps {
  scoring: ScoringResult;
}

function ScoreBar({ score, label, evidence, tip }: { score: number; label: string; evidence: string; tip: string }) {
  const pct = (score / 4) * 100;
  const color = score >= 3.5 ? 'var(--color-cta)' : score >= 2.5 ? 'var(--color-primary)' : '#F59E0B';

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontFamily: 'var(--font-baloo)', fontWeight: 600, color: 'var(--color-text)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-baloo)', fontWeight: 700, fontSize: '18px', color }}>{score}</span>
      </div>
      <div style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 600ms ease' }} />
      </div>
      <p style={{ fontSize: '13px', color: 'var(--color-text)', marginTop: '6px', fontFamily: 'var(--font-comic)' }}>
        <strong>Evidence:</strong> {evidence}
      </p>
      <p style={{ fontSize: '13px', color: 'var(--color-primary)', marginTop: '4px', fontFamily: 'var(--font-comic)', fontStyle: 'italic' }}>
        {tip}
      </p>
    </div>
  );
}

export function ScoreBreakdown({ scoring }: ScoreBreakdownProps) {
  return (
    <div>
      <ScoreBar score={scoring.delivery.score} label='Delivery' evidence={scoring.delivery.evidence} tip={scoring.delivery.tip} />
      <ScoreBar score={scoring.languageUse.score} label='Language Use' evidence={scoring.languageUse.evidence} tip={scoring.languageUse.tip} />
      <ScoreBar score={scoring.topicDev.score} label='Topic Development' evidence={scoring.topicDev.evidence} tip={scoring.topicDev.tip} />
    </div>
  );
}