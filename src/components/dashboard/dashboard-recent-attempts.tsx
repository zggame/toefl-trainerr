'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ChevronRight, Flag, Mic, UserRound, Volume2 } from 'lucide-react';
import type { DashboardAttempt } from '@/lib/dashboard';

function categoryLabel(attempt: DashboardAttempt) {
  if (attempt.mode === 'simulation') return 'Simulation';
  return attempt.category === 'listen_repeat' ? 'Listen & Repeat' : 'Interview';
}

function topicLabel(attempt: DashboardAttempt) {
  if (attempt.mode === 'simulation') return 'Full Practice';
  if (attempt.topic_domain) return attempt.topic_domain.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  return attempt.category === 'listen_repeat' ? 'Academic Lecture' : 'Campus Life';
}

function dateLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const ageDays = Math.floor((today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (ageDays === 0) return 'Today';
  if (ageDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DashboardRecentAttempts({ attempts }: { attempts: DashboardAttempt[] }) {
  const router = useRouter();

  if (!attempts.length) return null;

  return (
    <Card padding="lg" gap={false} style={{ background: '#ffffff', border: 'none', borderRadius: '22px' }}>
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-[#111936]" style={{ fontFamily: 'var(--font-heading)' }}>
          Recent practice
        </h2>
        <button onClick={() => router.push('/toefl/history')} className="flex items-center gap-2 text-base font-semibold text-[#342ce3]">
          View all history
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="hidden grid-cols-[1.2fr_1.1fr_0.7fr_0.7fr_32px] border-b border-slate-200 pb-3 text-sm font-medium text-[#5c6179] md:grid">
        <div className="pl-[72px]">Type</div>
        <div>Topic</div>
        <div>Score</div>
        <div>Date</div>
        <div />
      </div>
      <div>
        {attempts.map((attempt) => {
          const Icon = attempt.mode === 'simulation' ? Flag : attempt.category === 'listen_repeat' ? Volume2 : UserRound;
          return (
            <button
              key={attempt.id}
              onClick={() => router.push(`/toefl/attempt/${attempt.id}`)}
              className="grid w-full grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-100 py-4 text-left last:border-b-0 md:grid-cols-[1.2fr_1.1fr_0.7fr_0.7fr_32px]"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#ffe8d7] text-[#f05a1a]">
                  <Icon size={22} />
                </div>
                <span className="font-semibold text-[#111936]">{categoryLabel(attempt)}</span>
              </div>
              <div className="hidden text-[#111936] md:block">{topicLabel(attempt)}</div>
              <div className="justify-self-end rounded-full bg-[#d9f7ef] px-4 py-2 text-lg font-bold text-[#009b7a] md:justify-self-start">
                {attempt.overall_score.toFixed(1)}
              </div>
              <div className="hidden text-[#111936] md:block">{dateLabel(attempt.created_at)}</div>
              <ChevronRight size={22} className="hidden text-[#6d7288] md:block" />
            </button>
          );
        })}
      </div>
    </Card>
  );
}
