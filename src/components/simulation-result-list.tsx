'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import type { SimulationTask } from '@/lib/toefl-simulation';

export type SimulationScoreResult = {
  itemNumber: number;
  task: SimulationTask;
  attemptId?: string;
  overallScore?: number;
  error?: string;
};

function resultLabel(item: SimulationScoreResult): string {
  return `Item ${item.itemNumber} · ${item.task.category === 'listen_repeat' ? 'Listen and Repeat' : 'Interview'}`;
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px',
  background: 'var(--color-background)',
  borderRadius: '12px',
  border: '2px solid rgba(79,70,229,0.1)',
  fontFamily: 'var(--font-comic)',
  width: '100%',
  textAlign: 'left' as const,
};

export function SimulationResultList({ results }: { results: SimulationScoreResult[] }) {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
      {results.map(item => {
        const content = (
          <>
            <span style={{ color: 'var(--color-text)' }}>{resultLabel(item)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-baloo)', color: item.error ? '#EF4444' : 'var(--color-primary)', fontWeight: 700 }}>
                {item.error ? 'Failed' : `${item.overallScore?.toFixed(1)} / 4`}
              </span>
              {item.attemptId && <ArrowRight size={18} color='var(--color-text-muted)' />}
            </span>
          </>
        );

        if (item.attemptId) {
          return (
            <button
              key={item.itemNumber}
              type="button"
              aria-label={`${resultLabel(item)} detail`}
              onClick={() => router.push(`/toefl/attempt/${item.attemptId}`)}
              style={{
                ...rowStyle,
                cursor: 'pointer',
              }}
            >
              {content}
            </button>
          );
        }

        return (
          <div key={item.itemNumber} style={rowStyle}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
