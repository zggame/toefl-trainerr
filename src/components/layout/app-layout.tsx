import { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative w-full">
      <main className="mx-auto w-full flex-1 px-4 pt-8 overscroll-contain pb-28 animate-slide-up md:max-w-[1240px] md:px-10 md:py-8 lg:px-11">
        {children}
      </main>

      <div className="sticky bottom-0 z-50 safe-area-bottom md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
