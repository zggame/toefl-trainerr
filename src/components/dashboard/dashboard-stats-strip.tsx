import { Card } from '@/components/ui/card';
import { CalendarDays, Flame, Star, TrendingUp } from 'lucide-react';

type DashboardStat = { label: string; value: string };

export function DashboardStatsStrip({ stats }: { stats: DashboardStat[] }) {
  if (!stats.length) return null;

  const icons = [TrendingUp, Star, Flame, CalendarDays];
  const colors = ['#5146ee', '#58ae38', '#f05a1a', '#2870e0'];

  return (
    <Card padding="none" gap={false} className="grid grid-cols-2 md:grid-cols-4" style={{ background: '#ffffff', border: 'none' }}>
      {stats.map((stat, index) => {
        const Icon = icons[index] ?? TrendingUp;
        return (
        <div key={stat.label} data-testid="dashboard-stat" className="flex min-h-[112px] flex-col items-center justify-center border-r px-3 text-center last:border-r-0" style={{ borderColor: 'var(--color-border)' }}>
          <Icon size={24} style={{ color: colors[index] }} />
          <div className="mt-3 text-sm leading-tight text-[#5c6179]">
            {stat.label}
          </div>
          <div className="mt-2 text-2xl font-bold text-[#111936]" style={{ fontFamily: 'var(--font-heading)' }}>
            {stat.value}
          </div>
        </div>
        );
      })}
    </Card>
  );
}
