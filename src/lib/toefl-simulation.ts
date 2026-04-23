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
  topic_domain: string | null;
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

  return 0;
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

  const interviewPool = tasks.filter((task): task is SimulationTask => task.category === 'interview');

  // Group by topic_domain
  const topicsMap = new Map<string, SimulationTask[]>();
  for (const task of interviewPool) {
    const domain = task.topic_domain ?? 'general';
    if (!topicsMap.has(domain)) {
      topicsMap.set(domain, []);
    }
    topicsMap.get(domain)!.push(task);
  }

  // Find candidate topics with enough unique questions
  const candidateTopics: { domain: string; tasks: SimulationTask[] }[] = [];
  for (const [domain, domainTasks] of topicsMap.entries()) {
    const uniqueTasks = uniquePromptTasks(domainTasks.sort(compareSimulationTaskDifficulty));
    if (uniqueTasks.length >= SIMULATION_INTERVIEW_COUNT) {
      candidateTopics.push({ domain, tasks: uniqueTasks });
    }
  }

  if (listenRepeat.length < SIMULATION_LISTEN_REPEAT_COUNT || candidateTopics.length === 0) {
    throw new Error(INSUFFICIENT_SIMULATION_TASKS_MESSAGE);
  }

  // Randomly pick one of the candidate topics to ensure variety
  const chosenTopic = candidateTopics[Math.floor(Math.random() * candidateTopics.length)];
  const interview = chosenTopic.tasks.slice(0, SIMULATION_INTERVIEW_COUNT);

  return [...listenRepeat.slice(0, SIMULATION_LISTEN_REPEAT_COUNT), ...interview].map((task, index) => ({
    ...task,
    simulationItemNumber: index + 1,
  }));
}
