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
  const speak = vi.fn((utterance: TestSpeechSynthesisUtterance) => {
    utterance.onstart?.();
  });
  const cancel = vi.fn();

  beforeEach(() => {
    speak.mockClear();
    cancel.mockClear();
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
});
