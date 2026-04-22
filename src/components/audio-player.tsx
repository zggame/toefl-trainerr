'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  transcript?: string;
  showTranscript?: boolean;
  onTranscriptToggle?: () => void;
  allowReplay?: boolean;
  allowTranscript?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
}

const PLACEHOLDER_DOMAINS = ['soundhelix.com', 'example.com', 'placeholder'];

function isPlaceholderUrl(url: string): boolean {
  return PLACEHOLDER_DOMAINS.some(d => url.includes(d));
}

export function AudioPlayer({
  audioUrl,
  transcript,
  showTranscript,
  onTranscriptToggle,
  allowReplay = true,
  allowTranscript = true,
  autoPlay,
  onEnded,
}: AudioPlayerProps) {
  const [playingSourceKey, setPlayingSourceKey] = useState<string | null>(null);
  const [endedSourceKey, setEndedSourceKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const useTts = isPlaceholderUrl(audioUrl);
  const sourceKey = `${audioUrl}::${transcript ?? ''}`;
  const playing = playingSourceKey === sourceKey;
  const hasEnded = endedSourceKey === sourceKey;

  const speak = useCallback(() => {
    if (!transcript) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => {
      setPlayingSourceKey(sourceKey);
      setEndedSourceKey(null);
    };
    utterance.onend = () => {
      setPlayingSourceKey(null);
      setEndedSourceKey(sourceKey);
      onEnded?.();
    };
    utterance.onerror = () => setPlayingSourceKey(null);
    window.speechSynthesis.speak(utterance);
  }, [onEnded, sourceKey, transcript]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setPlayingSourceKey(null);
  }, []);

  useEffect(() => {
    if (autoPlay) {
      if (useTts) {
        speak();
      } else if (audioRef.current) {
        audioRef.current.play().then(() => {
          setPlayingSourceKey(sourceKey);
          setEndedSourceKey(null);
        }).catch(() => {});
      }
    }
  }, [autoPlay, sourceKey, speak, useTts]);

  const toggle = () => {
    if (!allowReplay && hasEnded) return;
    if (useTts) {
      if (playing) stopSpeaking();
      else speak();
      return;
    }
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().then(() => {
        setPlayingSourceKey(sourceKey);
        setEndedSourceKey(null);
      }).catch(() => {});
    }
  };

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: '16px',
      padding: '16px',
      border: '3px solid rgba(79,70,229,0.15)',
      boxShadow: 'var(--shadow-clay-sm)',
    }}>
      {!useTts && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => {
            setPlayingSourceKey(null);
            setEndedSourceKey(sourceKey);
            onEnded?.();
          }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          disabled={!allowReplay && hasEnded}
          onClick={toggle}
          style={{
            width: '48px', height: '48px',
            background: 'var(--color-primary)',
            borderRadius: '50%',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: !allowReplay && hasEnded ? 'not-allowed' : 'pointer',
            opacity: !allowReplay && hasEnded ? 0.6 : 1,
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
        {allowReplay && (
          <button
            onClick={() => {
              if (useTts) { stopSpeaking(); speak(); }
              else if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().then(() => {
                  setPlayingSourceKey(sourceKey);
                  setEndedSourceKey(null);
                }).catch(() => {});
              }
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            title='Replay'
          >
            {useTts ? <Volume2 size={18} /> : <RotateCcw size={18} />}
          </button>
        )}
      </div>
      {allowTranscript && transcript && onTranscriptToggle && (
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
      {allowTranscript && showTranscript && transcript && (
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
