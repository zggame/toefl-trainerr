'use client';

import { useState } from 'react';
import { ScoreBreakdown } from './score-breakdown';
import { ScoringResult } from '@/lib/gemini';
import { RotateCcw, Pencil, Check, Mic } from 'lucide-react';

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
  const pct = (overallScore / 4) * 100;

  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-clay)',
      padding: '24px',
      border: '3px solid rgba(79,70,229,0.15)',
      boxShadow: 'var(--shadow-clay-lg)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '48px', fontWeight: 700, color: 'var(--color-primary)' }}>
          {overallScore.toFixed(1)}
          <span style={{ fontSize: '20px', color: 'var(--color-text-muted)' }}> / 4</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', marginTop: '8px' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '4px', transition: 'width 600ms ease' }} />
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          background: 'var(--color-background)',
          border: '2px solid rgba(79,70,229,0.2)',
          borderRadius: '12px',
          padding: '10px',
          cursor: 'pointer',
          fontFamily: 'var(--font-baloo)',
          color: 'var(--color-primary)',
          fontWeight: 600,
          marginBottom: expanded ? '16px' : '0',
        }}
      >
        {expanded ? 'Hide' : 'Show'} Score Details
      </button>

      {expanded && <ScoreBreakdown scoring={scoring} />}

      {scoring.errors.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px', marginBottom: '16px' }}>
          {scoring.errors.map(e => (
            <span key={e} style={{
              background: 'rgba(245,158,11,0.15)',
              color: '#D97706',
              border: '2px solid rgba(245,158,11,0.3)',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 12px',
              fontSize: '12px',
              fontFamily: 'var(--font-baloo)',
            }}>{e}</span>
          ))}
        </div>
      )}

      {attemptId && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 12px',
          background: 'rgba(79,70,229,0.06)',
          borderRadius: '12px',
          marginBottom: '16px',
          border: '2px solid rgba(79,70,229,0.12)',
        }}>
          <Mic size={16} color='var(--color-primary)' />
          <span style={{ fontFamily: 'var(--font-comic)', fontSize: '13px', color: 'var(--color-text)' }}>
            Recording will be available on the review page
          </span>
          <a
            href={`/toefl/attempt/${attemptId}`}
            style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-baloo)',
              fontSize: '13px',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            View →
          </a>
        </div>
      )}

      <p style={{
        fontSize: '14px',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-comic)',
        padding: '12px',
        background: 'var(--color-background)',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '2px solid rgba(79,70,229,0.1)',
      }}>
        {scoring.suggestion}
      </p>

      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <button
          onClick={onFullRetake}
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: '3px solid transparent',
            borderRadius: 'var(--radius-pill)',
            padding: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font-baloo)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-clay-sm)',
            transition: 'all 200ms ease',
          }}
        >
          <RotateCcw size={18} /> Full Retake
        </button>
        <button
          onClick={onTargetedRetry}
          style={{
            background: 'white',
            color: 'var(--color-primary)',
            border: '3px solid var(--color-primary)',
            borderRadius: 'var(--radius-pill)',
            padding: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font-baloo)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            transition: 'all 200ms ease',
          }}
        >
          <Pencil size={18} /> Targeted Retry
        </button>
        <button
          onClick={onDone}
          style={{
            background: 'var(--color-cta)',
            color: 'white',
            border: '3px solid transparent',
            borderRadius: 'var(--radius-pill)',
            padding: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font-baloo)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            boxShadow: '0 4px 0 var(--color-cta-dark)',
            transition: 'all 200ms ease',
          }}
        >
          <Check size={18} /> Done
        </button>
      </div>
    </div>
  );
}