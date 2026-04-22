'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreDisplay } from '@/components/ui/score-display';
import { ArrowLeft, Mic, Type, Calendar, Tag, RotateCcw, Home } from 'lucide-react';

export default function AttemptReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.attemptId;
    fetch(`/api/toefl/attempts/${id}`)
      .then(r => r.json())
      .then(data => { setAttempt(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.attemptId]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div 
        className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
      />
    </div>
  );

  if (!attempt || attempt.error) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p style={{ color: 'var(--color-text-muted)' }}>Attempt not found</p>
      <Button 
        className="mt-4"
        onClick={() => router.push('/toefl/history')}
      >
        Back to History
      </Button>
    </div>
  );

  const task = attempt.toefl_tasks;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: '12px' }}>
        <button
          onClick={() => router.push('/toefl/history')}
          className="touch-target p-2 rounded-lg"
          style={{ 
            color: 'var(--color-primary)',
            background: 'rgba(79, 70, 229, 0.1)',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 
          className="text-xl font-semibold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Attempt Review
        </h1>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: '12px' }}>
        <div 
          className="flex items-center gap-1 text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Calendar size={14} />
          {formatDate(attempt.created_at)}
        </div>
        <span 
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            background: attempt.mode === 'simulation' 
              ? 'rgba(249, 115, 22, 0.1)' 
              : 'rgba(79, 70, 229, 0.1)',
            color: attempt.mode === 'simulation' 
              ? 'var(--color-accent)' 
              : 'var(--color-primary)',
          }}
        >
          {attempt.mode === 'simulation' ? 'Simulation' : 'Guided'}
        </span>
      </div>

      {/* Task Info */}
      {task && (
        <Card padding="md">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-medium">Task Info</span>
          </div>
          <div className="flex gap-2 mb-2">
            <span 
              className="px-2 py-1 rounded-md text-xs"
              style={{ 
                background: 'var(--color-bg-overlay)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {task.category === 'listen_repeat' ? 'Listen & Repeat' : 'Interview'}
            </span>
            <span 
              className="px-2 py-1 rounded-md text-xs"
              style={{ 
                background: 'var(--color-bg-overlay)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {task.difficulty}
            </span>
          </div>
          {task.transcript && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Prompt:</strong> {task.transcript}
            </p>
          )}
        </Card>
      )}

      {/* Score */}
      <Card padding="lg" className="text-center">
        <ScoreDisplay score={attempt.overall_score} size="lg" />
        <div className="flex justify-around mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          {[
            { label: 'Delivery', score: attempt.delivery_score },
            { label: 'Language', score: attempt.language_use_score },
            { label: 'Topic Dev', score: attempt.topic_dev_score },
          ].map(d => (
            <div key={d.label} className="text-center">
              <div 
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {Number(d.score).toFixed(1)}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {d.label}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {attempt.wpm != null && (
          <Card padding="md" className="text-center" gap={false}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Type size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>WPM</span>
            </div>
            <div 
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}
            >
              {Math.round(attempt.wpm)}
            </div>
          </Card>
        )}
        {attempt.filler_count != null && (
          <Card padding="md" className="text-center" gap={false}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Mic size={16} style={{ color: 'var(--color-accent)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Fillers</span>
            </div>
            <div 
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
            >
              {attempt.filler_count}
            </div>
          </Card>
        )}
      </div>

      {/* Transcript */}
      {attempt.transcript && (
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <Type size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-medium">Your Transcript</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {attempt.transcript}
          </p>
        </Card>
      )}

      {/* Audio */}
      {attempt.audio_url && (
        <Card padding="md">
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Your Recording
          </p>
          <audio src={attempt.audio_url} controls className="w-full" />
        </Card>
      )}

      {/* Suggestion */}
      {attempt.suggestion && (
        <Card padding="md">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
            {attempt.suggestion}
          </p>
        </Card>
      )}

      {/* Errors */}
      {attempt.errors?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {attempt.errors.map((e: string) => (
            <span 
              key={e}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#D97706',
              }}
            >
              {e}
            </span>
          ))}
        </div>
      )}

      {/* Scoring Details */}
      {attempt.scoring_details && (
        <Card padding="lg">
          <h2 
            className="text-lg font-semibold mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Detailed Feedback
          </h2>
          {[
            { key: 'delivery', label: 'Delivery' },
            { key: 'languageUse', label: 'Language Use' },
            { key: 'topicDev', label: 'Topic Development' },
          ].map(dim => {
            const detail = attempt.scoring_details[dim.key];
            if (!detail) return null;
            const score = detail.score ?? 0;
            const pct = (score / 4) * 100;
            const color = score >= 3.5 ? 'var(--color-score-excellent)' : score >= 2.5 ? 'var(--color-score-good)' : 'var(--color-score-needs-work)';
            
            return (
              <div key={dim.key} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">{dim.label}</span>
                  <span className="font-bold text-sm" style={{ color }}>{score}</span>
                </div>
                <div 
                  className="h-1.5 rounded-full overflow-hidden mb-2"
                  style={{ background: 'var(--color-bg-overlay)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-600"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                {detail.evidence && (
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    <strong>Evidence:</strong> {detail.evidence}
                  </p>
                )}
                {detail.tip && (
                  <p className="text-sm italic" style={{ color: 'var(--color-primary)' }}>
                    {detail.tip}
                  </p>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
        <Button 
          variant="secondary" 
          className="flex-1"
          onClick={() => router.push('/toefl/practice')}
          icon={<RotateCcw size={18} />}
        >
          Practice Again
        </Button>
        <Button 
          className="flex-1"
          onClick={() => router.push('/toefl')}
          icon={<Home size={18} />}
        >
          Dashboard
        </Button>
      </div>
    </div>
  );
}