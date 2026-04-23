// scripts/monitor-usage.ts
// Run with: npx tsx scripts/monitor-usage.ts

import { createClient } from '@supabase/supabase-js';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Needs service role for full access

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function monitorUsage() {
  console.log('--- TOEFL Speaking Trainer Usage Report ---\n');

  // 1. User Tiers & Daily Counts
  const { data: profiles, error: profileError } = await supabase
    .from('toefl_profiles')
    .select('user_id, user_tier, daily_attempt_count, total_attempts, last_attempt_reset')
    .order('total_attempts', { ascending: false });

  if (profileError) {
    console.error('Profile Error:', profileError);
  } else {
    console.log('User Stats:');
    console.table(profiles?.map(p => ({
      'User ID': p.user_id.slice(0, 8) + '...',
      Tier: p.user_tier,
      'Today': p.daily_attempt_count,
      'Total': p.total_attempts,
      'Last Active': new Date(p.last_attempt_reset).toLocaleString()
    })));
  }

  // 2. Token Usage & Costs (Gemini 2.5 Flash Lite pricing: $0.075 / 1M input, $0.30 / 1M output)
  const { data: attempts, error: attemptError } = await supabase
    .from('toefl_attempts')
    .select('prompt_tokens, completion_tokens, total_tokens');

  if (attemptError) {
    console.error('Attempt Error:', attemptError);
  } else {
    const totals = attempts?.reduce((acc, curr) => ({
      prompt: acc.prompt + (curr.prompt_tokens || 0),
      completion: acc.completion + (curr.completion_tokens || 0),
      total: acc.total + (curr.total_tokens || 0)
    }), { prompt: 0, completion: 0, total: 0 });

    const inputCost = (totals.prompt / 1_000_000) * 0.075;
    const outputCost = (totals.completion / 1_000_000) * 0.30;
    const totalCost = inputCost + outputCost;

    console.log('\nToken Usage Summary:');
    console.log(`- Total Prompt Tokens:     ${totals.prompt.toLocaleString()}`);
    console.log(`- Total Completion Tokens: ${totals.completion.toLocaleString()}`);
    console.log(`- Total Combined Tokens:   ${totals.total.toLocaleString()}`);
    console.log(`- Estimated AI Cost:       $${totalCost.toFixed(4)}`);
  }

  console.log('\n--- End of Report ---');
}

monitorUsage();
