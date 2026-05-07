'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Clock, Play, Sparkles } from 'lucide-react';

type SecondaryCta = { label: string; href: string };

type DashboardHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  href: string;
  ctaLabel: string;
  secondaryCta?: SecondaryCta;
};

export function DashboardHero(props: DashboardHeroProps) {
  const router = useRouter();

  return (
    <Card
      padding="lg"
      gap={false}
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fff9e8 0%, #fff2ce 54%, #fff8e8 100%)',
        color: '#111936',
        border: '1px solid rgba(233, 206, 151, 0.70)',
        borderRadius: '22px',
        minHeight: '438px',
      }}
    >
      <div className="relative z-10 flex min-h-[390px] flex-col justify-between gap-8 md:max-w-[560px]">
        <div className="flex flex-col gap-5">
          <p className="text-base font-bold text-[#f05a1a]">{props.eyebrow}</p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl" style={{ fontFamily: 'var(--font-heading)' }}>
                {props.title}
              </h2>
              <p className="mt-5 max-w-[390px] text-lg leading-relaxed text-[#4d5368]">
                {props.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push(props.href)} 
              className="flex items-center justify-center gap-3 whitespace-nowrap rounded-xl bg-[#5146ee] px-7 py-4 text-base font-bold text-white shadow-[0_12px_26px_rgba(75,63,241,0.28)] transition-transform active:scale-95"
            >
              <Play size={17} fill="currentColor" />
              {props.ctaLabel}
            </button>
            {props.secondaryCta ? (
              <button
                type="button"
                onClick={() => router.push(props.secondaryCta!.href)}
                className="flex items-center justify-center gap-3 whitespace-nowrap rounded-xl border border-slate-200 bg-white/80 px-7 py-4 text-base font-semibold text-[#111936] shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition-transform active:scale-95"
              >
                <Clock size={18} />
                {props.secondaryCta.label}
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            {[props.meta, 'AI scoring', 'TOEFL-style prompt'].map((label) => (
              <div key={label} className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-[#ead7b5] bg-white/55 px-4 py-3 text-base font-medium text-[#111936]">
                <Sparkles size={17} className="text-[#f05a1a]" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[42%] md:block">
        <div className="absolute right-[-42px] top-[-38px] h-[360px] w-[360px] rounded-full bg-white/45" />
        <div className="absolute right-[92px] top-[112px] h-20 w-28 rounded-[28px] bg-[#73a9ff] shadow-[0_14px_30px_rgba(70,127,220,0.22)]" />
        <div className="absolute right-[52px] top-[212px] h-16 w-20 rounded-[26px] bg-[#f7b24d] shadow-[0_14px_30px_rgba(247,178,77,0.22)]" />
        <svg className="absolute right-[28px] top-[145px]" width="220" height="150" viewBox="0 0 220 150" fill="none">
          <path d="M18 88C36 116 54 44 76 88C101 138 106 4 128 60C153 124 155 24 178 66C192 91 204 88 216 68" stroke="#f59f32" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
    </Card>
  );
}
