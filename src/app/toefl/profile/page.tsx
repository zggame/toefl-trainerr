'use client';

import { useEffect, useState } from 'react';
import { parseAttemptsResponse } from '@/lib/toefl-attempts';
import { Mic, TrendingUp, Flame, Target, User } from 'lucide-react';

export default function ProfilePage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/toefl/attempts?limit=100')
      .then(r => r.json())
      .then(data => { setAttempts(parseAttemptsResponse(data)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const avgScore = attempts.length
    ? (attempts.reduce((s, a) => s + (a.overall_score || 0), 0) / attempts.length).toFixed(1)
    : null;

  const avgDelivery = attempts.length
    ? (attempts.reduce((s, a) => s + (a.delivery_score || 0), 0) / attempts.length).toFixed(1)
    : null;

  const avgLang = attempts.length
    ? (attempts.reduce((s, a) => s + (a.language_use_score || 0), 0) / attempts.length).toFixed(1)
    : null;

  const avgTopic = attempts.length
    ? (attempts.reduce((s, a) => s + (a.topic_dev_score || 0), 0) / attempts.length).toFixed(1)
    : null;

  const dimensions = [
    { label: 'Delivery', score: avgDelivery, color: 'var(--color-primary)' },
    { label: 'Language Use', score: avgLang, color: 'var(--color-cta)' },
    { label: 'Topic Dev', score: avgTopic, color: 'var(--color-secondary)' },
  ];

  const weakest = dimensions.reduce((min, d) =>
    (d.score !== null && (min.score === null || Number(d.score) < Number(min.score))) ? d : min
  , dimensions[0]);

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1 style={{ fontFamily: 'var(--font-baloo)', fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>
        Profile
      </h1>

      <div style={{
        background: 'white', borderRadius: '16px', padding: '20px',
        border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-md)',
        textAlign: 'center', marginBottom: '16px',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
          boxShadow: 'var(--shadow-clay-md)',
        }}>
          <User size={32} color='white' />
        </div>
        <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '20px', fontWeight: 700 }}>
          TOEFL Learner
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Avg Score', value: avgScore || '—', icon: TrendingUp, color: 'var(--color-primary)' },
          { label: 'Total Tasks', value: attempts.length, icon: Mic, color: 'var(--color-cta)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{
            background: 'white', borderRadius: '16px', padding: '16px',
            border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
            textAlign: 'center',
          }}>
            <Icon size={24} color={color} style={{ marginBottom: '8px' }} />
            <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700 }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>{label}</div>
          </div>
        ))}
      </div>

      {loading ? null : (
        <>
          <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
            Score Breakdown
          </h2>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '20px',
            border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
            marginBottom: '16px',
          }}>
            {dimensions.map(d => {
              const scoreNum = Number(d.score);
              const pct = isNaN(scoreNum) ? 0 : (scoreNum / 4) * 100;
              return (
                <div key={d.label} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-baloo)', fontWeight: 600, fontSize: '14px' }}>{d.label}</span>
                    <span style={{ fontFamily: 'var(--font-baloo)', fontWeight: 700, fontSize: '16px', color: d.score !== null && Number(d.score) < 2.5 ? '#F59E0B' : d.color }}>
                      {d.score ?? '—'}
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: d.color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {weakest && (
            <div style={{
              background: 'rgba(245,158,11,0.1)',
              border: '3px solid rgba(245,158,11,0.3)',
              borderRadius: '16px', padding: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Target size={18} color='#D97706' />
                <span style={{ fontFamily: 'var(--font-baloo)', fontWeight: 600, color: '#D97706', fontSize: '14px' }}>
                  Focus Area
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text)', fontSize: '14px' }}>
                Your weakest dimension is <strong>{weakest.label}</strong>. Practice more tasks to improve!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
