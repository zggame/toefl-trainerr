import { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <main className="flex-1 px-4 pt-4 w-full overscroll-contain pb-4 animate-slide-up">
        {children}
      </main>

      <div className="sticky bottom-0 z-50 safe-area-bottom">
        <BottomNav />
      </div>
    </div>
  );
}
