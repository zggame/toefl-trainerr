'use client';

import { useRouter } from 'next/navigation';
import { ClipboardList, Clock, Play, Timer } from 'lucide-react';

type DashboardSimulationCardProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  chips: string[];
};

export function DashboardSimulationCard({
  title,
  description,
  href,
  ctaLabel,
  chips,
}: DashboardSimulationCardProps) {
  const router = useRouter();
  const chipIcons = [Clock, Timer, ClipboardList];

  return (
    <section className="relative flex h-full min-h-[288px] overflow-hidden rounded-[22px] border border-[#f0dec1] bg-gradient-to-br from-[#fff1d9] to-[#fffaf0] p-8 shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
      <div className="relative z-10 flex flex-1 gap-7">
        <div className="hidden h-24 w-24 shrink-0 place-items-center rounded-full border border-[#f7b24d]/30 bg-[#fff7eb] text-[#f05a1a] md:grid">
          <Timer size={48} strokeWidth={2.4} />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#111936]" style={{ fontFamily: 'var(--font-heading)' }}>
            {title}
          </h2>
          <p className="mt-2 text-base text-[#5c6179]">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip, index) => {
              const Icon = chipIcons[index] ?? Clock;
              return (
                <span key={chip} className="flex items-center gap-1.5 rounded-full border border-[#ead7b5] bg-white/60 px-3 py-1 text-sm text-[#4d5368]">
                  <Icon size={14} />
                  {chip}
                </span>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => router.push(href)}
            className="mt-5 flex items-center gap-2 rounded-xl bg-[#f05a1a] px-7 py-3 text-base font-bold text-white shadow-[0_12px_24px_rgba(240,90,26,0.26)] transition-transform active:scale-95"
          >
            <Play size={16} fill="currentColor" />
            {ctaLabel}
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute -left-16 -top-10 h-40 w-52 rounded-full bg-white/40" />
    </section>
  );
}
