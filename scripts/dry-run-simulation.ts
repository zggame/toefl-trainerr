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

async function simulationDryRun() {
  console.log('--- 🧪 TOEFL AI Simulation Background Scoring Test ---\n');

  // 1. Fetch simulation items (mimic the API)
  console.log('Fetching tasks for simulation...');
  const { data: tasks, error: tasksError } = await supabase
    .from('toefl_tasks')
    .select('*')
    .limit(3); // Test with 3 items for speed

  if (tasksError || !tasks || tasks.length < 3) {
    console.error('Error fetching tasks:', tasksError?.message || 'Need at least 3 tasks.');
    return;
  }

  const results: any[] = [];
  const placeholderAudioBase64 = 'GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJLhhYBFXWgAAVAfuBAAAAAAADZfX7v96OBf59ChYEDQoKBAULygQRC84EIQoKEd2VibUKHgQJLhhYBFXWgAAVAfuBAAAAAAADZfX7v96OBf59ChYEDQoKBAULygQRC84EIQoKEd2VibUKHgQJLhhYBFXWgAAVAfuBAAAAAAADZfX7v96OBf59ChYEDQoKBAULygQRC84EIQoKEd2VibUKHgQJLhhYBFXWgAAVAfuBAAAAAAADZfX7v96OBf59ChYEDQoKBAULygQRC84EIQoKEd2VibUKHgQJLhhYBFXWgAAVAfuBAAAAAAADZfX7v96OBf59ChYEDQoKBAULygQRC84EIQoKEd2VibUKHgQJLhhYBFXWgAAVAfuBAAAAAAADZfX7v96OB';

  // 2. Start Background Scoring Simulation
  console.log(`Simulating background scoring for ${tasks.length} items...\n`);

  const scoringPromises = tasks.map(async (task, index) => {
    const itemNumber = index + 1;
    console.log(`[Item ${itemNumber}] Starting background scoring...`);
    
    try {
      const result = await scoreAudio(placeholderAudioBase64, 'audio/webm', task.category, task.transcript);
      console.log(`[Item ${itemNumber}] ✅ Scored: ${result.overallScore}/4`);
      return { itemNumber, score: result.overallScore, success: true };
    } catch (err) {
      console.error(`[Item ${itemNumber}] ❌ Failed:`, err);
      return { itemNumber, success: false };
    }
  });

  // 3. Monitor Progress (Wait for all to finish)
  const finalResults = await Promise.all(scoringPromises);

  console.log('\n--- Final Simulation Summary ---');
  console.table(finalResults.map(r => ({
    'Item #': r.itemNumber,
    'Status': r.success ? 'SUCCESS' : 'FAILED',
    'Score': r.score ?? 'N/A'
  })));

  const avg = finalResults.filter(r => r.success).reduce((sum, r) => sum + r.score, 0) / finalResults.length;
  console.log(`Average Simulation Score: ${avg.toFixed(2)}`);
  console.log('--------------------------------\n');

  console.log('--- End of Simulation Test ---');
}

simulationDryRun().catch(console.error);
