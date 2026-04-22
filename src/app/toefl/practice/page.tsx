'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AudioPlayer } from '@/components/audio-player';
import { RecordButton } from '@/components/record-button';
import { ScoreCard } from '@/components/score-card';
import { ScoringResult } from '@/lib/gemini';

type Task = {
  id: string;
  audio_url: string;
  transcript: string;
  category: string;
  difficulty: string;
  prep_time_seconds: number;
  record_time_seconds: number;
};

type Attempt = {
  id: string;
  overall_score: number;
};

export default function PracticePage() {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [showText, setShowText] = useState(false);
  const [prepCountdown, setPrepCountdown] = useState<number | null>(null);
  const [step, setStep] = useState<'loading' | 'prep' | 'record' | 'score'>('loading');
  const [result, setResult] = useState<{ attempt: Attempt; scoring: ScoringResult } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/toefl/tasks')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setTask(data);
        setStep('prep');
        setPrepCountdown(data.prep_time_seconds || 15);
      })
      .catch(() => setError('Failed to load task'));
  }, []);

  useEffect(() => {
    if (prepCountdown === null) return;
    if (prepCountdown > 0) {
      const timer = setTimeout(() => setPrepCountdown(p => (p ?? 0) - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setStep('record');
      setPrepCountdown(null);
    }
  }, [prepCountdown]);

  const handleRecordingComplete = async (audioBlob: Blob, base64: string) => {
    if (!task) return;
    setStep('score');

    const res = await fetch('/api/toefl/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64: base64,
        mimeType: 'audio/webm',
        taskId: task.id,
        taskCategory: task.category,
        taskTranscript: task.transcript,
        mode: 'guided',
      }),
    });

    if (!res.ok) {
      setError('Scoring failed. Please try again.');
      setStep('record');
      return;
    }

    const data = await res.json();
    setResult(data);
  };

  if (error) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <p style={{ color: '#EF4444', fontFamily: 'var(--font-comic)', marginBottom: '16px' }}>{error}</p>
      <button onClick={() => router.push('/toefl')} style={{
        background: 'var(--color-primary)', color: 'white', border: 'none',
        borderRadius: 'var(--radius-pill)', padding: '10px 20px',
        fontFamily: 'var(--font-baloo)', cursor: 'pointer',
      }}>Back to Home</button>
    </div>
  );

  if (!task && step === 'loading') return (
    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>
      Loading task...
    </p>
  );

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
        {task?.category === 'listen_repeat' ? 'Listen and Repeat' : 'Interview Question'}
      </h1>

      {step === 'prep' && prepCountdown !== null && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            background: 'var(--color-primary)',
            color: 'white',
            borderRadius: '50%',
            width: '80px', height: '80px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-baloo)',
            fontSize: '32px', fontWeight: 700,
            boxShadow: 'var(--shadow-clay-md)',
          }}>
            {prepCountdown}s
          </div>
          <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', marginTop: '8px' }}>Prep time</p>
        </div>
      )}

      {task && (
        <div style={{ marginBottom: '24px' }}>
          <AudioPlayer
            audioUrl={task.audio_url}
            transcript={task.transcript}
            showTranscript={showText}
            onTranscriptToggle={() => setShowText(!showText)}
            autoPlay={step === 'prep'}
          />
        </div>
      )}

      {(step === 'prep' || step === 'record') && task && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <RecordButton
            onRecordingComplete={handleRecordingComplete}
            disabled={step === 'prep'}
            maxSeconds={task?.record_time_seconds || 30}
          />
          {step === 'prep' && (
            <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Wait for prep time to end before recording
            </p>
          )}
        </div>
      )}

      {step === 'score' && result && (
        <ScoreCard
          overallScore={result.scoring.overallScore}
          scoring={result.scoring}
          onFullRetake={() => window.location.reload()}
          onTargetedRetry={() => router.push(`/toefl/attempt/${result.attempt.id}?retry=targeted`)}
          onDone={() => router.push('/toefl')}
        />
      )}
    </div>
  );
}