export const SIMULATION_LISTEN_REPEAT_COUNT = 7;
export const SIMULATION_INTERVIEW_COUNT = 4;
export const SIMULATION_TOTAL_ITEMS = 11;

export type PracticeMode = 'guided' | 'simulation';
export type ToeflTaskCategory = 'listen_repeat' | 'interview';

export interface SimulationSourceTask {
  id: string;
  category: string;
  audio_url: string;
  transcript: string;
  difficulty: string;
  prep_time_seconds: number;
  record_time_seconds: number;
  [key: string]: unknown;
}

export interface SimulationTask extends SimulationSourceTask {
  category: ToeflTaskCategory;
  simulationItemNumber: number;
}

export function getPracticeMode(value: string | null | undefined): PracticeMode {
  return value === 'simulation' ? 'simulation' : 'guided';
}

export function buildSimulationTaskPlan(tasks: readonly SimulationSourceTask[]): SimulationTask[] {
  const listenRepeatTasks = tasks.filter(task => task.category === 'listen_repeat').slice(0, SIMULATION_LISTEN_REPEAT_COUNT);
  const interviewTasks = tasks.filter(task => task.category === 'interview').slice(0, SIMULATION_INTERVIEW_COUNT);

  if (listenRepeatTasks.length < SIMULATION_LISTEN_REPEAT_COUNT || interviewTasks.length < SIMULATION_INTERVIEW_COUNT) {
    throw new Error('Need at least 7 listen-repeat tasks and 4 interview tasks for simulation');
  }

  return [...listenRepeatTasks, ...interviewTasks].map((task, index) => ({
    ...task,
    category: task.category as ToeflTaskCategory,
    simulationItemNumber: index + 1,
  }));
}
