// @vitest-environment jsdom

import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AudioPlayer } from './audio-player';

class TestSpeechSynthesisUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe('AudioPlayer', () => {
  const spokenUtterances: TestSpeechSynthesisUtterance[] = [];
  const speak = vi.fn((utterance: TestSpeechSynthesisUtterance) => {
    spokenUtterances.push(utterance);
    utterance.onstart?.();
  });
  const cancel = vi.fn();

  beforeEach(() => {
    speak.mockClear();
    cancel.mockClear();
    spokenUtterances.length = 0;
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { speak, cancel },
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: TestSpeechSynthesisUtterance,
    });
    Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: TestSpeechSynthesisUtterance,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test('autoplays repeated placeholder prompts when the playback key changes', async () => {
    const props = {
      audioUrl: 'https://example.com/placeholder.mp3',
      transcript: 'All students should submit their assignments by Friday.',
      allowReplay: false,
      allowTranscript: false,
      autoPlay: true,
    };

    const { rerender } = render(<AudioPlayer {...props} playbackKey="item-1" />);

    await waitFor(() => expect(speak).toHaveBeenCalledTimes(1));

    rerender(<AudioPlayer {...props} playbackKey="item-2" />);

    await waitFor(() => expect(speak).toHaveBeenCalledTimes(2));
  });

  test('does not restart autoplay when only the ended callback changes', async () => {
    const firstEnded = vi.fn();
    const secondEnded = vi.fn();
    const props = {
      audioUrl: 'https://example.com/placeholder.mp3',
      transcript: 'Bring your ID card.',
      allowReplay: false,
      allowTranscript: false,
      autoPlay: true,
      playbackKey: 'item-1',
    };

    const { rerender } = render(<AudioPlayer {...props} onEnded={firstEnded} />);

    await waitFor(() => expect(speak).toHaveBeenCalledTimes(1));

    rerender(<AudioPlayer {...props} onEnded={secondEnded} />);

    expect(speak).toHaveBeenCalledTimes(1);

    spokenUtterances[0].onend?.();

    expect(firstEnded).not.toHaveBeenCalled();
    expect(secondEnded).toHaveBeenCalledTimes(1);
  });

  test('falls back to ending placeholder playback when speech synthesis never fires onend', async () => {
    vi.useFakeTimers();
    const onEnded = vi.fn();

    render(
      <AudioPlayer
        audioUrl="https://example.com/placeholder.mp3"
        transcript="Bring your ID card."
        allowReplay={false}
        allowTranscript={false}
        autoPlay
        playbackKey="item-1"
        onEnded={onEnded}
      />
    );

    await vi.waitFor(() => expect(speak).toHaveBeenCalledTimes(1));

    vi.advanceTimersByTime(5000);

    expect(onEnded).toHaveBeenCalledTimes(1);
  });
});
