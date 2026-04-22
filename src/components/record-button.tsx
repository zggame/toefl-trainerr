'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (autoStart && !recording && !disabled) {
      startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, disabled]);

  const startRecording = async () => {
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
    setSeconds(0);

    timerRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev >= maxSeconds) {
          stopRecording();
          return maxSeconds;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {recording && (
          <span style={{ fontFamily: 'var(--font-baloo)', fontSize: '20px', color: 'var(--color-cta)', fontWeight: 600 }}>
            {formatTime(seconds)}
          </span>
        )}
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={disabled}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            border: recording ? '4px solid var(--color-cta)' : '4px solid var(--color-primary)',
            background: recording ? 'rgba(34,197,94,0.1)' : 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: recording ? '0 0 0 8px rgba(34,197,94,0.15)' : 'var(--shadow-clay-md)',
            transition: 'all 200ms ease',
          }}
        >
          {recording ? <Square size={28} color='var(--color-cta)' /> : <Mic size={28} color='white' />}
        </button>
      </div>
      <Waveform analyzing={recording} />
      {recording ? (
        <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-cta)', fontSize: '14px' }}>
          Recording... Tap to stop
        </p>
      ) : (
        <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Tap to start recording
        </p>
      )}
    </div>
  );
}