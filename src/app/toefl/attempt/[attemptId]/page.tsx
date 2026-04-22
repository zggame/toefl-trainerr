'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw, ChevronDown, ChevronUp, Clock, Mic, Type, Calendar, Tag } from 'lucide-react';

export default function AttemptReviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTaskInfo, setShowTaskInfo] = useState(false);

  useEffect(() => {
    const id = params.attemptId;
    fetch(`/api/toefl/attempts/${id}`)
      .then(r => r.json())
      .then(data => { setAttempt(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.attemptId]);

  if (loading) return (
    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>
      Loading...
    </p>
  );

  if (!attempt || attempt.error) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Attempt not found</p>
      <button onClick={() => router.push('/toefl/history')} style={{
        marginTop: '12px', background: 'var(--color-primary)', color: 'white', border: 'none',
        borderRadius: 'var(--radius-pill)', padding: '10px 20px',
        fontFamily: 'var(--font-baloo)', cursor: 'pointer',
      }}>Back to History</button>
    </div>
  );

  const retryMode = searchParams.get('retry');
  const task = attempt.toefl_tasks;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      <button
        onClick={() => router.push('/toefl/history')}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-baloo)', color: 'var(--color-primary)',
          marginBottom: '16px', padding: '0',
        }}
      >
        <ArrowLeft size={18} /> Back to History
      </button>

      <h1 style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
        Attempt Review
      </h1>

      {/* Date + Mode */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '16px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-comic)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          <Calendar size={14} />
          {formatDate(attempt.created_at)}
        </div>
        <span style={{
          background: attempt.mode === 'simulation' ? 'rgba(236,72,153,0.12)' : 'rgba(79,70,229,0.12)',
          color: attempt.mode === 'simulation' ? '#DB2777' : 'var(--color-primary)',
          borderRadius: 'var(--radius-pill)', padding: '2px 10px',
          fontSize: '12px', fontFamily: 'var(--font-baloo)', fontWeight: 600,
        }}>
          {attempt.mode === 'simulation' ? 'Simulation' : 'Guided'}
        </span>
      </div>

      {/* Task Info - Collapsible */}
      {task && (
        <div style={{
          background: 'white', borderRadius: '16px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          marginBottom: '16px', overflow: 'hidden',
        }}>
          <button
            onClick={() => setShowTaskInfo(!showTaskInfo)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-baloo)', fontWeight: 600, color: 'var(--color-text)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} color='var(--color-primary)' />
              Task Info
            </span>
            {showTaskInfo ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showTaskInfo && (
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'var(--color-background)', borderRadius: '8px', padding: '4px 10px',
                  fontSize: '12px', fontFamily: 'var(--font-comic)', color: 'var(--color-text)',
                }}>
                  {task.category === 'listen_repeat' ? 'Listen & Repeat' : 'Interview'}
                </span>
                <span style={{
                  background: 'var(--color-background)', borderRadius: '8px', padding: '4px 10px',
                  fontSize: '12px', fontFamily: 'var(--font-comic)', color: 'var(--color-text)',
                }}>
                  Difficulty: {task.difficulty}
                </span>
              </div>
              {task.transcript && (
                <p style={{ fontFamily: 'var(--font-comic)', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--color-text)' }}>Prompt:</strong> {task.transcript}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Score Card */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '20px',
        border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-md)',
        marginBottom: '16px',
      }}>
        <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '48px', fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center' }}>
          {Number(attempt.overall_score).toFixed(1)}
          <span style={{ fontSize: '20px', color: 'var(--color-text-muted)' }}> / 4</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px' }}>
          {[
            { label: 'Delivery', score: attempt.delivery_score },
            { label: 'Language', score: attempt.language_use_score },
            { label: 'Topic Dev', score: attempt.topic_dev_score },
          ].map(d => (
            <div key={d.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '20px', fontWeight: 700 }}>{Number(d.score).toFixed(1)}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats: WPM + Filler Count */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '16px',
      }}>
        {attempt.wpm != null && (
          <div style={{
            flex: 1, background: 'white', borderRadius: '12px', padding: '14px',
            border: '3px solid rgba(79,70,229,0.1)', boxShadow: 'var(--shadow-clay-sm)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <Type size={16} color='var(--color-primary)' />
              <span style={{ fontFamily: 'var(--font-comic)', fontSize: '12px', color: 'var(--color-text-muted)' }}>WPM</span>
            </div>
            <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>
              {Math.round(attempt.wpm)}
            </div>
          </div>
        )}
        {attempt.filler_count != null && (
          <div style={{
            flex: 1, background: 'white', borderRadius: '12px', padding: '14px',
            border: '3px solid rgba(245,158,11,0.15)', boxShadow: 'var(--shadow-clay-sm)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <Mic size={16} color='#D97706' />
              <span style={{ fontFamily: 'var(--font-comic)', fontSize: '12px', color: 'var(--color-text-muted)' }}>Fillers</span>
            </div>
            <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, color: '#D97706' }}>
              {attempt.filler_count}
            </div>
          </div>
        )}
      </div>

      {/* Transcript - Collapsible */}
      {attempt.transcript && (
        <div style={{
          background: 'white', borderRadius: '16px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          marginBottom: '16px', overflow: 'hidden',
        }}>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-baloo)', fontWeight: 600, color: 'var(--color-text)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Type size={16} color='var(--color-primary)' />
              Transcript
            </span>
            {showTranscript ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showTranscript && (
            <div style={{ padding: '0 16px 16px' }}>
              <p style={{ fontFamily: 'var(--font-comic)', fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.6 }}>
                {attempt.transcript}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Audio Player */}
      {attempt.audio_url && (
        <div style={{
          background: 'white', borderRadius: '16px', padding: '16px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          marginBottom: '16px',
        }}>
          <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '8px' }}>
            Your recording
          </p>
          <audio src={attempt.audio_url} controls style={{ width: '100%' }} />
        </div>
      )}

      {/* Suggestion */}
      {attempt.suggestion && (
        <div style={{
          background: 'white', borderRadius: '16px', padding: '16px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          marginBottom: '16px',
        }}>
          <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text)', fontSize: '14px' }}>
            {attempt.suggestion}
          </p>
        </div>
      )}

      {/* Errors */}
      {attempt.errors?.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {attempt.errors.map((e: string) => (
            <span key={e} style={{
              background: 'rgba(245,158,11,0.15)', color: '#D97706',
              border: '2px solid rgba(245,158,11,0.3)',
              borderRadius: 'var(--radius-pill)', padding: '4px 12px',
              fontSize: '12px', fontFamily: 'var(--font-baloo)',
            }}>{e}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => router.push('/toefl/practice')}
          style={{
            background: 'var(--color-primary)', color: 'white', border: 'none',
            borderRadius: 'var(--radius-pill)', padding: '14px',
            fontFamily: 'var(--font-baloo)', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
            boxShadow: 'var(--shadow-clay-sm)',
          }}
        >
          <RotateCcw size={18} /> Try Another Task
        </button>
        <button
          onClick={() => router.push('/toefl')}
          style={{
            background: 'white', color: 'var(--color-primary)', border: '3px solid var(--color-primary)',
            borderRadius: 'var(--radius-pill)', padding: '14px',
            fontFamily: 'var(--font-baloo)', fontWeight: 600, cursor: 'pointer',
          }}
        >Back to Home</button>
      </div>
    </div>
  );
}