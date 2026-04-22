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
  const [startedSourceKey, setStartedSourceKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const useTts = isPlaceholderUrl(audioUrl);
  const sourceKey = `${audioUrl}::${transcript ?? ''}`;
  const playing = playingSourceKey === sourceKey;
  const hasEnded = endedSourceKey === sourceKey;
  const hasStartedOnce = startedSourceKey === sourceKey;

  useEffect(() => {
    window.speechSynthesis.cancel();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        // Ignore browsers that reject resetting before metadata is ready.
      }
    }
  }, [sourceKey]);

  const startTts = useCallback(() => {
    if (!transcript) return;
    setStartedSourceKey(sourceKey);
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
    utterance.onpause = () => setPlayingSourceKey(null);
    utterance.onresume = () => {
      setPlayingSourceKey(sourceKey);
      setEndedSourceKey(null);
    };
    utterance.onerror = () => setPlayingSourceKey(null);
    window.speechSynthesis.speak(utterance);
  }, [onEnded, sourceKey, transcript]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setPlayingSourceKey(null);
  }, []);

  const pauseTts = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resumeTts = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  const startNativeAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setStartedSourceKey(sourceKey);
    audio.play().then(() => {
      setPlayingSourceKey(sourceKey);
      setEndedSourceKey(null);
    }).catch(() => {
      setStartedSourceKey(current => (current === sourceKey ? null : current));
    });
  }, [sourceKey]);

  const canResumeNativeAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.ended) return false;
    return audio.currentTime > 0 && Number.isFinite(audio.duration) && audio.currentTime < audio.duration;
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setTimeout(() => {
      if (useTts) {
        startTts();
      } else if (audioRef.current) {
        startNativeAudio();
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autoPlay, sourceKey, startNativeAudio, startTts, useTts]);

  const toggle = () => {
    if (!allowReplay && hasEnded) return;
    if (useTts) {
      if (!allowReplay) {
        if (playing) {
          pauseTts();
          return;
        }
        if (window.speechSynthesis.paused) {
          resumeTts();
          return;
        }
        if (!hasStartedOnce) {
          startTts();
        }
        return;
      }
      if (playing) stopSpeaking();
      else startTts();
      return;
    }
    if (!audioRef.current) return;
    if (!allowReplay) {
      if (playing) {
        audioRef.current.pause();
        return;
      }
      if (!hasStartedOnce) {
        startNativeAudio();
        return;
      }
      if (canResumeNativeAudio()) {
        startNativeAudio();
      }
      return;
    }
    if (playing) {
      audioRef.current.pause();
    } else {
      startNativeAudio();
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
          onPlay={() => {
            setStartedSourceKey(sourceKey);
            setPlayingSourceKey(sourceKey);
            setEndedSourceKey(null);
          }}
          onPause={() => setPlayingSourceKey(null)}
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
              if (useTts) {
                stopSpeaking();
                startTts();
              }
              else if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                startNativeAudio();
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
