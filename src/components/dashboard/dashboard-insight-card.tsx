import { Card } from '@/components/ui/card';
import { ChevronRight, Sparkles } from 'lucide-react';

type DashboardInsightCardProps = {
  title: string;
  skillLabel: string;
  description: string;
  metricLabel: string;
  metricValue: string;
};

export function DashboardInsightCard({
  title,
  skillLabel,
  description,
  metricLabel,
  metricValue,
}: DashboardInsightCardProps) {
  return (
    <Card padding="lg" gap={false} className="h-full" style={{ background: '#ffffff', border: 'none' }}>
      <div className="flex h-full min-h-[352px] flex-col gap-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-bold text-[#009b7a]">{title}</p>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c9f4e9] text-[#009b7a]">
            <Sparkles size={22} />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold tracking-tight text-[#111936]" style={{ fontFamily: 'var(--font-heading)' }}>
            {skillLabel}
          </h3>
          <p className="mt-5 text-lg leading-relaxed text-[#313851]">
            {description}
          </p>
        </div>
        {metricLabel && metricValue ? (
          <div className="mt-auto">
            <div className="text-lg text-[#111936]">
              {metricLabel}: <span className="font-bold">{metricValue}</span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e5e6ee]">
              <div className="h-full w-[60%] rounded-full bg-[#00a884]" />
            </div>
            <div className="mt-3 flex justify-between text-sm text-[#5c6179]">
              <span>0</span>
              <span>4</span>
            </div>
            <button className="mt-8 flex items-center gap-2 text-lg font-semibold text-[#342ce3]">
              Practice this skill
              <ChevronRight size={20} />
            </button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
