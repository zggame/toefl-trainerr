import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseServer } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from('toefl_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    const { data: newProfile, error: createError } = await supabase
      .from('toefl_profiles')
      .insert({ user_id: user.id, target_score: 4.0 })
      .select()
      .single();

    if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });
    return NextResponse.json(newProfile);
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseServer();
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.target_score !== undefined) updates.target_score = body.target_score;

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('toefl_profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}