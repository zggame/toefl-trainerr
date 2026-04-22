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

export function getPracticeMode(value: string | null | undefined): PracticeMode {
  return value === 'simulation' ? 'simulation' : 'guided';
}

export function buildSimulationTaskPlan(tasks: SimulationSourceTask[]): SimulationTask[] {
  const listenRepeat = tasks.filter((task): task is SimulationTask => task.category === 'listen_repeat');
  const interview = tasks.filter((task): task is SimulationTask => task.category === 'interview');

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
