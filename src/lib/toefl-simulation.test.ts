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
  topic_domain: 'campus',
  prep_time_seconds: 0,
  record_time_seconds: 20,
}));

const interviewTasks = Array.from({ length: 5 }, (_, index) => ({
  id: `interview-${index + 1}`,
  category: 'interview',
  audio_url: `https://example.test/interview-${index + 1}.mp3`,
  transcript: `Interview question ${index + 1}`,
  difficulty: 'medium',
  topic_domain: 'life_choice',
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

  test('does not repeat duplicate prompt text within the same category', () => {
    const duplicateListenPrompt = 'All students should submit their assignments by Friday.';
    const duplicateInterviewPrompt = 'What is your favorite way to spend a weekend?';
    const uniqueListenTasks = [
      'Please remember to bring your student ID card to the examination hall.',
      'The university bookstore is having a sale on textbooks this week.',
      'The biology lab will be closed for maintenance on Tuesday afternoon.',
      'The dining hall now offers vegan and gluten-free meal options every day.',
      'Student parking permits must be renewed before the end of the month.',
      'International students are encouraged to attend the orientation session on Friday morning.',
    ].map((transcript, index) => ({
      ...listenRepeatTasks[0],
      id: `listen-unique-${index}`,
      difficulty: 'easy',
      transcript,
    }));
    const plan = buildSimulationTaskPlan([
      {
        ...listenRepeatTasks[0],
        id: 'listen-duplicate-a',
        difficulty: 'easy',
        transcript: duplicateListenPrompt,
      },
      {
        ...listenRepeatTasks[1],
        id: 'listen-duplicate-b',
        difficulty: 'easy',
        transcript: duplicateListenPrompt,
      },
      {
        ...listenRepeatTasks[2],
        id: 'listen-spacing-a',
        difficulty: 'easy',
        transcript: 'The library will be open until eight oclock tonight.',
      },
      {
        ...listenRepeatTasks[3],
        id: 'listen-spacing-b',
        difficulty: 'easy',
        transcript: 'The library will be open until eight o clock tonight.',
      },
      ...uniqueListenTasks,
      {
        ...interviewTasks[0],
        id: 'interview-duplicate-a',
        difficulty: 'easy',
        transcript: duplicateInterviewPrompt,
      },
      {
        ...interviewTasks[1],
        id: 'interview-duplicate-b',
        difficulty: 'easy',
        transcript: duplicateInterviewPrompt,
      },
      ...interviewTasks.slice(2).map(task => ({
        ...task,
        difficulty: 'easy',
      })),
    ]);

    const listenPrompts = plan
      .filter(task => task.category === 'listen_repeat')
      .map(task => task.transcript);
    const interviewPrompts = plan
      .filter(task => task.category === 'interview')
      .map(task => task.transcript);

    expect(new Set(listenPrompts).size).toBe(listenPrompts.length);
    expect(new Set(interviewPrompts).size).toBe(interviewPrompts.length);
    expect(listenPrompts.filter(prompt => prompt === duplicateListenPrompt)).toHaveLength(1);
    expect(interviewPrompts.filter(prompt => prompt === duplicateInterviewPrompt)).toHaveLength(1);
    expect(listenPrompts.filter(prompt => prompt.includes('eight o')).length).toBeLessThanOrEqual(1);
  });

  test('selects all interview questions from the same topic domain', () => {
    const mixedTopicInterviews = [
      ...Array.from({ length: 3 }, (_, index) => ({
        ...interviewTasks[index],
        id: `education-${index}`,
        topic_domain: 'education',
        transcript: `Education question ${index + 1}`,
      })),
      ...Array.from({ length: 4 }, (_, index) => ({
        ...interviewTasks[index],
        id: `campus-life-${index}`,
        topic_domain: 'campus_life',
        transcript: `Campus life question ${index + 1}`,
      })),
      ...Array.from({ length: 4 }, (_, index) => ({
        ...interviewTasks[index],
        id: `technology-${index}`,
        difficulty: 'hard',
        topic_domain: 'technology',
        transcript: `Technology question ${index + 1}`,
      })),
    ];

    const plan = buildSimulationTaskPlan([...listenRepeatTasks, ...mixedTopicInterviews]);
    const interviewTopicDomains = plan
      .filter(task => task.category === 'interview')
      .map(task => task.topic_domain);

    expect(new Set(interviewTopicDomains)).toEqual(new Set(['campus_life']));
    expect(interviewTopicDomains).toHaveLength(4);
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
