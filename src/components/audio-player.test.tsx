// @vitest-environment jsdom

import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AudioPlayer } from './audio-player';

describe('AudioPlayer', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url === '/api/toefl/tts') {
        return Promise.resolve({
          json: () => Promise.resolve({ audioData: 'base64audio' }),
        });
      }
      if (url.startsWith('data:audio/wav;base64,')) {
        return Promise.resolve({
          blob: () => Promise.resolve(new Blob(['audio'], { type: 'audio/wav' })),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }));

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:http://localhost:3000/mock-audio'),
      revokeObjectURL: vi.fn(),
    });

    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    
    // Mock speechSynthesis just in case anything else still tries to use it, 
    // though it should be removed from AudioPlayer.
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { speak: vi.fn(), cancel: vi.fn() },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
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

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledWith('/api/toefl/tts', expect.any(Object)));
    await waitFor(() => expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1));

    rerender(<AudioPlayer {...props} playbackKey="item-2" />);

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(4)); // 2 for /api/toefl/tts, 2 for data:audio
    await waitFor(() => expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2));
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

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledWith('/api/toefl/tts', expect.any(Object)));
    await waitFor(() => expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1));

    rerender(<AudioPlayer {...props} onEnded={secondEnded} />);

    // Should not fetch again as sourceKey hasn't changed
    expect(globalThis.fetch).toHaveBeenCalledTimes(2); // 1 for /api/toefl/tts, 1 for data:audio
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  test('calls onEnded when audio element finishes', async () => {
    const onEnded = vi.fn();
    const props = {
      audioUrl: 'https://example.com/placeholder.mp3',
      transcript: 'Bring your ID card.',
      allowReplay: false,
      allowTranscript: false,
      autoPlay: true,
      playbackKey: 'item-1',
      onEnded,
    };

    const { container } = render(<AudioPlayer {...props} />);

    await waitFor(() => expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1));

    const audioElement = container.querySelector('audio');
    if (audioElement) {
      // Simulate the ended event
      const event = new Event('ended');
      audioElement.dispatchEvent(event);
    }

    expect(onEnded).toHaveBeenCalledTimes(1);
  });
});
