import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseServer } from '@/lib/supabase-client';
import {
  INSUFFICIENT_SIMULATION_TASKS_MESSAGE,
  buildSimulationTaskPlan,
  type SimulationSourceTask,
} from '../../../../../lib/toefl-simulation';

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from('toefl_tasks').select('*');

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to load simulation tasks' }, { status: 500 });
  }

  try {
    const shuffledTasks = shuffle(data as SimulationSourceTask[]);
    return NextResponse.json(buildSimulationTaskPlan(shuffledTasks));
  } catch (err) {
    const message =
      err instanceof Error && err.message === INSUFFICIENT_SIMULATION_TASKS_MESSAGE
        ? err.message
        : 'Failed to build simulation tasks';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
