export const SIMULATION_LISTEN_REPEAT_COUNT = 7;
export const SIMULATION_INTERVIEW_COUNT = 4;
export const SIMULATION_TOTAL_ITEMS = SIMULATION_LISTEN_REPEAT_COUNT + SIMULATION_INTERVIEW_COUNT;

export type PracticeMode = 'guided' | 'simulation';
export type ToeflTaskCategory = 'listen_repeat' | 'interview';

export type SimulationSourceTask = {
  id: string;
  category: string;
  audio_url: string;
  transcript: string | null;
  difficulty: string | null;
  prep_time_seconds: number | null;
  record_time_seconds: number | null;
};

export type SimulationTask = SimulationSourceTask & {
  category: ToeflTaskCategory;
  simulationItemNumber: number;
};

export const INSUFFICIENT_SIMULATION_TASKS_MESSAGE =
  'Need at least 7 listen-repeat tasks and 4 interview tasks for simulation';

const DIFFICULTY_RANK: Record<string, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export function getPracticeMode(value: string | null | undefined): PracticeMode {
  return value === 'simulation' ? 'simulation' : 'guided';
}

function transcriptWordCount(task: SimulationSourceTask): number {
  return (task.transcript ?? '').split(/\s+/).filter(Boolean).length;
}

function compareSimulationTaskDifficulty(a: SimulationSourceTask, b: SimulationSourceTask): number {
  const difficultyDelta = (DIFFICULTY_RANK[a.difficulty ?? ''] ?? 99) - (DIFFICULTY_RANK[b.difficulty ?? ''] ?? 99);
  if (difficultyDelta !== 0) return difficultyDelta;

  const wordCountDelta = transcriptWordCount(a) - transcriptWordCount(b);
  if (wordCountDelta !== 0) return wordCountDelta;

  return a.id.localeCompare(b.id);
}

function normalizedPromptText(task: SimulationSourceTask): string {
  return (task.transcript ?? '')
    .toLowerCase()
    .replace(/\bo\s+clock\b/g, 'oclock')
    .replace(/[^a-z0-9]+/g, '');
}

function uniquePromptTasks<T extends SimulationSourceTask>(tasks: T[]): T[] {
  const seen = new Set<string>();
  return tasks.filter(task => {
    const key = normalizedPromptText(task) || task.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildSimulationTaskPlan(tasks: SimulationSourceTask[]): SimulationTask[] {
  const listenRepeat = uniquePromptTasks(
    tasks
      .filter((task): task is SimulationTask => task.category === 'listen_repeat')
      .sort(compareSimulationTaskDifficulty)
  );
  const interview = uniquePromptTasks(
    tasks
      .filter((task): task is SimulationTask => task.category === 'interview')
      .sort(compareSimulationTaskDifficulty)
  );

  if (listenRepeat.length < SIMULATION_LISTEN_REPEAT_COUNT || interview.length < SIMULATION_INTERVIEW_COUNT) {
    throw new Error(INSUFFICIENT_SIMULATION_TASKS_MESSAGE);
  }

  return [
    ...listenRepeat.slice(0, SIMULATION_LISTEN_REPEAT_COUNT),
    ...interview.slice(0, SIMULATION_INTERVIEW_COUNT),
  ].map((task, index) => ({
    ...task,
    simulationItemNumber: index + 1,
  }));
}
