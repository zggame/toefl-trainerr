'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { DesktopSidebar } from '@/components/layout/desktop-sidebar';

type ToeflProfile = {
  daily_attempt_count?: number | null;
} | null;

export function ToeflShell({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ToeflProfile>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/toefl/profile')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const usageCount = profile?.daily_attempt_count ?? 0;

  return (
    <div className="toefl-bright-scope">
      <div className="min-h-screen bg-[#f3f0ea] md:p-2">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] items-start overflow-hidden bg-white shadow-[0_20px_70px_rgba(15,23,42,0.10)] md:min-h-[calc(100vh-16px)] md:rounded-2xl">
          <DesktopSidebar
            usageText={`${usageCount} of 10 scores used`}
            usageCount={usageCount}
            usageLimit={10}
          />
          <div className="min-w-0 flex-1">
            <AppLayout>{children}</AppLayout>
          </div>
        </div>
      </div>
    </div>
  );
}
