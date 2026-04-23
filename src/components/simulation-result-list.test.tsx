// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { SimulationResultList, type SimulationScoreResult } from './simulation-result-list';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const baseTask = {
  id: 'task-1',
  category: 'listen_repeat' as const,
  audio_url: 'https://example.test/prompt.mp3',
  transcript: 'Bring your ID card.',
  difficulty: 'easy',
  prep_time_seconds: 0,
  record_time_seconds: 30,
  simulationItemNumber: 1,
};

describe('SimulationResultList', () => {
  afterEach(() => {
    cleanup();
    push.mockClear();
  });

  test('links successful simulation items to their attempt detail pages', () => {
    const results: SimulationScoreResult[] = [
      {
        itemNumber: 1,
        task: baseTask,
        attemptId: 'attempt-1',
        overallScore: 3.4,
      },
      {
        itemNumber: 2,
        task: { ...baseTask, id: 'task-2', simulationItemNumber: 2 },
        error: 'Scoring failed',
      },
    ];

    render(<SimulationResultList results={results} />);

    fireEvent.click(screen.getByRole('button', { name: /item 1/i }));

    expect(push).toHaveBeenCalledWith('/toefl/attempt/attempt-1');
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText(/Item 2/).closest('button')).toBeNull();
  });
});
