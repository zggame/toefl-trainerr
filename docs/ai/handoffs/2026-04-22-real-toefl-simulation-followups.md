# Handoff: Real TOEFL Simulation Follow-ups

**Date:** 2026-04-22
**Branch:** `feat/real-toefl-simulation`
**Worktree:** `/home/pooh/work/toefl-mini/.worktrees/real-toefl-simulation`
**Remote:** pushed to `origin/feat/real-toefl-simulation`

## Goal

Finish manual-test follow-ups for the real TOEFL Speaking simulation before PR creation:

- Final simulation result rows should link to each saved attempt detail page.
- The final 4 `Take an Interview` questions should be grouped around the same topic.

## Progress

- Result-row detail links are implemented and pushed in commit `9173361 feat: link simulation results to attempts`.
- Manual-test fixes already pushed include:
  - easy/short prompt ordering
  - duplicate and near-duplicate prompt suppression
  - placeholder TTS prompt completion fallback
  - recorder mount/StrictMode auto-start fixes
- Current dev server is running from this worktree on `http://localhost:3011`.
- Current local worktree has uncommitted changes:
  - `docs/ai/current-state.md`
  - `docs/ai/handoffs/2026-04-22-real-toefl-simulation-followups.md`
  - `src/lib/toefl-simulation.test.ts`

## Current Red Test

Command:

```bash
npm test -- --run src/lib/toefl-simulation.test.ts
```

Current failure:

```text
toefl simulation utilities > selects all interview questions from the same topic domain
expected Set{ 'education', 'campus_life' } to deeply equal Set{ 'campus_life' }
```

This confirms the planner can currently mix interview topics.

## Next Step

Implement topic-grouped interview selection in `src/lib/toefl-simulation.ts`:

- Add `topic_domain` to `SimulationSourceTask`.
- Dedupe interview prompts first, as already done for duplicate text.
- Group unique interview tasks by normalized `topic_domain`.
- Select the best eligible group with at least 4 unique prompts.
- Within the selected group, keep the existing difficulty/length ordering.
- If no interview topic has 4 unique prompts, throw the existing insufficient simulation tasks error or a clear topic-specific error from the planner/API.

After implementation, run:

```bash
npm test
npm run lint
set -a; source /home/pooh/work/toefl-mini/.env.local; set +a; npm run build
```

Then commit and push to `origin/feat/real-toefl-simulation`.

## Evidence / Research

- Official ETS current Speaking page confirms the new task types: `Listen and Repeat` and `Take an Interview`.
- ETS public pages found so far do not clearly state that the 4 interview questions share one topic.
- Current third-party TOEFL 2026 prep descriptions characterize `Take an Interview` as a short mini-interview on one topic; implement grouping as product behavior for realism.

## Risks / Decisions

- The local Supabase `toefl_tasks` table has enough `topic_domain` coverage for grouping. `life_choice`, `education`, `society`, and `work` have enough rows before or after dedupe; verify exact unique counts if behavior changes.
- Do not generate fresh prompts unless topic grouping fails because the bank lacks 4 unique prompts in any topic.
- Keep this as a planner-only change; no database migration is needed.
