import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseServer } from '@/lib/supabase-client';
import { scoreAudio } from '@/lib/gemini';

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/x-wav',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBase64(value: string) {
  return value.length > 0 && value.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(value);
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseServer();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const { audioBase64, mimeType, taskId, taskCategory, taskTranscript, mode, previousAttemptId } = body;

  if (
    typeof audioBase64 !== 'string' ||
    typeof mimeType !== 'string' ||
    typeof taskId !== 'string' ||
    typeof mode !== 'string'
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!ALLOWED_AUDIO_TYPES.has(mimeType)) {
    return NextResponse.json({ error: 'Unsupported audio type' }, { status: 400 });
  }

  if (!isBase64(audioBase64)) {
    return NextResponse.json({ error: 'Invalid audio payload' }, { status: 400 });
  }

  const audioBuffer = Buffer.from(audioBase64, 'base64');
  if (audioBuffer.byteLength > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'Audio payload is too large' }, { status: 413 });
  }

  if (mode !== 'guided' && mode !== 'simulation') {
    return NextResponse.json({ error: 'Invalid practice mode' }, { status: 400 });
  }

  if (previousAttemptId !== undefined && typeof previousAttemptId !== 'string') {
    return NextResponse.json({ error: 'Invalid previous attempt' }, { status: 400 });
  }

  if (previousAttemptId) {
    const { data: previousAttempt } = await supabase
      .from('toefl_attempts')
      .select('id')
      .eq('id', previousAttemptId)
      .eq('user_id', user.id)
      .single();

    if (!previousAttempt) {
      return NextResponse.json({ error: 'Previous attempt not found' }, { status: 400 });
    }
  }

  let result;
  try {
    result = await scoreAudio(
      audioBase64,
      mimeType,
      typeof taskCategory === 'string' ? taskCategory : '',
      typeof taskTranscript === 'string' ? taskTranscript : undefined
    );
  } catch {
    return NextResponse.json({ error: 'Scoring failed. Please try again.' }, { status: 502 });
  }

  const fileExtension = mimeType.split('/')[1]?.replace('x-', '') || 'webm';
  const fileName = `${user.id}/${taskId}-${Date.now()}.${fileExtension}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('toefl_recordings')
    .upload(fileName, audioBuffer, { contentType: mimeType });

  if (uploadError || !uploadData) {
    return NextResponse.json({ error: 'Recording upload failed' }, { status: 500 });
  }

  const storagePath = uploadData.path ?? uploadData.fullPath ?? fileName;

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
      transcript: result.transcript,
      errors: result.errors,
      suggestion: result.suggestion,
      wpm: result.wpm,
      filler_count: result.fillerCount,
      previous_attempt_id: previousAttemptId || null,
      audio_url: storagePath,
      scoring_details: {
        delivery: result.delivery,
        languageUse: result.languageUse,
        topicDev: result.topicDev,
      },
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attempt, scoring: result });
}
