import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const ai = new GoogleGenAI({ apiKey: geminiKey });

interface TaskDefinition {
  category: 'listen_repeat' | 'interview';
  difficulty: 'easy' | 'medium' | 'hard';
  topicDomain: string;
  script: string;
  prepTime: number;
  recordTime: number;
}

const taskDefinitions: TaskDefinition[] = [
  { category: 'listen_repeat', difficulty: 'easy', topicDomain: 'general', script: 'The library will be open until eight oclock tonight.', prepTime: 15, recordTime: 30 },
  { category: 'listen_repeat', difficulty: 'easy', topicDomain: 'general', script: 'All students should submit their assignments by Friday.', prepTime: 15, recordTime: 30 },
  { category: 'listen_repeat', difficulty: 'medium', topicDomain: 'academic', script: 'Professor Chen announced that the midterm exam will cover chapters one through six.', prepTime: 15, recordTime: 30 },
  { category: 'listen_repeat', difficulty: 'medium', topicDomain: 'campus', script: 'The campus shuttle runs every fifteen minutes between the main hall and the library.', prepTime: 15, recordTime: 30 },
  { category: 'listen_repeat', difficulty: 'hard', topicDomain: 'academic', script: 'Research indicates that students who review material within twentyfour hours retain nearly twice as much information as those who wait a week.', prepTime: 15, recordTime: 45 },
  { category: 'interview', difficulty: 'easy', topicDomain: 'life_choice', script: 'What is your favorite way to spend a weekend?', prepTime: 15, recordTime: 45 },
  { category: 'interview', difficulty: 'easy', topicDomain: 'education', script: 'Describe a subject you studied in school that you found interesting.', prepTime: 15, recordTime: 45 },
  { category: 'interview', difficulty: 'medium', topicDomain: 'work', script: 'Some people prefer to work independently while others prefer working in teams. Which do you prefer and why?', prepTime: 15, recordTime: 45 },
  { category: 'interview', difficulty: 'medium', topicDomain: 'life_choice', script: 'Describe a place you enjoy visiting in your free time and explain why it is important to you.', prepTime: 15, recordTime: 45 },
  { category: 'interview', difficulty: 'hard', topicDomain: 'society', script: 'Some people believe that technology has made our lives better, while others argue it has created new problems. What is your perspective and what evidence supports your view?', prepTime: 15, recordTime: 60 },
];

async function generateAudio(text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: [{ role: 'user', parts: [{ text: `Generate speech audio for this TOEFL speaking prompt. Speak clearly at a natural pace with a neutral American accent. Text: ${text}` }] }],
    config: { responseModalities: ['audio'] },
  });

  const audioParts = response.candidates?.[0]?.content?.parts?.filter(p => p.inlineData?.mimeType?.startsWith('audio/'));
  if (!audioParts || audioParts.length === 0) throw new Error('No audio generated');

  return audioParts[0].inlineData!.data!;
}

async function main() {
  if (!supabaseUrl || !supabaseKey || !geminiKey) {
    console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_GENERATIVE_AI_API_KEY');
    process.exit(1);
  }

  console.log('Generating and seeding TOEFL tasks...\n');

  for (let i = 0; i < taskDefinitions.length; i++) {
    const def = taskDefinitions[i];
    console.log(`[${i + 1}/${taskDefinitions.length}] ${def.category} (${def.difficulty}): ${def.script.slice(0, 50)}...`);

    try {
      const audioBase64 = await generateAudio(def.script);

      const fileName = `prompts/${Date.now()}-${i}.mp3`;
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      const { error: uploadError } = await supabase.storage.from('toefl_prompts').upload(fileName, audioBuffer, { contentType: 'audio/mpeg' });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('toefl_prompts').getPublicUrl(fileName);
      const audioUrl = urlData.publicUrl;

      const { error: insertError } = await supabase.from('toefl_tasks').insert({
        audio_url: audioUrl,
        transcript: def.script,
        category: def.category,
        difficulty: def.difficulty,
        topic_domain: def.topicDomain,
        prep_time_seconds: def.prepTime,
        record_time_seconds: def.recordTime,
      });

      if (insertError) throw insertError;
      console.log(`  Uploaded and seeded: ${audioUrl}`);
    } catch (err) {
      console.error(`  Failed: ${err}`);
    }
  }

  console.log('\nDone! Create storage buckets in Supabase dashboard:');
  console.log('  - toefl_prompts (public) — for audio prompt files');
  console.log('  - toefl_recordings (private) — for user recording storage');
}

main().catch(console.error);