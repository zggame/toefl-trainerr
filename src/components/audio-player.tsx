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
  playbackKey?: string;
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
  playbackKey,
  onEnded,
}: AudioPlayerProps) {
  const [playingSourceKey, setPlayingSourceKey] = useState<string | null>(null);
  const [endedSourceKey, setEndedSourceKey] = useState<string | null>(null);
  const [startedSourceKey, setStartedSourceKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const onEndedRef = useRef(onEnded);
  const ttsFallbackTimerRef = useRef<number | null>(null);
  const useTts = isPlaceholderUrl(audioUrl);
  const sourceKey = playbackKey ?? `${audioUrl}::${transcript ?? ''}`;
  const playing = playingSourceKey === sourceKey;
  const hasStartedOnce = startedSourceKey === sourceKey;

  const clearTtsFallback = useCallback(() => {
    if (ttsFallbackTimerRef.current !== null) {
      window.clearTimeout(ttsFallbackTimerRef.current);
      ttsFallbackTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    clearTtsFallback();
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
  }, [clearTtsFallback, sourceKey]);

  useEffect(() => () => clearTtsFallback(), [clearTtsFallback]);

  const startTts = useCallback(() => {
    if (!transcript) return;
    clearTtsFallback();
    setStartedSourceKey(sourceKey);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(transcript);
    let finished = false;
    const finishPlayback = () => {
      if (finished) return;
      finished = true;
      clearTtsFallback();
      setPlayingSourceKey(null);
      setEndedSourceKey(sourceKey);
      onEndedRef.current?.();
    };
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => {
      setPlayingSourceKey(sourceKey);
      setEndedSourceKey(null);
    };
    utterance.onend = finishPlayback;
    utterance.onpause = () => setPlayingSourceKey(null);
    utterance.onresume = () => {
      setPlayingSourceKey(sourceKey);
      setEndedSourceKey(null);
    };
    utterance.onerror = () => setPlayingSourceKey(null);
    window.speechSynthesis.speak(utterance);
    const estimatedDurationMs = Math.max(3000, Math.ceil(((transcript.split(/\s+/).filter(Boolean).length / 2.4) + 1) * 1000));
    ttsFallbackTimerRef.current = window.setTimeout(finishPlayback, estimatedDurationMs);
  }, [clearTtsFallback, sourceKey, transcript]);

  const stopSpeaking = useCallback(() => {
    clearTtsFallback();
    window.speechSynthesis.cancel();
    setPlayingSourceKey(null);
  }, [clearTtsFallback]);

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
    if (useTts) {
      if (!allowReplay) {
        if (!hasStartedOnce) startTts();
        return;
      }
      if (playing) stopSpeaking();
      else startTts();
      return;
    }
    if (!audioRef.current) return;
    if (!allowReplay) {
      if (!hasStartedOnce) startNativeAudio();
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
          disabled={!allowReplay && hasStartedOnce}
          onClick={toggle}
          style={{
            width: '48px', height: '48px',
            background: 'var(--color-primary)',
            borderRadius: '50%',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: !allowReplay && hasStartedOnce ? 'not-allowed' : 'pointer',
            opacity: !allowReplay && hasStartedOnce ? 0.6 : 1,
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
