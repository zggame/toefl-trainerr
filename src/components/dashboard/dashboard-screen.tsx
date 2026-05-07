'use client';

import { Bell, ChevronDown } from 'lucide-react';
import { DashboardHero } from './dashboard-hero';
import { DashboardInsightCard } from './dashboard-insight-card';
import { DashboardRecentAttempts } from './dashboard-recent-attempts';
import { DashboardStatsStrip } from './dashboard-stats-strip';
import { DashboardSimulationCard } from './dashboard-simulation-card';
import type { buildDashboardViewModel } from '@/lib/dashboard';

type DashboardScreenProps = {
  model: ReturnType<typeof buildDashboardViewModel>;
};

export function DashboardScreen({ model }: DashboardScreenProps) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111936]" style={{ fontFamily: 'var(--font-heading)' }}>
            Good to see you <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 text-lg font-medium text-[#5c6179]">
            One focused round is enough for today.
          </p>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <button className="grid h-[58px] w-[58px] place-items-center rounded-full border border-slate-200 bg-white text-[#5c6179] shadow-[0_8px_22px_rgba(15,23,42,0.08)]" aria-label="Notifications">
            <Bell size={24} />
          </button>
          <button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-2 pr-4 shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#f6c29f] to-[#8f4c32] text-sm font-bold text-white">
              L
            </div>
            <span className="text-base font-semibold text-[#111936]">Lena</span>
            <ChevronDown size={18} className="text-[#6d7288]" />
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(420px,1fr)]">
        <div>
          <DashboardHero {...model.hero} />
        </div>
        <div className="flex flex-col gap-6">
          <DashboardInsightCard {...model.insight} />
          <DashboardStatsStrip stats={model.stats} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(420px,1fr)]">
        <div>
          <DashboardRecentAttempts attempts={model.recentAttempts} />
        </div>
        <div className="h-full">
          <DashboardSimulationCard {...model.simulation} />
        </div>
      </section>
    </div>
  );
}
