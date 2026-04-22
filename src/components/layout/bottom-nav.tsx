'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Mic, History, User } from 'lucide-react';

const navItems = [
  { path: '/toefl', icon: Home, label: 'Home' },
  { path: '/toefl/practice', icon: Mic, label: 'Practice', isCenter: true },
  { path: '/toefl/history', icon: History, label: 'History' },
  { path: '/toefl/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNav = (path: string) => {
    router.push(path);
  };

  return (
    <nav
      className="z-50 safe-area-bottom w-full"
      style={{
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center justify-around h-20 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className="touch-target flex flex-col items-center justify-center -mt-6 active:scale-95"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  boxShadow: 'var(--shadow-fab)',
                  transform: 'translateY(-8px)',
                  transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms ease',
                }}
                aria-label={item.label}
              >
                <Icon
                  size={28}
                  color="white"
                  strokeWidth={2}
                />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className="touch-target flex flex-col items-center justify-center gap-1 px-3 active:scale-95"
              style={{
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                transition: 'color 150ms ease, transform 100ms ease',
              }}
              aria-label={item.label}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className="text-xs font-medium"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                }}
              >
                {item.label}
              </span>
              {isActive && (
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: 'var(--color-primary)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}