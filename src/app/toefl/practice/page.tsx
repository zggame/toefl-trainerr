'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AudioPlayer } from '@/components/audio-player';
import { RecordButton } from '@/components/record-button';
import { ScoreCard } from '@/components/score-card';
import { ScoringResult } from '@/lib/gemini';
import { getPracticeMode, SIMULATION_TOTAL_ITEMS, type PracticeMode, type SimulationTask } from '@/lib/toefl-simulation';
import { Loader2 } from 'lucide-react';

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

type SimulationScoreResult = {
  itemNumber: number;
  task: SimulationTask;
  attemptId?: string;
  overallScore?: number;
  error?: string;
};

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
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <p style={{ color: '#EF4444', fontFamily: 'var(--font-comic)', marginBottom: '16px' }}>{error}</p>
      <button onClick={() => router.push('/toefl')} style={{
        background: 'var(--color-primary)', color: 'white', border: 'none',
        borderRadius: 'var(--radius-pill)', padding: '10px 20px',
        fontFamily: 'var(--font-baloo)', cursor: 'pointer',
      }}>Back to Home</button>
    </div>
  );

  if (!activeTask && step === 'loading') return (
    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>
      Loading {isSimulation ? 'simulation' : 'task'}...
    </p>
  );

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
        {activeTask?.category === 'listen_repeat' ? 'Listen and Repeat' : 'Take an Interview'}
      </h1>

      {isSimulation && (
        <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '14px' }}>
          Simulation · Item {Math.min(simulationIndex + 1, SIMULATION_TOTAL_ITEMS)} of {SIMULATION_TOTAL_ITEMS}
        </p>
      )}

      {/* Playing: audio prompt */}
      {step === 'playing' && (
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
            margin: '0 auto',
          }}>
            <span style={{ animation: 'pulse 1.5s infinite' }}>▶</span>
          </div>
          <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', marginTop: '12px' }}>
            Listen to the prompt...
          </p>
        </div>
      )}

      {/* Recording */}
      {step === 'record' && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            background: 'var(--color-cta)',
            color: 'white',
            borderRadius: '50%',
            width: '80px', height: '80px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-baloo)',
            fontSize: '20px', fontWeight: 700,
            boxShadow: 'var(--shadow-clay-md)',
            margin: '0 auto',
          }}>
            REC
          </div>
          <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-cta)', marginTop: '8px', fontWeight: 600 }}>
            Recording started automatically!
          </p>
        </div>
      )}

      {/* Scoring */}
      {step === 'scoring' && (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          background: 'white',
          borderRadius: 'var(--radius-clay)',
          border: '3px solid rgba(79,70,229,0.15)',
          boxShadow: 'var(--shadow-clay-md)',
        }}>
          <Loader2 size={48} color='var(--color-primary)' style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontFamily: 'var(--font-baloo)', fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' }}>
            {isSimulation ? 'Scoring your simulation...' : 'Scoring your response...'}
          </p>
          <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', marginTop: '8px' }}>
            {isSimulation
              ? `${simulationResults.length} of ${simulationRecordings.length} responses scored`
              : 'Analyzing delivery, language use, and topic development'}
          </p>
        </div>
      )}

      {activeTask && step !== 'score' && (
        <div style={{ marginBottom: '24px' }}>
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

      {step === 'playing' && activeTask && !isSimulation && (
        <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center' }}>
          Recording will start automatically when the prompt finishes
        </p>
      )}

      {step === 'record' && activeTask && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <RecordButton
            key={activePromptKey ?? activeTask.id}
            onRecordingComplete={handleRecordingComplete}
            onError={handleRecordingError}
            disabled={false}
            maxSeconds={activeTask.record_time_seconds || 30}
            autoStart
          />
          {recordingError && (
            <p style={{ fontFamily: 'var(--font-comic)', color: '#EF4444', fontSize: '14px', fontWeight: 600 }}>
              {recordingError}
            </p>
          )}
        </div>
      )}

      {step === 'score' && !isSimulation && result && (
        <ScoreCard
          overallScore={result.scoring.overallScore}
          scoring={result.scoring}
          attemptId={result.attempt.id}
          onFullRetake={() => window.location.reload()}
          onTargetedRetry={() => router.push(`/toefl/attempt/${result.attempt.id}?retry=targeted`)}
          onDone={() => router.push('/toefl')}
        />
      )}

      {isSimulation && step === 'score' && (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-clay)',
          padding: '24px',
          border: '3px solid rgba(79,70,229,0.15)',
          boxShadow: 'var(--shadow-clay-lg)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '16px' }}>
            Simulation Complete
          </h2>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '42px', fontWeight: 700, color: 'var(--color-primary)' }}>
              {averageSimulationScore === null ? '—' : averageSimulationScore.toFixed(1)}
              <span style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}> / 4 average</span>
            </div>
            <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)' }}>
              {successfullyScoredResults.length} of {simulationRecordings.length} items scored successfully
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {simulationResults.map(item => (
              <div
                key={item.itemNumber}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '12px',
                  background: 'var(--color-background)',
                  borderRadius: '12px',
                  border: '2px solid rgba(79,70,229,0.1)',
                  fontFamily: 'var(--font-comic)',
                }}
              >
                <span style={{ color: 'var(--color-text)' }}>
                  Item {item.itemNumber} · {item.task.category === 'listen_repeat' ? 'Listen and Repeat' : 'Interview'}
                </span>
                <span style={{ fontFamily: 'var(--font-baloo)', color: item.error ? '#EF4444' : 'var(--color-primary)', fontWeight: 700 }}>
                  {item.error ? 'Failed' : `${item.overallScore?.toFixed(1)} / 4`}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                border: '3px solid transparent',
                borderRadius: 'var(--radius-pill)',
                padding: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-baloo)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-clay-sm)',
              }}
            >
              Start Another Simulation
            </button>
            <button
              onClick={() => router.push('/toefl')}
              style={{
                background: 'white',
                color: 'var(--color-primary)',
                border: '3px solid var(--color-primary)',
                borderRadius: 'var(--radius-pill)',
                padding: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-baloo)',
                cursor: 'pointer',
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
