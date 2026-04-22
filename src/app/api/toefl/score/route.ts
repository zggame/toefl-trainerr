import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseServer } from '@/lib/supabase-client';
import { scoreAudio } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseServer();

  const body = await request.json();
  const { audioBase64, mimeType, taskId, taskCategory, taskTranscript, mode, previousAttemptId } = body;

  if (!audioBase64 || !mimeType || !taskId || !mode) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const result = await scoreAudio(audioBase64, mimeType, taskCategory, taskTranscript);

  const { data: attempt, error } = await supabase
    .from('toefl_attempts')
    .insert({
      user_id: user.id,
      task_id: taskId,
      mode,
      overall_score: result.overallScore,
      delivery_score: result.delivery.score,
      language_use_score: result.languageUse.score,
      topic_dev_score: result.topicDev.score,
      errors: result.errors,
      suggestion: result.suggestion,
      previous_attempt_id: previousAttemptId || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const audioBuffer = Buffer.from(audioBase64, 'base64');
  const fileName = `${user.id}/${taskId}-${Date.now()}.webm`;

  supabase.storage
    .from('toefl_recordings')
    .upload(fileName, audioBuffer, { contentType: mimeType })
    .then(({ data }) => {
      if (data?.fullPath) {
        const { data: { publicUrl } } = supabase.storage.from('toefl_recordings').getPublicUrl(data.fullPath);
        supabase
          .from('toefl_attempts')
          .update({ audio_url: publicUrl })
          .eq('id', attempt.id);
      }
    })
    .catch(console.error);

  return NextResponse.json({ attempt, scoring: result });
}
