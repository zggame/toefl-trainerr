'use client';

import { useEffect, useState } from 'react';
import { parseAttemptsResponse } from '@/lib/toefl-attempts';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreDisplay } from '@/components/ui/score-display';
import {
  Mic, TrendingUp, Target, User, Sun, Moon, Monitor,
  ChevronRight, Award, BarChart3,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

function getScoreColor(score: number): string {
  if (score >= 3.5) return 'var(--color-score-excellent)';
  if (score >= 2.5) return 'var(--color-score-good)';
  if (score >= 1.5) return 'var(--color-score-needs-work)';
  return 'var(--color-score-practice)';
}

export default function ProfilePage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/toefl/attempts?limit=100')
      .then(r => r.json())
      .then(data => { setAttempts(parseAttemptsResponse(data)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalAttempts = attempts.length;
  const scores = attempts.map((a: any) => a.overall_score).filter(Boolean) as number[];
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;

  const deliveryScores = attempts.map((a: any) => a.delivery_score).filter(Boolean) as number[];
  const langScores = attempts.map((a: any) => a.language_use_score).filter(Boolean) as number[];
  const topicScores = attempts.map((a: any) => a.topic_dev_score).filter(Boolean) as number[];

  const avgDelivery = deliveryScores.length ? deliveryScores.reduce((a, b) => a + b, 0) / deliveryScores.length : 0;
  const avgLang = langScores.length ? langScores.reduce((a, b) => a + b, 0) / langScores.length : 0;
  const avgTopic = topicScores.length ? topicScores.reduce((a, b) => a + b, 0) / topicScores.length : 0;

  const dimensions = [
    { label: 'Delivery', score: avgDelivery, color: 'var(--color-primary)' },
    { label: 'Language Use', score: avgLang, color: 'var(--color-accent)' },
    { label: 'Topic Dev', score: avgTopic, color: 'var(--color-accent-green)' },
  ];

  const weakest = dimensions.reduce((min, d) =>
    (d.score > 0 && (min.score === 0 || d.score < min.score)) ? d : min
  , dimensions[0]);

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
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
    <div className="space-y-5 px-1">
      {/* Profile Header */}
      <Card padding="lg" className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(79, 70, 229, 0.1)' }}
        >
          <User size={32} style={{ color: 'var(--color-primary)' }} />
        </div>
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          TOEFL Learner
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {totalAttempts} {totalAttempts === 1 ? 'practice' : 'practices'} completed
        </p>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card padding="md" className="text-center">
          <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} className="mx-auto mb-1" />
          <div
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: avgScore > 0 ? getScoreColor(avgScore) : 'var(--color-text-muted)' }}
          >
            {avgScore > 0 ? avgScore.toFixed(1) : '—'}
          </div>
          <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Avg Score</div>
        </Card>

        <Card padding="md" className="text-center">
          <Award size={18} style={{ color: 'var(--color-score-excellent)' }} className="mx-auto mb-1" />
          <div
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: bestScore > 0 ? getScoreColor(bestScore) : 'var(--color-text-muted)' }}
          >
            {bestScore > 0 ? bestScore.toFixed(1) : '—'}
          </div>
          <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Best Score</div>
        </Card>

        <Card padding="md" className="text-center">
          <Mic size={18} style={{ color: 'var(--color-accent)' }} className="mx-auto mb-1" />
          <div
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
          >
            {totalAttempts}
          </div>
          <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Attempts</div>
        </Card>
      </div>

      {/* Score Breakdown */}
      {totalAttempts > 0 && (
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} style={{ color: 'var(--color-primary)' }} />
            <h2
              className="text-base font-semibold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Score Breakdown
            </h2>
          </div>

          <div className="space-y-4">
            {dimensions.map(d => (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {d.label}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: d.score > 0 ? getScoreColor(d.score) : 'var(--color-text-muted)' }}
                  >
                    {d.score > 0 ? d.score.toFixed(1) : '—'}<span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>/ 4</span>
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--color-bg-overlay)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${d.score > 0 ? (d.score / 4) * 100 : 0}%`,
                      background: d.score > 0 ? d.color : 'var(--color-text-muted)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Focus Area */}
      {totalAttempts > 0 && weakest && weakest.score > 0 && (
        <Card
          padding="md"
          className="border-2"
          marginBottom="0"
          style={{
            borderColor: 'rgba(249, 115, 22, 0.3)',
            background: resolvedTheme === 'dark'
              ? 'rgba(249, 115, 22, 0.05)'
              : 'rgba(249, 115, 22, 0.05)',
          } as React.CSSProperties}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(249, 115, 22, 0.15)' }}
            >
              <Target size={18} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}
              >
                Focus Area: {weakest.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Your lowest average score — practice more to improve!
              </p>
            </div>
          </div>
          <div className="mt-3">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => router.push('/toefl/practice')}
            >
              Practice {weakest.label}
            </Button>
          </div>
        </Card>
      )}

      {/* Preferences */}
      <Card padding="lg" marginBottom="0">
        <h2
          className="text-base font-semibold mb-3"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Preferences
        </h2>

        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Appearance
          </p>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(opt => {
              const Icon = opt.icon;
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all touch-target"
                  style={{
                    background: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      {totalAttempts > 0 && (
        <Card padding="md" marginBottom="0">
          <button
            onClick={() => router.push('/toefl/history')}
            className="flex items-center justify-between w-full touch-target"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(79, 70, 229, 0.1)' }}
              >
                <BarChart3 size={18} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                  View Full History
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {totalAttempts} practice sessions
                </p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </Card>
      )}
    </div>
  );
}