import { createClient } from '@supabase/supabase-js';
import { scoreAudio } from '../src/lib/gemini';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Use the user found via docker exec
const TEST_USER_ID = '67c2093b-39aa-4fec-a5fa-e1633d06bec6';

async function dryRun() {
  console.log('--- 🧪 TOEFL AI Scoring Full Integration Test ---\n');

  // 1. Ensure Profile exists
  const { data: profile, error: profileError } = await supabase
    .from('toefl_profiles')
    .select('*')
    .eq('user_id', TEST_USER_ID)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error checking profile:', profileError.message);
    return;
  }

  if (!profile) {
    console.log('Creating test profile...');
    const { error: createError } = await supabase
      .from('toefl_profiles')
      .insert({ user_id: TEST_USER_ID, user_tier: 'free' });
    
    if (createError) {
      console.error('Failed to create profile:', createError.message);
      return;
    }
  }

  // 2. Fetch a real task
  const { data: task, error: taskError } = await supabase
    .from('toefl_tasks')
    .select('*')
    .limit(1)
    .single();

  if (taskError || !task) {
    console.error('Error fetching task:', taskError?.message || 'No tasks found in DB.');
    return;
  }

  console.log(`Task Found: [${task.category}] ${task.transcript?.slice(0, 50)}...`);

  // 3. Prepare placeholder audio
  const placeholderAudioBase64 = 'GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJLhhYBFXWgAAVAfuBAAAAAAADZfX7v96OBf59ChYEDQoKBAULygQRC84EIQoKEd2VibUKHgQJLhhYBFXWgAAVAfuBAAAAAAADZfX7v96OBf59ChYEDQoKBAULygQRC84EIQoKEd2VibUKHgQJLhhYBFXWgAAVAfuBAAAAAAADZfX7v96OBf59ChYEDQoKBAULygQRC84EIQoKEd2VibUKHgQJLhhYBFXWgAAVAfuBAAAAAAADZfX7v96OBf59ChYEDQoKBAULygQRC84EIQoKEd2VibUKHgQJLhhYBFXWgAAVAfuBAAAAAAADZfX7v96OBf59ChYEDQoKBAULygQRC84EIQoKEd2VibUKHgQJLhhYBFXWgAAVAfuBAAAAAAADZfX7v96OB';
  
  console.log('Calling Gemini AI for scoring...');

  try {
    const start = Date.now();
    const result = await scoreAudio(placeholderAudioBase64, 'audio/webm', task.category, task.transcript);
    const duration = (Date.now() - start) / 1000;

    console.log(`✅ AI Scoring Complete (${duration.toFixed(2)}s)`);

    // 4. Save Attempt to DB
    console.log('Saving attempt to database...');
    const { data: attempt, error: attemptError } = await supabase
      .from('toefl_attempts')
      .insert({
        user_id: TEST_USER_ID,
        task_id: task.id,
        mode: 'guided',
        overall_score: result.overallScore,
        delivery_score: result.delivery.score,
        language_use_score: result.languageUse.score,
        topic_dev_score: result.topicDev.score,
        transcript: result.transcript,
        wpm: result.wpm,
        filler_count: result.fillerCount,
        prompt_tokens: result.usage?.promptTokens || 0,
        completion_tokens: result.usage?.completionTokens || 0,
        total_tokens: result.usage?.totalTokens || 0,
        scoring_details: {
          delivery: result.delivery,
          languageUse: result.languageUse,
          topicDev: result.topicDev,
        },
      })
      .select()
      .single();

    if (attemptError) {
      console.error('Failed to save attempt:', attemptError.message);
      return;
    }

    // 5. Update Profile Stats
    console.log('Updating user profile stats...');
    const { error: updateError } = await supabase
      .from('toefl_profiles')
      .update({
        daily_attempt_count: (profile?.daily_attempt_count || 0) + 1,
        total_attempts: (profile?.total_attempts || 0) + 1,
        last_attempt_reset: new Date().toISOString(),
      })
      .eq('user_id', TEST_USER_ID);

    if (updateError) {
      console.error('Failed to update profile:', updateError.message);
      return;
    }

    console.log('\n--- Test Summary ---');
    console.log(`Attempt ID:   ${attempt.id}`);
    console.log(`Overall Score: ${result.overallScore}`);
    console.log(`Tokens Used:   ${result.usage?.totalTokens || 'N/A'}`);
    console.log('--------------------\n');

  } catch (err) {
    console.error('\n❌ Integration Test Failed:', err);
  }

  console.log('--- End of Test ---');
}

dryRun().catch(console.error);
