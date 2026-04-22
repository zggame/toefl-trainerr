'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreDisplay } from '@/components/ui/score-display';
import { AudioPlayer } from '@/components/audio-player';
import { RecordButton } from '@/components/record-button';
import { ScoreCard } from '@/components/score-card';
import { ScoringResult } from '@/lib/gemini';
import { Mic, Headphones, Sparkles, RotateCcw, Home } from 'lucide-react';

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

type Step = 'loading' | 'playing' | 'record' | 'scoring' | 'score';

export default function PracticePage() {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [showText, setShowText] = useState(false);
  const [step, setStep] = useState<Step>('loading');
  const [result, setResult] = useState<{ attempt: Attempt; scoring: ScoringResult } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/toefl/tasks')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setTask(data);
        setStep('playing');
      })
      .catch(() => setError('Failed to load task'));
  }, []);

  const handleAudioEnded = () => {
    setStep('record');
  };

  const handleRecordingComplete = async (audioBlob: Blob, base64: string) => {
    if (!task) return;
    setStep('scoring');

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
      const errData = await res.json().catch(() => ({ error: 'Scoring failed' }));
      setError(errData.error || 'Scoring failed. Please try again.');
      setStep('record');
      return;
    }

    const data = await res.json();
    setResult(data);
    setStep('score');
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'rgba(239, 68, 68, 0.1)' }}
      >
        <Sparkles size={32} style={{ color: 'var(--color-accent-red)' }} />
      </div>
      <p className="mb-6" style={{ color: 'var(--color-accent-red)' }}>{error}</p>
      <Button onClick={() => router.push('/toefl')}>
        Back to Home
      </Button>
    </div>
  );

  if (!task && step === 'loading') return (
    <div className="flex items-center justify-center py-24">
      <div 
        className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center px-3">
        <span 
          className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
          style={{ 
            background: 'rgba(79, 70, 229, 0.1)',
            color: 'var(--color-primary)',
          }}
        >
          {task?.category === 'listen_repeat' ? 'Listen & Repeat' : 'Interview Question'}
        </span>
        <h1 
          className="text-xl font-semibold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {step === 'playing' && 'Listen Carefully'}
          {step === 'record' && 'Your Turn to Speak'}
          {step === 'scoring' && 'Analyzing Your Response'}
          {step === 'score' && 'Great Job!'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {step === 'playing' && 'The prompt will play automatically'}
          {step === 'record' && 'Speak naturally and clearly'}
          {step === 'scoring' && 'Our AI is reviewing your speaking'}
          {step === 'score' && 'Here is your detailed feedback'}
        </p>
      </div>

      {/* Playing State */}
      {step === 'playing' && (
        <div className="flex flex-col items-center py-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
            style={{ 
              background: 'var(--color-primary)',
              boxShadow: 'var(--shadow-button)',
            }}
          >
            <Headphones size={32} color="white" />
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Playing prompt...
          </p>
        </div>
      )}

      {/* Recording State */}
      {step === 'record' && (
        <div className="flex flex-col items-center py-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3 relative"
            style={{ background: 'var(--color-accent-red)' }}
          >
            {/* Pulse animation */}
            <div 
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ background: 'var(--color-accent-red)' }}
            />
            <Mic size={32} color="white" />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-accent-red)' }}>
            Recording...
          </p>
        </div>
      )}

      {/* Scoring State */}
      {step === 'scoring' && (
        <Card padding="lg" className="text-center py-12">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(79, 70, 229, 0.1)' }}
          >
            <Sparkles size={32} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Scoring Your Response
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Analyzing delivery, language use, and topic development
          </p>
          <div className="mt-6 flex justify-center">
            <div 
              className="w-32 h-2 rounded-full overflow-hidden"
              style={{ background: 'var(--color-bg-overlay)' }}
            >
              <div 
                className="h-full rounded-full animate-pulse"
                style={{ 
                  background: 'var(--color-primary)',
                  width: '60%',
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Score State */}
      {step === 'score' && result && (
        <div className="space-y-8">
          <Card padding="lg" className="text-center mb-6">
            <ScoreDisplay 
              score={result.scoring.overallScore} 
              size="lg" 
            />
            <div className="flex justify-center gap-6 mt-4">
              {[
                { label: 'Delivery', score: result.scoring.delivery.score },
                { label: 'Language', score: result.scoring.languageUse.score },
                { label: 'Topic Dev', score: result.scoring.topicDev.score },
              ].map(d => (
                <div key={d.label} className="text-center">
                  <div 
                    className="text-lg font-bold"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {d.score.toFixed(1)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {d.label}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => window.location.reload()}
              icon={<RotateCcw size={18} />}
            >
              Try Again
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
      )}

      {/* Audio Player */}
      {task && step !== 'score' && (
        <div className="mt-4">
          <AudioPlayer
            audioUrl={task.audio_url}
            transcript={task.transcript}
            showTranscript={showText}
            onTranscriptToggle={() => setShowText(!showText)}
            autoPlay={step === 'playing'}
            onEnded={handleAudioEnded}
          />
        </div>
      )}

      {/* Record Button */}
      {(step === 'playing' || step === 'record') && task && (
        <div className="flex flex-col items-center gap-4">
          <RecordButton
            onRecordingComplete={handleRecordingComplete}
            disabled={step !== 'record'}
            maxSeconds={task?.record_time_seconds || 30}
            autoStart={step === 'record'}
          />
          {step === 'playing' && (
            <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
              Recording will start automatically when the prompt finishes
            </p>
          )}
        </div>
      )}
    </div>
  );
}
