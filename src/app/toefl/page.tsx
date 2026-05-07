'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { parseAttemptsResponse } from '@/lib/toefl-attempts';
import { DesktopSidebar } from '@/components/layout/desktop-sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Clock,
  Flame,
  LayoutGrid,
  Mic,
  Sparkles,
  Target,
  TrendingUp,
  Bell,
  ChevronDown,
} from 'lucide-react';

type Attempt = Record<string, any>;

interface DashboardStats {
  totalAttempts: number;
  dailyAttempts: number;
  avgScore: number;
  latestScore: number;
  streakDays: number;
  recentAttempts: Attempt[];
  attemptsThisWeek: number;
  usageLimit: number;
}

function formatAttemptDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatAttemptTime(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

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
  if (score >= 3.5) return 'rgba(34, 197, 94, 0.14)';
  if (score >= 2.5) return 'rgba(79, 70, 229, 0.14)';
  if (score >= 1.5) return 'rgba(234, 179, 8, 0.14)';
  return 'rgba(239, 68, 68, 0.14)';
}

function getCategoryLabel(category: string | undefined) {
  if (category === 'listen_repeat') return 'Listen & Repeat';
  if (category === 'interview') return 'Interview';
  if (category === 'simulation') return 'Simulation';
  return 'Practice';
}

function getWeakestDimension(attempts: Attempt[]) {
  const dimensions = [
    { key: 'delivery_score', label: 'Delivery', description: 'work on steadier pacing and clearer word endings.' },
    { key: 'language_use_score', label: 'Language Use', description: 'tighten grammar and sentence variety.' },
    { key: 'topic_dev_score', label: 'Topic Development', description: 'add a clearer example and stronger progression.' },
  ];

  const scored = dimensions
    .map((dimension) => {
      const values = attempts
        .map((attempt) => Number(attempt[dimension.key]))
        .filter((value) => Number.isFinite(value) && value > 0);
      const average = values.length
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : 0;

      return {
        ...dimension,
        average,
      };
    })
    .sort((a, b) => {
      if (a.average === 0 && b.average === 0) return 0;
      if (a.average === 0) return 1;
      if (b.average === 0) return -1;
      return a.average - b.average;
    });

  return scored[0];
}

