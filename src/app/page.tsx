import { useRouter } from 'next/navigation';
import { Mic, BarChart3, Target, Repeat } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Timed Practice',
    description: 'Simulate real TOEFL speaking tasks with countdown timers and test-day pressure.',
  },
  {
    icon: BarChart3,
    title: 'AI Scoring',
    description: 'Get instant feedback on delivery, language use, and topic development.',
  },
  {
    icon: Target,
    title: 'Targeted Retry',
    description: 'Focus on your weakest areas — re-record just the intro, a claim, or a single sentence.',
  },
  {
    icon: Repeat,
    title: 'Track Progress',
    description: 'See your score trend over time, identify recurring errors, and celebrate improvement.',
  },
];

export default function HomePage() {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--font-comic)' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky',
        top: '16px',
        left: '16px',
        right: '16px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        padding: '12px 24px',
        border: '3px solid rgba(79,70,229,0.12)',
        boxShadow: 'var(--shadow-clay-md)',
      }}>
        <span style={{ fontFamily: 'var(--font-baloo)', fontWeight: 700, fontSize: '20px', color: 'var(--color-primary)' }}>
          TOEFL Trainer
        </span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/toefl')}
            style={{
              background: 'var(--color-background)',
              color: 'var(--color-primary)',
              border: '3px solid var(--color-primary)',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 20px',
              fontWeight: 600,
              fontFamily: 'var(--font-baloo)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}>Log in</button>
          <button
            onClick={() => router.push('/toefl')}
            style={{
              background: 'var(--color-cta)',
              color: 'white',
              border: '3px solid transparent',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 20px',
              fontWeight: 600,
              fontFamily: 'var(--font-baloo)',
              cursor: 'pointer',
              boxShadow: '0 4px 0 var(--color-cta-dark), 0 4px 12px rgba(34,197,94,0.3)',
              transition: 'all 200ms ease-out',
            }}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '80px 24px 60px',
        textAlign: 'center',
        maxWidth: '720px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'var(--color-primary)',
          color: 'white',
          borderRadius: 'var(--radius-pill)',
          padding: '6px 16px',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '20px',
          fontFamily: 'var(--font-baloo)',
        }}>
          For college & high school students
        </div>
        <h1 style={{
          fontFamily: 'var(--font-baloo)',
          fontSize: 'clamp(36px, 6vw, 56px)',
          fontWeight: 700,
          color: 'var(--color-text)',
          lineHeight: 1.1,
          marginBottom: '20px',
        }}>
          Speak. Score. Improve.
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Practice TOEFL speaking tasks with AI-powered scoring, targeted feedback,
          and a retry loop that actually helps you improve — not just get a number.
        </p>
        <button
          onClick={() => router.push('/toefl')}
          style={{
            background: 'var(--color-cta)',
            color: 'white',
            border: '3px solid transparent',
            borderRadius: 'var(--radius-pill)',
            padding: '16px 40px',
            fontSize: '18px',
            fontWeight: 700,
            fontFamily: 'var(--font-baloo)',
            cursor: 'pointer',
            boxShadow: '0 6px 0 var(--color-cta-dark), 0 8px 20px rgba(34,197,94,0.4)',
            transition: 'all 200ms ease-out',
          }}>Start Practicing — Free</button>
      </section>

      {/* Feature Cards */}
      <section style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '0 24px 80px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
      }}>
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            onClick={() => router.push('/toefl')}
            style={{
              background: 'var(--color-background)',
              borderRadius: 'var(--radius-clay)',
              padding: '28px 24px',
              border: '3px solid rgba(79,70,229,0.15)',
              boxShadow: 'var(--shadow-clay-md)',
              transition: 'all 200ms ease-out',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: 'var(--color-primary)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: 'var(--shadow-clay-sm)',
            }}>
              <Icon size={24} color='white' />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-baloo)',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text)',
              marginBottom: '8px',
            }}>{title}</h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}>{description}</p>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'var(--color-primary)',
        padding: '60px 24px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-baloo)',
          fontSize: '32px',
          fontWeight: 700,
          color: 'white',
          marginBottom: '16px',
        }}>Ready to improve your speaking score?</h2>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '28px',
        }}>Join thousands of students practicing with AI feedback every day.</p>
        <button
          onClick={() => router.push('/toefl')}
          style={{
            background: 'white',
            color: 'var(--color-primary)',
            border: '3px solid transparent',
            borderRadius: 'var(--radius-pill)',
            padding: '14px 36px',
            fontSize: '16px',
            fontWeight: 700,
            fontFamily: 'var(--font-baloo)',
            cursor: 'pointer',
            boxShadow: '0 6px 0 rgba(0,0,0,0.15)',
            transition: 'all 200ms ease-out',
          }}>Start Free Practice</button>
      </section>
    </div>
  );
}