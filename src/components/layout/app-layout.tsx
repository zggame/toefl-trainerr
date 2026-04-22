import { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-24 px-4 pt-4 max-w-lg mx-auto w-full overscroll-contain">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