function MetricCell({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-4 py-2 border-r border-[var(--color-border)] last:border-r-0">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>
        <span style={{ color: tone }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

function HeroMotif() {
  return (
    <div className="absolute inset-y-0 right-0 hidden w-[35%] overflow-hidden md:block pointer-events-none">
      <div className="absolute right-[-5%] top-[-10%] h-64 w-64 rounded-full bg-[rgba(79,70,229,0.06)] blur-3xl" />
      <div className="absolute right-[5%] bottom-[-5%] h-48 w-48 rounded-full bg-[rgba(249,115,22,0.08)] blur-3xl" />
      <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-20">
        <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="100" cy="100" r="50" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 4" />
          <path d="M70 100C70 83.4315 83.4315 70 100 70C116.569 70 130 83.4315 130 100" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function PracticeRow({ attempt, onClick }: { attempt: Attempt; onClick: () => void }) {
  const score = Number(attempt.overall_score) || 0;
  const categoryLabel = getCategoryLabel(attempt.toefl_tasks?.category ?? attempt.category);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 border-b border-[var(--color-border)] bg-white px-6 py-6 text-left transition-all duration-200 last:border-b-0 hover:bg-[rgba(79,70,229,0.02)] group"
    >
      <div className="flex min-w-0 flex-[1.3] items-center gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors group-hover:scale-105"
          style={{
            background: attempt.mode === 'simulation' ? 'rgba(249, 115, 22, 0.08)' : 'rgba(79, 70, 229, 0.08)',
          }}
        >
          <Mic size={18} style={{ color: attempt.mode === 'simulation' ? 'var(--color-accent)' : 'var(--color-primary)' }} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            {categoryLabel}
          </p>
          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider md:hidden" style={{ color: 'var(--color-text-muted)' }}>
            {attempt.mode === 'simulation' ? 'Simulation' : 'Guided'}
          </p>
        </div>
      </div>

      <div className="hidden flex-1 min-w-0 md:block">
        <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {attempt.topic_domain ? String(attempt.topic_domain).replace(/_/g, ' ') : 'General Practice'}
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right w-16">
          <div className="text-lg font-bold leading-none" style={{ fontFamily: 'var(--font-mono)', color: getScoreColor(score) }}>
            {score.toFixed(1)}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-tight" style={{ color: getScoreColor(score) }}>
            {getScoreLabel(score)}
          </div>
        </div>
        
        <div className="hidden w-24 text-right text-xs font-medium md:block" style={{ color: 'var(--color-text-muted)' }}>
          {formatAttemptDate(attempt.created_at)}
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-overlay)] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
          <ArrowRight size={16} style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/toefl/attempts').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/toefl/profile').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([attemptsData, profileData]) => {
        const parsedAttempts = parseAttemptsResponse(attemptsData) as Attempt[];
        const sortedAttempts = [...parsedAttempts].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        const numericScores = sortedAttempts
          .map((attempt) => Number(attempt.overall_score))
          .filter((score) => Number.isFinite(score) && score > 0);

        const avgScore = numericScores.length
          ? numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length
          : 0;

        const latestScore = sortedAttempts.length ? Number(sortedAttempts[0].overall_score) || 0 : 0;
        const attemptsThisWeek = sortedAttempts.filter((attempt) => {
          const createdAt = new Date(attempt.created_at).getTime();
          return Number.isFinite(createdAt) && Date.now() - createdAt <= 7 * 24 * 60 * 60 * 1000;
        }).length;

        setStats({
          totalAttempts: profileData?.total_attempts ?? sortedAttempts.length,
          dailyAttempts: profileData?.daily_attempt_count ?? 0,
          avgScore,
          latestScore,
          streakDays: profileData?.streak_days ?? 0,
          recentAttempts: sortedAttempts.slice(0, 3),
          attemptsThisWeek,
          usageLimit: 10,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const hasAttempts = Boolean(stats && stats.totalAttempts > 0);
  const weakestSkill = stats ? getWeakestDimension(stats.recentAttempts) : null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const usageText = stats
    ? `${Math.min(stats.dailyAttempts, stats.usageLimit)} of ${stats.usageLimit} scores used`
    : '0 of 10 scores used';

  return (
    <div className="w-full min-h-screen">
      <div className="flex w-full min-h-screen">
        <DesktopSidebar
          usageText={usageText}
          usageCount={Math.min(stats?.dailyAttempts ?? 0, stats?.usageLimit ?? 10)}
          usageLimit={stats?.usageLimit ?? 10}
        />

        <div className="flex-1 min-w-0">
          <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-6 py-8 md:px-10">
            <header className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>
                  Good to see you 👋
                </h1>
                <p className="mt-1 text-sm font-medium md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  One focused round is enough for today.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] shadow-sm transition-all hover:bg-[var(--color-bg-elevated)]"
                >
                  <Bell size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/toefl/profile')}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-left shadow-sm transition-all hover:bg-[var(--color-bg-elevated)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-white shadow-sm">
                    LT
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-bold leading-tight" style={{ fontFamily: 'var(--font-body)' }}>
                      Lena
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      Profile & Theme
                    </div>
                  </div>
                  <ChevronDown size={14} className="ml-1 text-[var(--color-text-muted)]" />
                </button>
              </div>
            </header>

            <section className="grid gap-6 lg:grid-cols-12">
              <Card
                padding="lg"
                gap={false}
                hover={false}
                style={{
                  overflow: 'hidden',
                  position: 'relative',
                  minHeight: '280px',
                  background: 'linear-gradient(135deg, #FFF9EF 0%, #FFF4E5 100%)',
                  border: '1px solid #FFE8CC',
                }}
                className="lg:col-span-7 flex flex-col justify-center"
              >
                <HeroMotif />
                <div className="relative z-10 flex h-full flex-col gap-6 md:max-w-[75%]">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] border border-white/40">
                      <Sparkles size={12} />
                      Best next step
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>
                      Build a stronger speaking response
                    </h2>
                    <p className="max-w-xl text-sm leading-relaxed md:text-base font-medium text-[var(--color-text-secondary)]">
                      Start a guided round focused on clarity, pacing, and complete answers.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Button onClick={() => router.push('/toefl/practice?mode=guided')} icon={<Mic size={18} />} className="shadow-lg">
                      Start Guided Practice
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/toefl/practice?mode=simulation')} className="bg-white/80 hover:bg-white">
                      Take Full Simulation
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {['8-10 min', 'AI scoring', 'TOEFL-style prompt'].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full bg-white/40 px-3 py-1 text-[11px] font-bold text-[var(--color-text-muted)] border border-white/20"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>

              <Card
                padding="lg"
                gap={false}
                hover={false}
                style={{ background: 'white' }}
                className="lg:col-span-5 flex flex-col justify-center"
              >
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                      Your next improvement
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
                      {hasAttempts && weakestSkill?.average
                        ? weakestSkill.label
                        : 'Topic Development'}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      {hasAttempts && weakestSkill?.average
                        ? 'Try adding one clear example and a stronger ending in your next answer.'
                        : 'Your first insight will appear after a few attempts.'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                      <span>Last 5 attempts</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        {hasAttempts && weakestSkill?.average ? `${weakestSkill.average.toFixed(1)} / 4` : '0.0 / 4'}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-bg-overlay)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${hasAttempts && weakestSkill?.average ? (weakestSkill.average / 4) * 100 : 0}%`,
                          background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => router.push('/toefl/practice')}
                    icon={<Target size={16} />}
                    className="font-bold"
                  >
                    Practice this skill
                  </Button>
                </div>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-12">
              <div className="order-1 lg:order-2 lg:col-span-5">
                <div className="flex flex-col gap-6">
                  <Card
                    padding="none"
                    gap={false}
                    hover={false}
                    style={{ background: 'white' }}
                  >
                    <div className="flex items-center justify-between overflow-x-auto no-scrollbar">
                      <MetricCell
                        icon={<TrendingUp size={13} />}
                        label="Average"
                        value={stats && stats.avgScore > 0 ? `${stats.avgScore.toFixed(1)} / 4` : '0.0 / 4'}
                        tone="var(--color-primary)"
                      />
                      <MetricCell
                        icon={<Mic size={13} />}
                        label="Latest"
                        value={stats && stats.latestScore > 0 ? `${stats.latestScore.toFixed(1)} / 4` : '0.0 / 4'}
                        tone="var(--color-accent)"
                      />
                      <MetricCell
                        icon={<Flame size={13} />}
                        label="Streak"
                        value={stats ? `${stats.streakDays} days` : '0 days'}
                        tone="var(--color-accent)"
                      />
                      <MetricCell
                        icon={<Clock size={13} />}
                        label="This week"
                        value={stats ? String(stats.attemptsThisWeek) : '0'}
                        tone="var(--color-primary)"
                      />
                    </div>
                  </Card>

                  <Card
                    padding="lg"
                    gap={false}
                    hover={false}
                    style={{ background: 'white' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                          Full TOEFL simulation
                        </p>
                        <h3 className="text-lg font-bold leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                          When you want exam conditions.
                        </h3>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {['11 tasks', 'timed', 'scored'].map((chip) => (
                            <span
                              key={chip}
                              className="rounded-full bg-[rgba(249,115,22,0.06)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--color-accent)] border border-[rgba(249,115,22,0.1)]"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(249,115,22,0.08)] text-[var(--color-accent)] shadow-sm">
                        <LayoutGrid size={22} />
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => router.push('/toefl/practice?mode=simulation')}
                        icon={<ArrowRight size={16} />}
                        className="font-bold border-[var(--color-border)]"
                      >
                        Start Simulation
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              <Card
                padding="none"
                gap={false}
                hover={false}
                style={{ background: 'white' }}
                className="order-2 lg:order-1 lg:col-span-7 flex flex-col"
              >
                <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                      Recent practice
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/toefl/history')}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all hover:bg-[var(--color-bg-overlay)] text-[var(--color-primary)]"
                  >
                    View all history
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="flex-1">
                  <div
                    className="hidden border-y border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)] md:grid"
                    style={{ gridTemplateColumns: '1.3fr 1.2fr 160px' }}
                  >
                    <span>Category</span>
                    <span>Topic</span>
                    <div className="flex justify-between px-2">
                      <span>Score</span>
                      <span className="w-24 text-right">Date</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    {stats && stats.recentAttempts.length > 0 ? (
                      stats.recentAttempts.map((attempt) => (
                        <PracticeRow
                          key={attempt.id}
                          attempt={attempt}
                          onClick={() => router.push(`/toefl/attempt/${attempt.id}`)}
                        />
                      ))
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(79,70,229,0.06)] text-[var(--color-primary)]">
                          <Mic size={24} />
                        </div>
                        <h4 className="mt-4 text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                          No attempts yet
                        </h4>
                        <p className="mx-auto mt-2 max-w-xs text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                          Start a guided round to see your first score and insights.
                        </p>
                        <div className="mt-6">
                          <Button onClick={() => router.push('/toefl/practice?mode=guided')} icon={<Mic size={16} />}>
                            Start Guided Practice
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </section>

            {!hasAttempts && (
              <Card
                padding="lg"
                gap={false}
                hover={false}
                style={{
                  marginLeft: 0,
                  marginRight: 0,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(79,70,229,0.1)] text-[var(--color-primary)]">
                    <Mic size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                      Start your first guided practice
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      The dashboard will fill in as soon as you complete a few attempts.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
