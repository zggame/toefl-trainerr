'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ClipboardList, History, Home, MessageCircle, Mic, User } from 'lucide-react';

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
    <aside className="hidden w-[264px] shrink-0 border-r border-slate-100 bg-white px-6 py-8 md:block">
      <div className="sticky top-8 flex flex-col gap-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4b3ff1] text-white shadow-[0_10px_24px_rgba(75,63,241,0.26)]">
            <MessageCircle size={19} strokeWidth={2.6} />
          </div>
          <div>
            <div className="text-xl font-bold leading-tight tracking-tight text-[#111936]" style={{ fontFamily: 'var(--font-heading)' }}>
              TOEFL Trainer
            </div>
            <div className="text-sm font-medium text-[#5c6179]">
              Speaking practice
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/toefl' && pathname?.startsWith(item.path));
            const Icon = item.path === '/toefl/practice' ? ClipboardList : item.icon;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => router.push(item.path)}
                className="group flex items-center gap-4 rounded-xl px-3 py-3 text-left text-base font-semibold transition-all duration-200"
                style={{ background: isActive ? '#f0eeff' : 'transparent', color: isActive ? '#372ee5' : '#151b36' }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                  style={{ background: isActive ? '#5146ee' : 'transparent', color: isActive ? 'white' : '#6d7288' }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.6 : 2.1} />
                </span>
                <span style={{ fontFamily: 'var(--font-heading)' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-4">
            <div
              className="grid h-16 w-16 place-items-center rounded-full text-sm font-bold text-[#111936]"
              style={{ background: `conic-gradient(#5146ee ${usagePercent}%, #ebeaf2 0)` }}
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white">
                {usageCount}/{usageLimit}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#111936]">{usageText}</div>
              <p className="mt-1 text-xs leading-snug text-[#6d7288]">
                More scores refresh tomorrow
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
