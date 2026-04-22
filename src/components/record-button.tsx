'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square } from 'lucide-react';
import { Waveform } from './waveform';

interface RecordButtonProps {
  onRecordingComplete: (audioBlob: Blob, base64: string) => void | Promise<void>;
  onError?: (error: Error) => void;
  disabled?: boolean;
  maxSeconds?: number;
  autoStart?: boolean;
}

type RecordingPhase = 'idle' | 'starting' | 'recording' | 'finalizing';

export function RecordButton({ onRecordingComplete, onError, disabled, maxSeconds = 45, autoStart }: RecordButtonProps) {
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
      void Promise.resolve().then(startRecording);
    }
  }, [autoStart, disabled, phase, startRecording]);

  useEffect(() => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {recording && (
          <div style={{
            fontFamily: 'var(--font-baloo)',
            fontSize: '28px',
            fontWeight: 700,
            color: isUrgent ? '#EF4444' : 'var(--color-cta)',
            transition: 'color 200ms',
          }}>
            {formatTime(remaining)}
          </div>
        )}
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={buttonDisabled}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            border: recording ? '4px solid var(--color-cta)' : '4px solid var(--color-primary)',
            background: recording ? 'rgba(34,197,94,0.1)' : 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: buttonDisabled ? 'not-allowed' : 'pointer',
            boxShadow: recording ? '0 0 0 8px rgba(34,197,94,0.15)' : 'var(--shadow-clay-md)',
            transition: 'all 200ms ease',
          }}
        >
          {recording ? <Square size={28} color='var(--color-cta)' /> : <Mic size={28} color='white' />}
        </button>
      </div>
      <Waveform analyzing={recording} />
      {recording ? (
        <p style={{ fontFamily: 'var(--font-comic)', color: isUrgent ? '#EF4444' : 'var(--color-cta)', fontSize: '14px', fontWeight: isUrgent ? 700 : 400 }}>
          {isUrgent ? 'Time is almost up!' : 'Recording... Tap to stop early'}
        </p>
      ) : processing ? (
        <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          {phase === 'starting' ? 'Starting recorder...' : 'Processing recording...'}
        </p>
      ) : (
        <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Time limit: {maxSeconds} seconds
        </p>
      )}
    </div>
  );
}
