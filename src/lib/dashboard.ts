export type DashboardAttempt = {
  id: string;
  overall_score: number;
  delivery_score?: number | null;
  language_use_score?: number | null;
  topic_dev_score?: number | null;
  created_at: string;
  category: string;
  mode: 'guided' | 'simulation';
  topic_domain?: string | null;
};

type DashboardProfile = {
  total_attempts?: number | null;
  daily_attempt_count?: number | null;
  streak_days?: number | null;
} | null;

type BuildDashboardViewModelArgs = {
  attempts: DashboardAttempt[];
  profile: DashboardProfile;
  now?: Date;
};

const SKILL_CONFIG = [
  { key: 'delivery_score', label: 'Delivery' },
  { key: 'language_use_score', label: 'Language Use' },
  { key: 'topic_dev_score', label: 'Topic Development' },
] as const;

export function buildDashboardViewModel({
  attempts,
  profile,
  now = new Date(),
}: BuildDashboardViewModelArgs) {
  const safeAttempts = attempts.slice(0, 3);
  const scored = attempts.filter((attempt) => typeof attempt.overall_score === 'number');
  const averageScore = scored.length
    ? scored.reduce((sum, attempt) => sum + attempt.overall_score, 0) / scored.length
    : 0;

  const weakest = SKILL_CONFIG
    .map((skill) => {
      const values = safeAttempts
        .map((attempt) => attempt[skill.key])
        .filter((value): value is number => typeof value === 'number');
      const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
      return { label: skill.label, average };
    })
    .filter((skill) => skill.average !== null)
    .sort((a, b) => (a.average ?? 0) - (b.average ?? 0))[0];

  const attemptsThisWeek = attempts.filter((attempt) => {
    const createdAt = new Date(attempt.created_at);
    const ageMs = now.getTime() - createdAt.getTime();
    return ageMs >= 0 && ageMs < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const empty = (profile?.total_attempts ?? attempts.length) === 0;

  return {
    empty,
    hero: {
      eyebrow: 'Best next step',
      title: 'Practice one answer today',
      description: empty
        ? 'Build confidence with a short guided round focused on clarity, pacing, and complete answers.'
        : 'Build confidence with a short guided round focused on clarity, pacing, and complete answers.',
      meta: '8-10 min',
      href: '/toefl/practice?mode=guided',
      ctaLabel: 'Start Guided Practice',
      secondaryCta: {
        label: 'Take Full Simulation',
        href: '/toefl/practice?mode=simulation',
      },
    },
    insight: empty
      ? {
          title: 'Your next improvement',
          skillLabel: 'Low-friction repetition',
          description: 'Short guided drills improve consistency before you take a full simulation.',
          metricLabel: 'Start with',
          metricValue: '1 answer',
        }
      : {
          title: 'Your next improvement',
          skillLabel: weakest?.label ?? 'Delivery',
          description: weakest?.label === 'Topic Development'
            ? 'Try adding one clear example and a stronger ending in your next answer.'
            : 'Focus on your lowest scoring dimension in your next guided answer.',
          metricLabel: 'Recent attempts',
          metricValue: `${(weakest?.average ?? 0).toFixed(1)} / 4`,
        },
    stats: empty
      ? []
      : [
          { label: 'Average', value: `${averageScore.toFixed(1)} / 4` },
          { label: 'Latest', value: `${attempts[0]?.overall_score?.toFixed(1) ?? '0.0'} / 4` },
          { label: 'Streak', value: `${profile?.streak_days ?? 0} days` },
          { label: 'Attempts this week', value: String(attemptsThisWeek) },
        ],
    recentAttempts: safeAttempts,
    simulation: {
      title: 'Full TOEFL simulation',
      description: 'When you want exam conditions.',
      href: '/toefl/practice?mode=simulation',
      ctaLabel: 'Start Simulation',
      chips: ['11 tasks', 'timed', 'scored'],
    },
  };
}
