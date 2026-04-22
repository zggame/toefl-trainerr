'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreDisplay } from '@/components/ui/score-display';
import { Mic, Flame, TrendingUp, Clock, ChevronRight, Target } from 'lucide-react';

interface DashboardStats {
  totalAttempts: number;
  avgScore: number;
  streakDays: number;
  recentAttempts: Array<{
    id: string;
    overall_score: number;
    created_at: string;
    category: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/toefl/attempts')
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        const attempts = Array.isArray(data) ? data : [];
        const scores = attempts.map((a: any) => a.overall_score).filter(Boolean);
        const avgScore = scores.length > 0 
          ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length 
          : 0;

        setStats({
          totalAttempts: attempts.length,
          avgScore,
          streakDays: 0, // TODO: calculate from attempts
          recentAttempts: attempts.slice(0, 5).map((a: any) => ({
            id: a.id,
            overall_score: a.overall_score,
            created_at: a.created_at,
            category: a.toefl_tasks?.category || 'practice',
          })),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getScoreLabel = (score: number) => {
    if (score >= 3.5) return 'Excellent';
    if (score >= 2.5) return 'Good';
    if (score >= 1.5) return 'Needs Work';
    return 'Practice More';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 3.5) return 'rgba(34, 197, 94, 0.15)';
    if (score >= 2.5) return 'rgba(79, 70, 229, 0.15)';
    if (score >= 1.5) return 'rgba(234, 179, 8, 0.15)';
    return 'rgba(239, 68, 68, 0.15)';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 3.5) return 'var(--color-score-excellent)';
    if (score >= 2.5) return 'var(--color-score-good)';
    if (score >= 1.5) return 'var(--color-score-needs-work)';
    return 'var(--color-score-practice)';
  };

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

  const hasAttempts = stats && stats.totalAttempts > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Welcome Header */}
      <div style={{ paddingLeft: '12px', paddingRight: '12px' }}>
        <h1 
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Good to see you!
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {hasAttempts 
            ? "Keep up the great work! You're improving every day."
            : "Ready to start your TOEFL speaking practice?"
          }
        </p>
      </div>

      {/* Quick Action */}
      <Card 
        padding="lg" 
        className="relative overflow-hidden"
        onClick={() => router.push('/toefl/practice')}
      >
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
          style={{ 
            background: 'var(--color-primary)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 
              className="text-lg font-semibold mb-1"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Start Practice
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {hasAttempts 
                ? "Continue your practice session"
                : "Begin your first speaking exercise"
              }
            </p>
          </div>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-primary)' }}
          >
            <Mic size={24} color="white" />
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      {hasAttempts && (
        <div className="grid grid-cols-2 gap-4">
          <Card padding="md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Avg Score
              </span>
            </div>
            <ScoreDisplay score={stats.avgScore} size="sm" />
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-2 mb-2">
              <Target size={18} style={{ color: 'var(--color-accent)' }} />
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Attempts
              </span>
            </div>
            <div 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-primary)',
              }}
            >
              {stats.totalAttempts}
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={18} style={{ color: 'var(--color-accent)' }} />
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Streak
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span 
                className="text-2xl font-bold"
                style={{ 
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                }}
              >
                {stats.streakDays}
              </span>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                days
              </span>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} style={{ color: 'var(--color-primary-light)' }} />
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Best Score
              </span>
            </div>
            <div 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-score-excellent)',
              }}
            >
              {stats.recentAttempts.length > 0 
                ? Math.max(...stats.recentAttempts.map(a => a.overall_score || 0)).toFixed(1)
                : '0.0'
              }
            </div>
          </Card>
        </div>
      )}

      {/* Recent Attempts */}
      {hasAttempts && stats.recentAttempts.length > 0 && (
        <div style={{ paddingLeft: '12px', paddingRight: '12px' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Recent Practice
            </h2>
            <button
              onClick={() => router.push('/toefl/history')}
              className="flex items-center gap-1 text-sm"
              style={{ color: 'var(--color-primary)' }}
            >
              View All
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {stats.recentAttempts.map((attempt) => (
              <Card 
                key={attempt.id}
                padding="md"
                onClick={() => router.push(`/toefl/attempt/${attempt.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(79, 70, 229, 0.1)' }}
                    >
                      <Mic size={18} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
                        {attempt.category === 'listen_repeat' ? 'Listen & Repeat' : 'Interview'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(attempt.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span 
                      className="text-lg font-bold"
                      style={{ 
                        fontFamily: 'var(--font-mono)',
                        color: getScoreTextColor(attempt.overall_score),
                      }}
                    >
                      {attempt.overall_score?.toFixed(1) || '0.0'}
                    </span>
                    <span 
                      className="block text-xs px-2 py-0.5 rounded-full mt-1"
                      style={{ 
                        background: getScoreBadgeColor(attempt.overall_score),
                        color: getScoreTextColor(attempt.overall_score),
                      }}
                    >
                      {getScoreLabel(attempt.overall_score)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasAttempts && (
        <Card padding="lg" className="text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(79, 70, 229, 0.1)' }}
          >
            <Mic size={32} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h3 
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            No Practice Yet
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Start your first speaking exercise and track your progress here.
          </p>
          <Button 
            onClick={() => router.push('/toefl/practice')}
            icon={<Mic size={18} />}
          >
            Start First Practice
          </Button>
        </Card>
      )}
    </div>
  );
}
