'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Brain, TrendingUp, Smartphone, ChevronRight, Star, Users, Award } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: Mic,
      title: '65+ Practice Tasks',
      description: 'Listen & repeat and interview questions covering all TOEFL speaking topics',
    },
    {
      icon: Brain,
      title: 'AI-Powered Feedback',
      description: 'Get instant scoring on delivery, language use, and topic development',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'See your improvement over time with detailed analytics',
    },
    {
      icon: Smartphone,
      title: 'Practice Anywhere',
      description: 'Mobile-friendly design for practice on the go',
    },
  ];

  const steps = [
    { number: '1', title: 'Listen', description: 'Hear the TOEFL-style prompt' },
    { number: '2', title: 'Speak', description: 'Record your response' },
    { number: '3', title: 'Improve', description: 'Get AI feedback instantly' },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 overflow-hidden">
        {/* Background decoration */}
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
          style={{ 
            background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15"
          style={{ 
            background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />

        <div className="relative max-w-lg mx-auto text-center">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ 
              background: 'rgba(79, 70, 229, 0.1)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
            }}
          >
            <Star size={16} style={{ color: 'var(--color-accent)' }} />
            <span 
              className="text-sm font-medium"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
            >
              Free TOEFL Speaking Practice
            </span>
          </div>

          {/* Headline */}
          <h1 
            className="text-4xl font-bold mb-4 leading-tight"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text-primary)',
            }}
          >
            Speak Confidently.
            <br />
            <span style={{ color: 'var(--color-primary)' }}>Score Higher.</span>
          </h1>

          {/* Subheadline */}
          <p 
            className="text-lg mb-8 max-w-md mx-auto"
            style={{ 
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            Practice TOEFL speaking tasks with AI-powered feedback. 
            Improve your delivery, language use, and topic development.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => router.push('/auth/signin')}
              icon={<Mic size={20} />}
            >
              Start Practicing
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => router.push('/toefl')}
            >
              Try Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Users size={18} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                1,000+ students
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={18} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                AI-Powered Scoring
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16" style={{ background: 'var(--color-bg-elevated)' }}>
        <div className="max-w-lg mx-auto">
          <h2 
            className="text-2xl font-bold text-center mb-10"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            How It Works
          </h2>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start gap-4">
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                  style={{ 
                    background: 'var(--color-primary)',
                    color: 'white',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {step.number}
                </div>
                <div className="flex-1 pt-1">
                  <h3 
                    className="text-lg font-semibold mb-1"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden sm:block pt-3">
                    <ChevronRight size={20} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16">
        <div className="max-w-lg mx-auto">
          <h2 
            className="text-2xl font-bold text-center mb-10"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Everything You Need
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} padding="lg" hover>
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: 'rgba(79, 70, 229, 0.1)' }}
                  >
                    <Icon size={20} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h3 
                    className="font-semibold mb-1"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16" style={{ background: 'var(--color-bg-elevated)' }}>
        <div className="max-w-lg mx-auto text-center">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Ready to Improve Your Speaking Score?
          </h2>
          <p 
            className="mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Join thousands of students who have improved their TOEFL speaking scores with AI-powered practice.
          </p>
          <Button 
            size="lg" 
            onClick={() => router.push('/auth/signin')}
            icon={<Mic size={20} />}
          >
            Start Practicing Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 text-center">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          TOEFL Speaking Trainer — Practice makes perfect
        </p>
      </footer>
    </div>
  );
}
