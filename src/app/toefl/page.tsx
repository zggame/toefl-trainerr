'use client';

import { useEffect, useState } from 'react';
import { buildDashboardViewModel, type DashboardAttempt } from '@/lib/dashboard';
import { DashboardScreen } from '@/components/dashboard/dashboard-screen';
import { DesktopSidebar } from '@/components/layout/desktop-sidebar';

type DashboardProfile = {
  total_attempts?: number;
  daily_attempt_count?: number;
  streak_days?: number;
} | null;

type AttemptsApiRow = {
  id?: string;
  overall_score?: number;
  delivery_score?: number | null;
  language_use_score?: number | null;
  topic_dev_score?: number | null;
  created_at?: string;
  category?: string;
  mode?: 'guided' | 'simulation';
  topic_domain?: string | null;
  toefl_tasks?: {
    category?: string;
    topic_domain?: string | null;
  } | null;
};

function normalizeAttempt(attempt: AttemptsApiRow): DashboardAttempt | null {
  if (!attempt.id || typeof attempt.overall_score !== 'number' || !attempt.created_at) {
    return null;
  }

  return {
    id: attempt.id,
    overall_score: attempt.overall_score,
    delivery_score: attempt.delivery_score,
    language_use_score: attempt.language_use_score,
    topic_dev_score: attempt.topic_dev_score,
    created_at: attempt.created_at,
    category: attempt.toefl_tasks?.category || attempt.category || 'practice',
    mode: attempt.mode === 'simulation' ? 'simulation' : 'guided',
    topic_domain: attempt.toefl_tasks?.topic_domain || attempt.topic_domain || null,
  };
}

export default function DashboardPage() {
  const [attempts, setAttempts] = useState<DashboardAttempt[]>([]);
  const [profile, setProfile] = useState<DashboardProfile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/toefl/attempts').then((response) => (response.ok ? response.json() : [])),
      fetch('/api/toefl/profile').then((response) => (response.ok ? response.json() : null)),
    ])
      .then(([attemptsData, profileData]) => {
        const normalizedAttempts = Array.isArray(attemptsData)
          ? attemptsData.slice(0, 5).map(normalizeAttempt).filter((attempt): attempt is DashboardAttempt => attempt !== null)
          : [];

        setAttempts(normalizedAttempts);
        setProfile(profileData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const model = buildDashboardViewModel({ attempts, profile });
  
  return (
    <div className="-mx-4 -mt-8 min-h-screen bg-[#f3f0ea] md:p-2">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] overflow-hidden bg-white shadow-[0_20px_70px_rgba(15,23,42,0.10)] md:min-h-[calc(100vh-16px)] md:rounded-2xl">
        <DesktopSidebar
          usageText={`${profile?.daily_attempt_count ?? 0} of 10 scores used`}
          usageCount={profile?.daily_attempt_count ?? 0}
          usageLimit={10}
        />
        <main className="flex-1 overflow-y-auto px-5 py-7 md:px-10 md:py-8 lg:px-11">
          <DashboardScreen model={model} />
        </main>
      </div>
    </div>
  );
}
