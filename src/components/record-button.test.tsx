// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { RecordButton } from './record-button';

vi.mock('./waveform', () => ({
  Waveform: () => <div data-testid="waveform" />,
}));

class TestMediaRecorder {
  static instances: TestMediaRecorder[] = [];
  state: 'inactive' | 'recording' = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor() {
    TestMediaRecorder.instances.push(this);
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['audio'], { type: 'audio/webm' }) });
    this.onstop?.();
  }
}

class PendingFileReader {
  static instances: PendingFileReader[] = [];
  result: string | ArrayBuffer | null = null;
  onloadend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    PendingFileReader.instances.push(this);
  }

  readAsDataURL() {
    this.result = 'data:audio/webm;base64,YXVkaW8=';
  }

  finish() {
    this.onloadend?.();
  }
}

function installMediaMocks() {
  const stop = vi.fn();
  const stream = {
    getTracks: () => [{ stop }],
  } as unknown as MediaStream;

  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue(stream),
    },
  });
  Object.defineProperty(window, 'MediaRecorder', {
    configurable: true,
    value: TestMediaRecorder,
  });
  Object.defineProperty(globalThis, 'MediaRecorder', {
    configurable: true,
    value: TestMediaRecorder,
  });
  Object.defineProperty(window, 'FileReader', {
    configurable: true,
    value: PendingFileReader,
  });
  Object.defineProperty(globalThis, 'FileReader', {
    configurable: true,
    value: PendingFileReader,
  });
}

describe('RecordButton', () => {
  beforeEach(() => {
    TestMediaRecorder.instances = [];
    PendingFileReader.instances = [];
    installMediaMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('reports microphone start failures and allows retry', async () => {
    const onError = vi.fn();
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(new Error('Permission denied'));
    render(<RecordButton onRecordingComplete={vi.fn()} onError={onError} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.any(Error)));
    expect(screen.getByRole('button')).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(TestMediaRecorder.instances).toHaveLength(1));
  });

  test('keeps start disabled while stopped recording is finalizing', async () => {
    const onRecordingComplete = vi.fn();
    render(<RecordButton onRecordingComplete={onRecordingComplete} />);

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(TestMediaRecorder.instances).toHaveLength(1));

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeDisabled();

    fireEvent.click(screen.getByRole('button'));
    expect(TestMediaRecorder.instances).toHaveLength(1);

    PendingFileReader.instances[0].finish();
    await waitFor(() => expect(onRecordingComplete).toHaveBeenCalledWith(expect.any(Blob), 'YXVkaW8='));
    await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled());
  });

  test('auto-starts when prompt playback changes from disabled to record mode', async () => {
    const onRecordingComplete = vi.fn();
    const { rerender } = render(
      <RecordButton onRecordingComplete={onRecordingComplete} disabled autoStart={false} />
    );

    expect(TestMediaRecorder.instances).toHaveLength(0);

    rerender(<RecordButton onRecordingComplete={onRecordingComplete} disabled={false} autoStart />);

    await waitFor(() => expect(TestMediaRecorder.instances).toHaveLength(1));
    expect(TestMediaRecorder.instances[0].state).toBe('recording');
  });

  test('auto-starts immediately when mounted in record mode', async () => {
    render(<RecordButton onRecordingComplete={vi.fn()} disabled={false} autoStart />);

    await waitFor(() => expect(TestMediaRecorder.instances).toHaveLength(1));
    expect(TestMediaRecorder.instances[0].state).toBe('recording');
  });

  test('auto-starts in React StrictMode after mount cleanup is replayed', async () => {
    render(
      <StrictMode>
        <RecordButton onRecordingComplete={vi.fn()} disabled={false} autoStart />
      </StrictMode>
    );

    await waitFor(() => {
      expect(TestMediaRecorder.instances.some(instance => instance.state === 'recording')).toBe(true);
    });
  });
});
