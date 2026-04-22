'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

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
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: '16px',
      padding: '16px',
      border: '3px solid rgba(79,70,229,0.15)',
      boxShadow: 'var(--shadow-clay-sm)',
    }}>
      {!useTts && <audio ref={audioRef} src={audioUrl} onEnded={() => { setPlaying(false); onEnded?.(); }} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={toggle}
          style={{
            width: '48px', height: '48px',
            background: 'var(--color-primary)',
            borderRadius: '50%',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-clay-sm)',
            transition: 'all 200ms ease',
          }}
        >
          {playing ? <Pause size={20} color='white' /> : <Play size={20} color='white' style={{ marginLeft: '2px' }} />}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ height: '4px', background: 'rgba(79,70,229,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: playing ? '60%' : '0%', height: '100%', background: 'var(--color-primary)', transition: 'width 300ms' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', fontFamily: 'var(--font-comic)' }}>
            {playing ? (useTts ? 'Speaking...' : 'Playing...') : (useTts ? 'Tap to hear prompt' : 'Tap to play prompt')}
          </p>
        </div>
        <button
          onClick={() => {
            if (useTts) { stopSpeaking(); speak(); }
            else if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); setPlaying(true); }
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          title='Replay'
        >
          {useTts ? <Volume2 size={18} /> : <RotateCcw size={18} />}
        </button>
      </div>
      {transcript && onTranscriptToggle && (
        <button
          onClick={onTranscriptToggle}
          style={{
            marginTop: '12px',
            background: 'var(--color-background)',
            border: '2px solid rgba(79,70,229,0.2)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'var(--font-baloo)',
            color: 'var(--color-primary)',
          }}
        >
          Show Text
        </button>
      )}
      {showTranscript && transcript && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'var(--color-background)',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'var(--font-comic)',
          color: 'var(--color-text)',
        }}>
          {transcript}
        </div>
      )}
    </div>
  );
}
