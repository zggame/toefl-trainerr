'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AudioPlayerProps {
  audioUrl: string;
  transcript?: string;
  showTranscript?: boolean;
  onTranscriptToggle?: () => void;
  autoPlay?: boolean;
  onEnded?: () => void;
}

const PLACEHOLDER_DOMAINS = ['soundhelix.com', 'example.com', 'placeholder'];

function isPlaceholderUrl(url: string): boolean {
  return PLACEHOLDER_DOMAINS.some(d => url.includes(d));
}

export function AudioPlayer({ audioUrl, transcript, showTranscript, onTranscriptToggle, autoPlay, onEnded }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const useTts = isPlaceholderUrl(audioUrl);

  const speak = useCallback(() => {
    if (!transcript) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => { setPlaying(false); onEnded?.(); };
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
  }, [onEnded, transcript]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (autoPlay) {
      if (useTts) {
        speak();
      } else if (audioRef.current) {
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      }
    }
  }, [autoPlay, useTts, speak]);

  const toggle = () => {
    if (useTts) {
      if (playing) stopSpeaking();
      else speak();
      return;
    }
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <Card padding="md" gap={false}>
      {!useTts && <audio ref={audioRef} src={audioUrl} onEnded={() => { setPlaying(false); onEnded?.(); }} />}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="touch-target flex items-center justify-center shrink-0 rounded-full active:scale-95"
          style={{
            width: '48px',
            height: '48px',
            background: 'var(--color-primary)',
            boxShadow: 'var(--shadow-button)',
            transition: 'transform 150ms ease',
          }}
        >
          {playing
            ? <Pause size={20} color="white" />
            : <Play size={20} color="white" style={{ marginLeft: '2px' }} />
          }
        </button>
        <div className="flex-1 min-w-0">
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: 'var(--color-bg-overlay)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: playing ? '60%' : '0%',
                background: 'var(--color-primary)',
                transition: 'width 300ms',
              }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {playing ? (useTts ? 'Speaking...' : 'Playing...') : (useTts ? 'Tap to hear prompt' : 'Tap to play prompt')}
          </p>
        </div>
        <button
          onClick={() => {
            if (useTts) { stopSpeaking(); speak(); }
            else if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); setPlaying(true); }
          }}
          className="touch-target p-2 rounded-lg"
          style={{ color: 'var(--color-text-muted)' }}
          title="Replay"
        >
          {useTts ? <Volume2 size={18} /> : <RotateCcw size={18} />}
        </button>
      </div>
      {transcript && onTranscriptToggle && (
        <button
          onClick={onTranscriptToggle}
          className="mt-3 text-sm font-medium touch-target"
          style={{
            color: 'var(--color-primary)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {showTranscript ? <><ChevronUp size={16} /> Hide Text</> : <><ChevronDown size={16} /> Show Text</>}
        </button>
      )}
      {showTranscript && transcript && (
        <div
          className="mt-3 p-3 rounded-xl text-sm leading-relaxed"
          style={{
            background: 'var(--color-bg-overlay)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {transcript}
        </div>
      )}
    </Card>
  );
}