'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseAttemptsResponse } from '@/lib/toefl-attempts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mic, ChevronRight, Filter, SearchX } from 'lucide-react';

function getScoreColor(score: number): string {
  if (score >= 3.5) return 'var(--color-score-excellent)';
  if (score >= 2.5) return 'var(--color-score-good)';
  if (score >= 1.5) return 'var(--color-score-needs-work)';
  return 'var(--color-score-practice)';
}

function getScoreLabel(score: number): string {
  if (score >= 3.5) return 'Excellent';
  if (score >= 2.5) return 'Good';
  if (score >= 1.5) return 'Needs Work';
  return 'Practice More';
}

function getScoreBadgeBg(score: number): string {
  if (score >= 3.5) return 'rgba(34, 197, 94, 0.15)';
  if (score >= 2.5) return 'rgba(79, 70, 229, 0.15)';
  if (score >= 1.5) return 'rgba(234, 179, 8, 0.15)';
  return 'rgba(239, 68, 68, 0.15)';
}

type FilterMode = 'all' | 'guided' | 'simulation';

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>('all');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/toefl/attempts?limit=50')
      .then(r => r.json())
      .then(data => { setAttempts(parseAttemptsResponse(data)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? attempts
    : attempts.filter((a: any) => a.mode === filter);

  const filterOptions: { value: FilterMode; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'guided', label: 'Guided' },
    { value: 'simulation', label: 'Simulation' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ paddingLeft: '12px', paddingRight: '12px' }}>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Practice History
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {attempts.length} {attempts.length === 1 ? 'session' : 'sessions'} completed
        </p>
      </div>

      {attempts.length > 0 && (
        <div className="flex gap-2 mb-6" style={{ paddingLeft: '12px', paddingRight: '12px' }}>
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all touch-target"
              style={{
                fontFamily: 'var(--font-heading)',
                background: filter === opt.value ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                color: filter === opt.value ? 'white' : 'var(--color-text-secondary)',
                border: `1px solid ${filter === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                boxShadow: filter === opt.value ? 'var(--shadow-button)' : 'none',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && attempts.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(79, 70, 229, 0.1)' }}
          >
            <SearchX size={32} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            No Practice Yet
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Complete your first speaking exercise to start building your history.
          </p>
          <Button
            onClick={() => router.push('/toefl/practice')}
            icon={<Mic size={18} />}
          >
            Start Practice
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No {filter} sessions found.
          </p>
        </Card>
      ) : (
        <div>
          {filtered.map((attempt: any) => {
            const score = Number(attempt.overall_score) || 0;
            const category = attempt.toefl_tasks?.category;
            const isListenRepeat = category === 'listen_repeat';
            const taskLabel = isListenRepeat ? 'Listen & Repeat' : 'Interview';
            const modeLabel = attempt.mode === 'guided' ? 'Guided' : 'Simulation';
            const dateStr = new Date(attempt.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = new Date(attempt.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <Card
                key={attempt.id}
                padding="md"
                onClick={() => router.push(`/toefl/attempt/${attempt.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(79, 70, 229, 0.1)' }}
                    >
                      <Mic size={18} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="font-semibold truncate"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {taskLabel}
                        </p>
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                          style={{
                            background: attempt.mode === 'guided'
                              ? 'rgba(79, 70, 229, 0.1)'
                              : 'rgba(249, 115, 22, 0.1)',
                            color: attempt.mode === 'guided'
                              ? 'var(--color-primary)'
                              : 'var(--color-accent)',
                          }}
                        >
                          {modeLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {dateStr} · {timeStr}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <div className="text-right">
                      <span
                        className="text-lg font-bold block leading-tight"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: getScoreColor(score),
                        }}
                      >
                        {score.toFixed(1)}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: getScoreBadgeBg(score),
                          color: getScoreColor(score),
                        }}
                      >
                        {getScoreLabel(score)}
                      </span>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}