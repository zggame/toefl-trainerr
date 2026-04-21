'use client';

import { useSession } from '../providers';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Home, Mic, History, User } from 'lucide-react';
import Link from 'next/link';

const tabs = [
  { href: '/toefl', label: 'Home', icon: Home },
  { href: '/toefl/practice', label: 'Practice', icon: Mic },
  { href: '/toefl/history', label: 'History', icon: History },
  { href: '/toefl/profile', label: 'Profile', icon: User },
];

export default function ToeflLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/signin');
    }
  }, [session, loading, router]);

  if (loading || !session) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, padding: '24px 16px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderTop: '3px solid rgba(79,70,229,0.12)',
        padding: '8px 0',
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        {tabs.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-baloo)',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'color 200ms',
            }}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}