'use client';

import { useEffect, useState } from 'react';
import { parseAttemptsResponse } from '@/lib/toefl-attempts';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/toefl/attempts?limit=50')
      .then(r => r.json())
      .then(data => { setAttempts(parseAttemptsResponse(data)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1 style={{ fontFamily: 'var(--font-baloo)', fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>
        Practice History
      </h1>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Loading...</p>
      ) : attempts.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: '16px', padding: '32px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>
            No attempts yet. Start practicing to build your history!
          </p>
          <button
            onClick={() => router.push('/toefl/practice')}
            style={{
              marginTop: '16px',
              background: 'var(--color-primary)', color: 'white', border: 'none',
              borderRadius: 'var(--radius-pill)', padding: '12px 24px',
              fontFamily: 'var(--font-baloo)', fontWeight: 600, cursor: 'pointer',
              boxShadow: 'var(--shadow-clay-sm)',
            }}
          >Start Practice</button>
        </div>
      ) : (
        <div>
          {attempts.map(attempt => (
            <div
              key={attempt.id}
              onClick={() => router.push(`/toefl/attempt/${attempt.id}`)}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '12px',
                border: '3px solid rgba(79,70,229,0.12)',
                boxShadow: 'var(--shadow-clay-sm)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-baloo)', fontWeight: 600, fontSize: '16px' }}>
                  {attempt.mode === 'guided' ? 'Guided' : 'Simulation'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)', marginTop: '2px' }}>
                  {attempt.toefl_tasks?.category === 'listen_repeat' ? 'Listen and Repeat' : 'Interview'} · {attempt.toefl_tasks?.difficulty}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>
                  {new Date(attempt.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {Number(attempt.overall_score).toFixed(1)}
                </div>
                <ArrowRight size={20} color='var(--color-text-muted)' />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
