'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreDisplay } from '@/components/ui/score-display';
import { AudioPlayer } from '@/components/audio-player';
import { RecordButton } from '@/components/record-button';
import { ScoreCard } from '@/components/score-card';
import { SimulationResultList, type SimulationScoreResult } from '@/components/simulation-result-list';
import { ScoringResult } from '@/lib/gemini';
import { getPracticeMode, SIMULATION_TOTAL_ITEMS, type PracticeMode, type SimulationTask } from '@/lib/toefl-simulation';
import { Mic, Headphones, Sparkles, RotateCcw, Home, Loader2, ChevronRight } from 'lucide-react';

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

type RecordedSimulationAnswer = { task: SimulationTask; base64: string; mimeType: string };

type ScoreResponse = {
  attempt: Attempt;
  scoring: ScoringResult;
};

export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = getPracticeMode(searchParams.get('mode'));
  const isSimulation = mode === 'simulation';
  const practiceRunIdRef = useRef(0);
  const [practiceRunId, setPracticeRunId] = useState(0);
  const [task, setTask] = useState<Task | null>(null);
  const [simulationTasks, setSimulationTasks] = useState<SimulationTask[]>([]);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [simulationRecordings, setSimulationRecordings] = useState<RecordedSimulationAnswer[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationScoreResult[]>([]);
  const [showText, setShowText] = useState(false);
  const [step, setStep] = useState<Step>('loading');
  const [result, setResult] = useState<{ attempt: Attempt; scoring: ScoringResult } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const activeTask = isSimulation ? simulationTasks[simulationIndex] : task;
  const isActiveRun = (runId: number) => practiceRunIdRef.current === runId;
  const activePromptKey = activeTask
    ? `${practiceRunId}:${mode}:${activeTask.id}:${simulationIndex}`
    : null;
  const activePromptKeyRef = useRef<string | null>(null);

  useEffect(() => {
    activePromptKeyRef.current = activePromptKey;
  }, [activePromptKey]);

  // Load task set when mode changes.
  useEffect(() => {
    let cancelled = false;
    const runId = ++practiceRunIdRef.current;
    setPracticeRunId(runId);
    activePromptKeyRef.current = null;

    const loadTasks = async () => {
      await Promise.resolve();
      if (cancelled || !isActiveRun(runId)) return;

      setTask(null);
      setSimulationTasks([]);
      setSimulationIndex(0);
      setSimulationRecordings([]);
      setSimulationResults([]);
      setResult(null);
      setShowText(false);
      setError(null);
      setRecordingError(null);
      setStep('loading');

      try {
        const res = await fetch(isSimulation ? '/api/toefl/simulation/tasks' : '/api/toefl/tasks');
        const data = await res.json().catch(() => ({ error: 'Failed to load task' }));

        if (cancelled) return;
        if (!isActiveRun(runId)) return;

        if (!res.ok || data.error) {
          setError(data.error || 'Failed to load task');
          return;
        }

        if (isSimulation) {
          setSimulationTasks(data);
          setTask(null);
        } else {
          setTask(data);
          setSimulationTasks([]);
        }
        setStep('playing');
      } catch {
        if (!cancelled && isActiveRun(runId)) setError('Failed to load task');
      }
    };

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, [isSimulation]);

  const handleAudioEnded = (promptKey: string | null) => {
    if (!promptKey || promptKey !== activePromptKeyRef.current) return;
    setRecordingError(null);
    setStep('record');
  };

  const handleRecordingError = (err: Error) => {
    setRecordingError(err.message || 'Could not start recording. Please check microphone access and try again.');
    setStep('record');
  };

  const submitScore = async (
    scoreTask: Task | SimulationTask,
    base64: string,
    mimeType: string,
    practiceMode: PracticeMode
  ): Promise<ScoreResponse> => {
    const res = await fetch('/api/toefl/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64: base64,
        mimeType,
        taskId: scoreTask.id,
        taskCategory: scoreTask.category,
        taskTranscript: scoreTask.transcript ?? '',
        mode: practiceMode,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: 'Scoring failed' }));
      throw new Error(errData.error || 'Scoring failed. Please try again.');
    }

    return res.json();
  };

  const scoreSimulationRecordings = async (recordings: RecordedSimulationAnswer[]) => {
    const runId = practiceRunIdRef.current;
    if (!isActiveRun(runId)) return;

    setStep('scoring');
    setSimulationResults([]);

    for (const recording of recordings) {
      if (!isActiveRun(runId)) return;

      const itemNumber = recording.task.simulationItemNumber;
      try {
        const data = await submitScore(recording.task, recording.base64, recording.mimeType, 'simulation');
        if (!isActiveRun(runId)) return;

        const scoredResult: SimulationScoreResult = {
          itemNumber,
          task: recording.task,
          attemptId: data.attempt.id,
          overallScore: data.scoring.overallScore,
        };
        setSimulationResults(previous => [...previous, scoredResult]);
      } catch (err) {
        if (!isActiveRun(runId)) return;
        const failedResult: SimulationScoreResult = {
          itemNumber,
          task: recording.task,
          error: err instanceof Error ? err.message : 'Scoring failed',
        };
        setSimulationResults(previous => [...previous, failedResult]);
      }
    }

    if (!isActiveRun(runId)) return;
    setStep('score');
  };

  const handleRecordingComplete = async (audioBlob: Blob, base64: string) => {
    if (!activeTask) return;
    const runId = practiceRunIdRef.current;
    if (!isActiveRun(runId)) return;

    if (!base64) {
      setRecordingError('No audio was recorded. Please try again.');
      setStep('record');
      return;
    }

    setRecordingError(null);
    const mimeType = audioBlob.type || 'audio/webm';

    if (isSimulation) {
      const recording = { task: activeTask as SimulationTask, base64, mimeType };
      const nextRecordings = [...simulationRecordings, recording];
      setSimulationRecordings(nextRecordings);

      if (simulationIndex < simulationTasks.length - 1) {
        setSimulationIndex(index => index + 1);
        setShowText(false);
        setStep('playing');
        return;
      }

      await scoreSimulationRecordings(nextRecordings);
      return;
    }

    if (!isActiveRun(runId)) return;
    setStep('scoring');

    try {
      const data = await submitScore(activeTask, base64, mimeType, 'guided');
      if (!isActiveRun(runId)) return;
      setResult(data);
      setStep('score');
    } catch (err) {
      if (!isActiveRun(runId)) return;
      setError(err instanceof Error ? err.message : 'Scoring failed. Please try again.');
      setStep('record');
    }
  };

  const successfullyScoredResults = simulationResults.filter(result => result.overallScore !== undefined);
  const averageSimulationScore = successfullyScoredResults.length > 0
    ? successfullyScoredResults.reduce((sum, item) => sum + (item.overallScore ?? 0), 0) / successfullyScoredResults.length
    : null;

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

  if (!activeTask && step === 'loading') return (
    <div className="flex items-center justify-center py-24">
      <div 
        className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
      />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div className="text-center" style={{ paddingLeft: '12px', paddingRight: '12px' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span 
            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ 
              background: isSimulation ? 'var(--color-accent)' : 'var(--color-primary)',
              color: 'white',
            }}
          >
            {isSimulation ? 'Simulation' : 'Guided Practice'}
          </span>
          <span 
            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ 
              background: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--color-primary)',
            }}
          >
            {activeTask?.category === 'listen_repeat' ? 'Listen & Repeat' : 'Interview'}
          </span>
        </div>
        
        {isSimulation && step !== 'score' && (
          <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            ITEM {Math.min(simulationIndex + 1, SIMULATION_TOTAL_ITEMS)} OF {SIMULATION_TOTAL_ITEMS}
          </p>
        )}

        <h1 
          className="text-xl font-semibold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {step === 'playing' && 'Listen Carefully'}
          {step === 'record' && 'Your Turn to Speak'}
          {step === 'scoring' && (isSimulation ? 'Scoring Simulation' : 'Analyzing Response')}
          {step === 'score' && (isSimulation ? 'Simulation Complete' : 'Great Job!')}
        </h1>
        
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {step === 'playing' && 'The prompt will play automatically'}
          {step === 'record' && 'Speak naturally and clearly'}
          {step === 'scoring' && (
            isSimulation 
              ? `${simulationResults.length} of ${simulationRecordings.length} responses scored`
              : 'Our AI is reviewing your speaking'
          )}
          {step === 'score' && (
            isSimulation 
              ? 'Review your full simulation breakdown'
              : 'Here is your detailed feedback'
          )}
        </p>
      </div>

      {/* Playing State */}
      {step === 'playing' && (
        <div className="flex flex-col items-center py-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
            style={{ 
              background: isSimulation ? 'var(--color-accent)' : 'var(--color-primary)',
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
          <div className="flex items-center justify-center mb-4">
            <Loader2 size={48} className="animate-spin" style={{ color: isSimulation ? 'var(--color-accent)' : 'var(--color-primary)' }} />
          </div>
          <h2 
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {isSimulation ? 'Processing Results' : 'Scoring Your Response'}
          </h2>
          <div className="mt-6 flex justify-center">
            <div 
              className="w-32 h-2 rounded-full overflow-hidden"
              style={{ background: 'var(--color-bg-overlay)' }}
            >
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  background: isSimulation ? 'var(--color-accent)' : 'var(--color-primary)',
                  width: isSimulation 
                    ? `${(simulationResults.length / simulationRecordings.length) * 100}%` 
                    : '60%',
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Score State (Single Task) */}
      {step === 'score' && !isSimulation && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ScoreCard
            overallScore={result.scoring.overallScore}
            scoring={result.scoring}
            attemptId={result.attempt.id}
            onFullRetake={() => window.location.reload()}
            onTargetedRetry={() => router.push(`/toefl/attempt/${result.attempt.id}?retry=targeted`)}
            onDone={() => router.push('/toefl')}
          />
        </div>
      )}

      {/* Score State (Simulation) */}
      {step === 'score' && isSimulation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Card padding="lg" className="text-center">
            <div className="mb-2">
              <span className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Average Score
              </span>
            </div>
            <ScoreDisplay 
              score={averageSimulationScore ?? 0} 
              size="lg" 
            />
            <p className="text-sm mt-4" style={{ color: 'var(--color-text-secondary)' }}>
              {successfullyScoredResults.length} of {simulationRecordings.length} items scored successfully
            </p>
          </Card>

          <div style={{ paddingLeft: '12px', paddingRight: '12px' }}>
            <h3 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Item Breakdown
            </h3>
            <SimulationResultList results={simulationResults} />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={() => window.location.reload()}
              icon={<RotateCcw size={18} />}
            >
              Start New Simulation
            </Button>
            <Button 
              variant="secondary"
              onClick={() => router.push('/toefl')}
              icon={<Home size={18} />}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Audio Player */}
      {activeTask && step !== 'score' && (
        <div className="mt-4">
          <AudioPlayer
            audioUrl={activeTask.audio_url}
            transcript={activeTask.transcript ?? ''}
            showTranscript={showText}
            onTranscriptToggle={isSimulation ? undefined : () => setShowText(!showText)}
            allowReplay={!isSimulation}
            allowTranscript={!isSimulation}
            autoPlay={step === 'playing'}
            playbackKey={activePromptKey ?? undefined}
            onEnded={() => handleAudioEnded(activePromptKey)}
          />
        </div>
      )}

      {/* Record Button */}
      {(step === 'playing' || step === 'record') && activeTask && (
        <div className="flex flex-col items-center gap-4">
          <RecordButton
            key={activePromptKey ?? activeTask.id}
            onRecordingComplete={handleRecordingComplete}
            onError={handleRecordingError}
            disabled={false}
            maxSeconds={activeTask.record_time_seconds || 30}
            autoStart
          />
          {step === 'playing' && (
            <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
              Recording will start automatically when the prompt finishes
            </p>
          )}
          {recordingError && (
            <p className="text-sm text-center font-medium" style={{ color: 'var(--color-accent-red)' }}>
              {recordingError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
