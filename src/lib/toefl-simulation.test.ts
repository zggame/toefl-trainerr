import { describe, expect, test } from 'vitest';
import {
  SIMULATION_INTERVIEW_COUNT,
  SIMULATION_LISTEN_REPEAT_COUNT,
  SIMULATION_TOTAL_ITEMS,
  buildSimulationTaskPlan,
  getPracticeMode,
} from './toefl-simulation';

const listenRepeatTasks = Array.from({ length: 8 }, (_, index) => ({
  id: `listen-${index + 1}`,
  category: 'listen_repeat',
  audio_url: `https://example.test/listen-${index + 1}.mp3`,
  transcript: `Listen sentence ${index + 1}`,
  difficulty: 'medium',
  prep_time_seconds: 0,
  record_time_seconds: 20,
}));

const interviewTasks = Array.from({ length: 5 }, (_, index) => ({
  id: `interview-${index + 1}`,
  category: 'interview',
  audio_url: `https://example.test/interview-${index + 1}.mp3`,
  transcript: `Interview question ${index + 1}`,
  difficulty: 'medium',
  prep_time_seconds: 0,
  record_time_seconds: 45,
}));

describe('toefl simulation utilities', () => {
  test('parses supported practice modes with guided as fallback', () => {
    expect(getPracticeMode(null)).toBe('guided');
    expect(getPracticeMode('')).toBe('guided');
    expect(getPracticeMode('guided')).toBe('guided');
    expect(getPracticeMode('simulation')).toBe('simulation');
    expect(getPracticeMode('unknown')).toBe('guided');
  });

  test('defines the TOEFL 2026 speaking simulation counts', () => {
    expect(SIMULATION_LISTEN_REPEAT_COUNT).toBe(7);
    expect(SIMULATION_INTERVIEW_COUNT).toBe(4);
    expect(SIMULATION_TOTAL_ITEMS).toBe(SIMULATION_LISTEN_REPEAT_COUNT + SIMULATION_INTERVIEW_COUNT);
  });

  test('builds seven listen-repeat tasks followed by four interview tasks', () => {
    const plan = buildSimulationTaskPlan([...interviewTasks, ...listenRepeatTasks]);

    expect(plan).toHaveLength(11);
    expect(plan.slice(0, 7).every(task => task.category === 'listen_repeat')).toBe(true);
    expect(plan.slice(7).every(task => task.category === 'interview')).toBe(true);
    expect(plan.map(task => task.simulationItemNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  test('starts simulation with the easiest shortest listen-repeat prompts', () => {
    const plan = buildSimulationTaskPlan([
      {
        id: 'hard-long',
        category: 'listen_repeat',
        audio_url: 'https://example.test/hard.mp3',
        transcript: 'This challenging academic announcement contains substantially more words than a beginner should repeat first.',
        difficulty: 'hard',
        prep_time_seconds: 0,
        record_time_seconds: 45,
      },
      {
        id: 'easy-short',
        category: 'listen_repeat',
        audio_url: 'https://example.test/easy.mp3',
        transcript: 'Bring your ID card.',
        difficulty: 'easy',
        prep_time_seconds: 0,
        record_time_seconds: 20,
      },
      ...listenRepeatTasks.slice(0, 6),
      ...interviewTasks,
    ]);

    expect(plan[0]).toMatchObject({
      id: 'easy-short',
      difficulty: 'easy',
      category: 'listen_repeat',
    });
    expect(plan.slice(0, 7).some(task => task.id === 'hard-long')).toBe(false);
  });

  test('throws when the prompt bank lacks enough listen-repeat tasks', () => {
    expect(() => buildSimulationTaskPlan([...listenRepeatTasks.slice(0, 6), ...interviewTasks]))
      .toThrow('Need at least 7 listen-repeat tasks and 4 interview tasks for simulation');
  });

  test('throws when the prompt bank lacks enough interview tasks', () => {
    expect(() => buildSimulationTaskPlan([...listenRepeatTasks, ...interviewTasks.slice(0, 3)]))
      .toThrow('Need at least 7 listen-repeat tasks and 4 interview tasks for simulation');
  });
});
