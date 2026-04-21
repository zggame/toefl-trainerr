'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Mic, TrendingUp, Flame, Target } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export default function ToeflHome() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (!result.data.user) { router.push('/auth/signin'); return; }
      fetch('/api/toefl/attempts?limit=5').then(r => r.json()).then(data => {
        setAttempts(data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, []);

  const latestScore = attempts[0]?.overall_score;
  const avgScore = attempts.length ? (attempts.reduce((s, a) => s + (a.overall_score || 0), 0) / attempts.length).toFixed(1) : null;

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1 style={{ fontFamily: 'var(--font-baloo)', fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>
        TOEFL Trainer
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          background: 'white', borderRadius: '16px', padding: '16px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          textAlign: 'center',
        }}>
          <Mic size={24} color='var(--color-primary)' style={{ marginBottom: '8px' }} />
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>
            {latestScore ? `${Number(latestScore).toFixed(1)}` : '—'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Latest Score</div>
        </div>
        <div style={{
          background: 'white', borderRadius: '16px', padding: '16px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          textAlign: 'center',
        }}>
          <TrendingUp size={24} color='var(--color-cta)' style={{ marginBottom: '8px' }} />
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>
            {avgScore || '—'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Avg Score</div>
        </div>
        <div style={{
          background: 'white', borderRadius: '16px', padding: '16px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          textAlign: 'center',
        }}>
          <Flame size={24} color='#F59E0B' style={{ marginBottom: '8px' }} />
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>
            {attempts.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Attempts</div>
        </div>
        <div style={{
          background: 'white', borderRadius: '16px', padding: '16px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          textAlign: 'center',
        }}>
          <Target size={24} color='var(--color-secondary)' style={{ marginBottom: '8px' }} />
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>
            4.0
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Target</div>
        </div>
      </div>

      <button
        onClick={() => router.push('/toefl/practice')}
        style={{
          width: '100%',
          background: 'var(--color-cta)',
          color: 'white',
          border: '3px solid transparent',
          borderRadius: 'var(--radius-pill)',
          padding: '16px',
          fontSize: '18px',
          fontWeight: 700,
          fontFamily: 'var(--font-baloo)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 6px 0 var(--color-cta-dark), var(--shadow-clay-md)',
          marginBottom: '24px',
          transition: 'all 200ms ease',
        }}
      >
        <Mic size={22} /> Start Practice
      </button>

      <div style={{
        display: 'flex',
        background: 'white',
        borderRadius: 'var(--radius-pill)',
        padding: '4px',
        marginBottom: '24px',
        border: '3px solid rgba(79,70,229,0.15)',
      }}>
        <button style={{
          flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-pill)',
          background: 'var(--color-primary)', color: 'white',
          fontFamily: 'var(--font-baloo)', fontWeight: 600, cursor: 'pointer',
        }}>Guided</button>
        <button style={{
          flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-pill)',
          background: 'transparent', color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-baloo)', fontWeight: 600, cursor: 'pointer',
        }}>Simulation</button>
      </div>

      <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
        Recent Attempts
      </h2>
      {loading ? <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Loading...</p> : attempts.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>No attempts yet. Start practicing!</p>
      ) : attempts.map(attempt => (
        <div
          key={attempt.id}
          onClick={() => router.push(`/toefl/attempt/${attempt.id}`)}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '8px',
            border: '3px solid rgba(79,70,229,0.12)',
            boxShadow: 'var(--shadow-clay-sm)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-baloo)', fontWeight: 600 }}>{attempt.mode}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>
              {new Date(attempt.created_at).toLocaleDateString()}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)' }}>
            {Number(attempt.overall_score).toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  );
}