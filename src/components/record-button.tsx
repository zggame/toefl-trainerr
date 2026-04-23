'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Waveform } from './waveform';

interface RecordButtonProps {
  onRecordingComplete: (audioBlob: Blob, base64: string) => void | Promise<void>;
  onError?: (error: Error) => void;
  disabled?: boolean;
  maxSeconds?: number;
  autoStart?: boolean;
}

type RecordingPhase = 'idle' | 'starting' | 'recording' | 'finalizing';

export function RecordButton({ 
  onRecordingComplete, 
  onError, 
  disabled, 
  maxSeconds = 45, 
  autoStart 
}: RecordButtonProps) {
  const [phase, setPhase] = useState<RecordingPhase>('idle');
  const [remaining, setRemaining] = useState(maxSeconds);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const disposedRef = useRef(false);
  const autoStartConsumedRef = useRef(false);
  const phaseRef = useRef<RecordingPhase>('idle');

  const setRecordingPhase = useCallback((nextPhase: RecordingPhase) => {
    phaseRef.current = nextPhase;
    if (!disposedRef.current) setPhase(nextPhase);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStream = useCallback((stream: MediaStream | null) => {
    stream?.getTracks().forEach(t => t.stop());
    if (streamRef.current === stream) streamRef.current = null;
  }, []);

  const reportError = useCallback((error: unknown, stream?: MediaStream | null) => {
    clearTimer();
    stopStream(stream ?? streamRef.current);
    mediaRecorderRef.current = null;
    setRecordingPhase('idle');
    const normalizedError = error instanceof Error ? error : new Error('Recording failed. Please try again.');
    onError?.(normalizedError);
  }, [clearTimer, onError, setRecordingPhase, stopStream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    clearTimer();
    if (phaseRef.current === 'recording') setRecordingPhase('finalizing');
  }, [clearTimer, setRecordingPhase]);

  const startRecording = useCallback(async () => {
    if (disabled || phaseRef.current !== 'idle') return;

    setRecordingPhase('starting');
    setRemaining(maxSeconds);

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (disposedRef.current) {
        stopStream(stream);
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = () => {
        clearTimer();
        setRecordingPhase('finalizing');
        const blob = new Blob(chunks, { type: 'audio/webm' });
        stopStream(stream);
        mediaRecorderRef.current = null;
        if (disposedRef.current) return;

        const reader = new FileReader();
        reader.onerror = () => reportError(reader.error ?? new Error('Could not process recording.'));
        reader.onloadend = () => {
          if (disposedRef.current) return;
          const result = typeof reader.result === 'string' ? reader.result : '';
          const base64 = result.includes(',') ? result.split(',')[1] : '';
          try {
            void Promise.resolve(onRecordingComplete(blob, base64))
              .then(() => setRecordingPhase('idle'))
              .catch(reportError);
          } catch (err) {
            reportError(err);
          }
        };

        try {
          reader.readAsDataURL(blob);
        } catch (err) {
          reportError(err);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;
      mediaRecorder.start();
      setRecordingPhase('recording');

      timerRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      reportError(err, stream);
    }
  }, [clearTimer, disabled, maxSeconds, onRecordingComplete, reportError, setRecordingPhase, stopRecording, stopStream]);

  useEffect(() => {
    if (!autoStart) {
      autoStartConsumedRef.current = false;
      return;
    }

    if (phase === 'idle' && !disabled && !autoStartConsumedRef.current) {
      autoStartConsumedRef.current = true;
      // Use a small delay to ensure stream is ready and previous state is settled
      const timer = setTimeout(() => {
        void startRecording();
      }, 100);
      return () => {
        clearTimeout(timer);
        if (phaseRef.current === 'idle') {
          autoStartConsumedRef.current = false;
        }
      };
    }
  }, [autoStart, disabled, phase, startRecording]);

  useEffect(() => {
    disposedRef.current = false;
    return () => {
      disposedRef.current = true;
      clearTimer();
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      stopStream(streamRef.current);
    };
  }, [clearTimer, stopStream]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const isUrgent = remaining <= 5;
  const recording = phase === 'recording';
  const processing = phase === 'starting' || phase === 'finalizing';
  const buttonDisabled = disabled || processing;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        {recording && (
          <div
            className="font-bold tabular-nums"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '32px',
              color: isUrgent ? 'var(--color-accent-red)' : 'var(--color-text-primary)',
              transition: 'color 200ms',
            }}
          >
            {formatTime(remaining)}
          </div>
        )}
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={buttonDisabled}
          className="touch-target flex items-center justify-center shrink-0 rounded-full active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            width: '72px',
            height: '72px',
            border: recording ? '4px solid var(--color-accent-red)' : '4px solid var(--color-primary)',
            background: recording ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-primary)',
            boxShadow: recording ? '0 0 0 8px rgba(239, 68, 68, 0.15)' : 'var(--shadow-button)',
            transition: 'all 200ms ease',
          }}
        >
          {processing ? (
            <Loader2 size={24} color={recording ? 'var(--color-accent-red)' : 'white'} className="animate-spin" />
          ) : recording ? (
            <Square size={24} color="var(--color-accent-red)" fill="var(--color-accent-red)" />
          ) : (
            <Mic size={24} color="white" />
          )}
        </button>
      </div>
      
      <Waveform analyzing={recording} />
      
      <div className="text-center h-6">
        {recording ? (
          <p
            className="text-sm"
            style={{
              color: isUrgent ? 'var(--color-accent-red)' : 'var(--color-text-secondary)',
              fontWeight: isUrgent ? 600 : 400,
              fontFamily: 'var(--font-body)',
            }}
          >
            {isUrgent ? 'Time is almost up!' : 'Recording... Tap to stop'}
          </p>
        ) : processing ? (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            {phase === 'starting' ? 'Preparing recorder...' : 'Finalizing audio...'}
          </p>
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            Max: {maxSeconds}s
          </p>
        )}
      </div>
    </div>
  );
}
