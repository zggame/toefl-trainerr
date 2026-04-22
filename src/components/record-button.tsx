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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {recording && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '28px',
            fontWeight: 700,
            color: isUrgent ? 'var(--color-accent-red)' : 'var(--color-text-primary)',
            transition: 'color 200ms',
          }}>
            {formatTime(remaining)}
          </div>
        )}
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={disabled}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: recording ? '3px solid var(--color-accent-red)' : '3px solid var(--color-primary)',
            background: recording ? 'var(--color-accent-red)' : 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: recording ? '0 0 0 6px rgba(239,68,68,0.15)' : 'var(--shadow-button)',
            transition: 'all 200ms ease',
            flexShrink: 0,
          }}
        >
          {recording ? <Square size={22} color='white' /> : <Mic size={22} color='white' />}
        </button>
      </div>
      <Waveform analyzing={recording} />
      {recording ? (
        <p style={{ fontFamily: 'var(--font-body)', color: isUrgent ? 'var(--color-accent-red)' : 'var(--color-text-secondary)', fontSize: '14px', fontWeight: isUrgent ? 600 : 400 }}>
          {isUrgent ? 'Time is almost up!' : 'Recording... Tap to stop'}
        </p>
      ) : (
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Time limit: {maxSeconds} seconds
        </p>
      )}
    </div>
  );
}
