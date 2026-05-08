import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseServer } from '@/lib/supabase-client';
import { generateTTS } from '@/lib/gemini';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, voice = 'Kore' } = await req.json();
    if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });

    const hash = crypto.createHash('sha256').update(`${text}:${voice}`).digest('hex');
    const supabase = getSupabaseServer();

    // 1. Check Cache
    const { data: cached } = await supabase
      .from('tts_cache')
      .select('audio_data')
      .eq('text_hash', hash)
      .single();

    if (cached) {
      return NextResponse.json({ audioData: cached.audio_data });
    }

    // 2. Generate New
    const audioData = await generateTTS(text, voice);

    // 3. Update Cache
    await supabase.from('tts_cache').upsert({
      text_hash: hash,
      text_content: text,
      voice_name: voice,
      audio_data: audioData
    }, { onConflict: 'text_hash' });

    return NextResponse.json({ audioData });
  } catch (error: any) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
