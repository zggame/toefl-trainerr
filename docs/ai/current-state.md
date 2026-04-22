# TOEFL Speaking Trainer — Current State

**Project:** toefl-trainerr  
**Branch:** feat/toefl-phase1 (merged to main)  
**Tag:** `v0.1.0-alpha.1`  
**Last Updated:** 2026-04-22 (updated with real TOEFL Speaking simulation)

---

## What's Implemented (Phase 1 MVP)

### Core Practice Loop
- **Auth:** Google OAuth via Supabase Auth with middleware guards
- **Flow:** Play audio prompt (TTS fallback) → auto-start recording when prompt ends → AI scoring → save attempt
- **Simulation:** Real TOEFL Speaking mode runs 11 items in order — 7 listen-repeat, then 4 interview — with no prompt replay or transcript reveal
- **Tasks:** 65 total — 30 listen-repeat + 35 interview, random selection per session
- **Timer:** Countdown during recording (turns red at 5s), auto-stops at 0

### AI Scoring (Gemini)
- **Model:** `gemini-2.5-flash-lite` with retry + exponential backoff for 503/rate-limit
- **Returns:** Delivery, Language Use, Topic Development scores (0–4), overall score, transcript, WPM, filler count
- **Prompt:** Structured JSON output with evidence + tips

### App Pages
| Page | Route | Status |
|------|-------|--------|
| Landing | `/` | ✅ Done |
| Sign-in | `/auth/signin` | ✅ Done |
| Dashboard | `/toefl` | ✅ Done |
| Practice | `/toefl/practice?mode=guided` and `/toefl/practice?mode=simulation` | ✅ Done |
| History | `/toefl/history` | ✅ Done |
| Attempt Review | `/toefl/attempt/[id]` | ✅ Done |
| Profile | `/toefl/profile` | ✅ Done |

### API Routes
- `GET /api/toefl/tasks` — random task
- `GET /api/toefl/simulation/tasks` — 11-item TOEFL Speaking simulation task plan
- `POST /api/toefl/score` — AI scoring + save attempt
- `GET /api/toefl/attempts` — history
- `GET /api/toefl/attempts/[id]` — single attempt
- `GET/PUT /api/toefl/profile` — user profile

### Database (Supabase)
- `toefl_profiles` — per-user stats
- `toefl_tasks` — 65 prompts
- `toefl_attempts` — scored recordings with transcript, WPM, filler count
- RLS policies on all tables
- Storage bucket: `toefl_recordings`

---

## Tag / Release Convention

```
v{MAJOR}.{MINOR}.{PATCH}-{phase}.{build}
```

| Component | Meaning |
|-----------|---------|
| **MAJOR** | Breaking changes (auth flow, DB schema, API contract) |
| **MINOR** | New features (retry loop, new task types, dashboard charts) |
| **PATCH** | Bug fixes, UI tweaks, copy updates |
| **phase** | `alpha` = MVP/internal, `beta` = public preview, `rc` = release candidate |
| **build** | Increment within same phase |

### Examples
- `v0.1.0-alpha.1` — Phase 1 MVP (current)
- `v0.1.0-alpha.2` — hotfix after alpha.1
- `v0.2.0-alpha.1` — Phase 2 retry loop added
- `v0.5.0-beta.1` — public beta
- `v1.0.0` — production release

---

## Build & Test Status

| Check | Status |
|-------|--------|
| Build | ✅ Passes (`npm run build`, 2026-04-22) |
| Lint | ✅ Passes (`npm run lint`, 2026-04-22) |
| Tests | ✅ 23/23 passing (`npm test`, 2026-04-22) |
| Gemini API | ✅ Verified live (gemini-2.5-flash-lite) |
| Supabase local | ✅ Running (port 54321) |

## Latest Engineering Milestone

**Branch/worktree:** `feat/real-toefl-simulation` at `/home/pooh/work/toefl-mini/.worktrees/real-toefl-simulation`

- Added simulation task planning utilities with tests for counts, ordering, prompt-bank sufficiency, and mode parsing.
- Added authenticated `GET /api/toefl/simulation/tasks` to fetch and shuffle the required simulation task bank.
- Added dashboard entry points for guided practice and simulation mode.
- Updated practice mode to support full sequential simulation recording, scoring, and final score summary while preserving guided mode.
- Hardened prompt playback and recording lifecycle for simulation: no replay/transcript reveal, stale async guards, mic/runtime error handling, and duplicate-recording prevention.

---

## Risks

1. **Gemini rate limits** — Mitigated with 3 retries + exponential backoff
2. **Audio placeholders** — All tasks use placeholder URLs; `AudioPlayer` falls back to browser TTS
3. **No retry loop yet** — Phase 2 feature (targeted retry, sentence-level retry)
4. **No profile update UI** — API exists but page is read-only
5. **Private recording playback** — ✅ Fixed. Score route stores storage path; attempt fetch generates signed URL. Verify bucket policies against the production Supabase project before launch.
6. **Simulation prompt bank dependency** — Simulation requires at least 7 `listen_repeat` and 4 `interview` tasks in Supabase; the API returns a blocking 404 if the bank is underfilled.

---

## Deployment Architecture

**Decision:** Separate Supabase project for toefl-trainerr (do not share with smart-interview).

**Stack:**
- **Frontend:** Vercel (connected to `zggame/toefl-trainerr`)
- **Backend:** New Supabase Cloud project (auth + DB + storage)
- **AI:** Google Gemini API (`gemini-2.5-flash-lite`)

**Rationale:** Clean isolation prevents schema conflicts, RLS policy collisions, and shared-resource contention. Supabase free tier supports 2 projects at no cost.

**Status:** Not yet deployed. See `docs/ai/deployment.md` for step-by-step guide.

---

## Follow-ups

- [ ] Deploy to Vercel + new Supabase Cloud project
- [ ] Phase 2: Targeted retry + sentence-level retry
- [ ] Phase 2: Side-by-side attempt comparison
- [ ] Generate real audio prompts (replace TTS fallback)
- [ ] Score trend chart on dashboard
- [ ] Streak tracking + profile updates
