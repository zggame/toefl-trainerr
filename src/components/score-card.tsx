'use client';

import { useState } from 'react';
import { ScoreBreakdown } from './score-breakdown';
import { ScoringResult } from '@/lib/gemini';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreDisplay } from '@/components/ui/score-display';
import { RotateCcw, Pencil, Check, Mic, ChevronDown, ChevronUp } from 'lucide-react';

interface ScoreCardProps {
  overallScore: number;
  scoring: ScoringResult;
  attemptId?: string;
  onFullRetake: () => void;
  onTargetedRetry: () => void;
  onDone: () => void;
}

export function ScoreCard({ overallScore, scoring, attemptId, onFullRetake, onTargetedRetry, onDone }: ScoreCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <Card padding="lg" className="text-center" gap>
        <ScoreDisplay score={overallScore} size="lg" />
        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 flex items-center justify-center gap-1 text-sm font-medium touch-target"
          style={{ color: 'var(--color-primary)' }}
        >
          {expanded ? <><ChevronUp size={16} /> Hide Details</> : <><ChevronDown size={16} /> Show Details</>}
        </button>
      </Card>

      {expanded && (
        <Card padding="lg">
          <ScoreBreakdown scoring={scoring} />
        </Card>
      )}

      {scoring.errors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {scoring.errors.map(e => (
            <span
              key={e}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#D97706',
              }}
            >
              {e}
            </span>
          ))}
        </div>
      )}

      {attemptId && (
        <Card padding="sm">
          <div className="flex items-center gap-2">
            <Mic size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm flex-1" style={{ color: 'var(--color-text-secondary)' }}>
              Recording saved
            </span>
            <a
              href={`/toefl/attempt/${attemptId}`}
              className="text-sm font-semibold"
              style={{ color: 'var(--color-primary)' }}
            >
              View →
            </a>
          </div>
        </Card>
      )}

      {scoring.suggestion && (
        <Card padding="md">
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            💡 {scoring.suggestion}
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <Button onClick={onFullRetake} icon={<RotateCcw size={18} />} fullWidth>
          Full Retake
        </Button>
        <Button variant="secondary" onClick={onTargetedRetry} icon={<Pencil size={18} />} fullWidth>
          Targeted Retry
        </Button>
        <Button variant="ghost" onClick={onDone} icon={<Check size={18} />} fullWidth>
          Done
        </Button>
      </div>
    </div>
  );
}