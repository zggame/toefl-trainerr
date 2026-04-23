'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
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
    <Card padding="md" gap={false}>
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
            onEndedRef.current?.();
          }} 
        />
      )}
      <div className="flex items-center gap-3">
        <button
          disabled={!allowReplay && hasStartedOnce}
          onClick={toggle}
          className="touch-target flex items-center justify-center shrink-0 rounded-full active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: playing ? '60%' : '0%',
                background: 'var(--color-primary)',
              }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {playing ? (useTts ? 'Speaking...' : 'Playing...') : (useTts ? 'Tap to hear prompt' : 'Tap to play prompt')}
          </p>
        </div>
        
        {allowReplay && (
          <button
            onClick={() => {
              if (useTts) {
                stopSpeaking();
                startTts();
              } else if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                startNativeAudio();
              }
            }}
            className="touch-target p-2 rounded-lg"
            style={{ color: 'var(--color-text-muted)' }}
            title="Replay"
          >
            {useTts ? <Volume2 size={18} /> : <RotateCcw size={18} />}
          </button>
        )}
      </div>

      {allowTranscript && transcript && onTranscriptToggle && (
        <button
          onClick={onTranscriptToggle}
          className="mt-3 text-sm font-medium touch-target flex items-center gap-1"
          style={{ color: 'var(--color-primary)' }}
        >
          {showTranscript ? <><ChevronUp size={16} /> Hide Text</> : <><ChevronDown size={16} /> Show Text</>}
        </button>
      )}

      {allowTranscript && showTranscript && transcript && (
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
