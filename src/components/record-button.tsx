'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square } from 'lucide-react';
import { Waveform } from './waveform';

interface RecordButtonProps {
  onRecordingComplete: (audioBlob: Blob, base64: string) => void;
  disabled?: boolean;
  maxSeconds?: number;
  autoStart?: boolean;
}

export function RecordButton({ onRecordingComplete, disabled, maxSeconds = 45, autoStart }: RecordButtonProps) {
  const [recording, setRecording] = useState(false);
  const [remaining, setRemaining] = useState(maxSeconds);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        onRecordingComplete(blob, base64);
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(t => t.stop());
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
    setRemaining(maxSeconds);

    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [maxSeconds, onRecordingComplete, stopRecording]);

  useEffect(() => {
    if (autoStart && !recording && !disabled) {
      void Promise.resolve().then(startRecording);
    }
  }, [autoStart, disabled, recording, startRecording]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const isUrgent = remaining <= 5;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4">
        {recording && (
          <div
            className="font-bold tabular-nums"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '28px',
              color: isUrgent ? 'var(--color-accent-red)' : 'var(--color-text-primary)',
              transition: 'color 200ms',
            }}
          >
            {formatTime(remaining)}
          </div>
        )}
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={disabled}
          className="touch-target flex items-center justify-center shrink-0 rounded-full active:scale-95"
          style={{
            width: '56px',
            height: '56px',
            border: recording ? '3px solid var(--color-accent-red)' : '3px solid var(--color-primary)',
            background: recording ? 'var(--color-accent-red)' : 'var(--color-primary)',
            boxShadow: recording ? '0 0 0 6px rgba(239,68,68,0.15)' : 'var(--shadow-button)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 200ms ease',
          }}
        >
          {recording ? <Square size={22} color="white" /> : <Mic size={22} color="white" />}
        </button>
      </div>
      <Waveform analyzing={recording} />
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
      ) : (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
          Time limit: {maxSeconds} seconds
        </p>
      )}
    </div>
  );
}