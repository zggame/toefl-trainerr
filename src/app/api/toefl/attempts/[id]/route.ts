import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseServer } from '@/lib/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseServer();

  const { id } = await params;
  const { data, error } = await supabase
    .from('toefl_attempts')
    .select('*, toefl_tasks(audio_url, transcript, category, difficulty)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Generate a signed URL for private bucket playback
  if (data.audio_url && typeof data.audio_url === 'string' && !data.audio_url.startsWith('http')) {
    const { data: signedData } = await supabase.storage
      .from('toefl_recordings')
      .createSignedUrl(data.audio_url, 60 * 60); // 1 hour expiry

    if (signedData?.signedUrl) {
      data.audio_url = signedData.signedUrl;
    }
  }

  return NextResponse.json(data);
}
