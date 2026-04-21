import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');

  let query = supabase.from('toefl_tasks').select('*');
  if (category) query = query.eq('category', category);
  if (difficulty) query = query.eq('difficulty', difficulty);

  const { data: task, error } = await query.order('created_at', { ascending: true }).limit(1).single();

  if (error || !task) {
    return NextResponse.json({ error: 'No task found' }, { status: 404 });
  }

  return NextResponse.json(task);
}