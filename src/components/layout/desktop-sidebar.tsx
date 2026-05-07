'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Mic, History, User, MessageCircle } from 'lucide-react';

const navItems = [
  { path: '/toefl', icon: Home, label: 'Home' },
  { path: '/toefl/practice', icon: Mic, label: 'Practice' },
  { path: '/toefl/history', icon: History, label: 'History' },
  { path: '/toefl/profile', icon: User, label: 'Profile' },
];

interface DesktopSidebarProps {
  usageText?: string;
  usageCount?: number;
  usageLimit?: number;
}

export function DesktopSidebar({
  usageText = '2 of 10 scores used',
  usageCount = 2,
  usageLimit = 10,
}: DesktopSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const usagePercent = usageLimit > 0 ? Math.min((usageCount / usageLimit) * 100, 100) : 0;

  return (
    <aside className="hidden md:flex md:w-[232px] md:shrink-0 md:flex-col md:gap-8 md:border-r md:border-[var(--color-border)] md:bg-white md:px-5 md:py-8">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-[var(--shadow-button)]">
          <MessageCircle size={20} strokeWidth={2.4} />
        </div>
        <div>
          <div className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            TOEFL Trainer
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Speaking practice
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/toefl' && pathname?.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => router.push(item.path)}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200"
              style={{
                background: isActive ? 'rgba(79, 70, 22, 0.04)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                style={{
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? 'white' : 'inherit',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
              </div>
              <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
                {item.label}
              </span>
              {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-2xl bg-[var(--color-bg-elevated)] p-4 border border-[var(--color-border)]">
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>
                Usage Today
              </div>
              <div className="mt-1 text-sm font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                {usageText}
              </div>
            </div>
            
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-overlay)]">
              <div 
                className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500" 
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            
            <div className="text-[10px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Daily scores refresh at midnight local time.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
