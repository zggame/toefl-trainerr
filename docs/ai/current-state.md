# TOEFL Speaking Trainer — Current State

**Project:** toefl-trainerr  
**Branch:** feat/toefl-phase1 (merged to main)  
**Tag:** `v0.2.0-alpha.1`
**Last Updated:** 2026-04-22 (handoff: same-topic interview grouping in progress)

---

## Tech Stack Evolution (Revamp v2.0)

The `feat/ui-revamp` branch introduces a significant shift in the application architecture:
- **Styling:** Migrated from inline styles to **Tailwind CSS v4** with a centralized `@theme` configuration.
- **Design System:** Implements **Claymorphism** tokens (shadows, border-radius, color palette) as documented in `MASTER.md`.
- **Components:** Modular, atomic component library (`Button`, `Card`, `ScoreDisplay`, `BottomNav`).
- **PWA:** Full mobile-first setup with service worker caching and offline support.

---

## What's Implemented

### Core Practice Loop
- **Auth:** Google OAuth via Supabase Auth with middleware guards
- **Guided Flow:** Play audio prompt → auto-start recording → AI scoring → save attempt
- **Simulation Mode:** 6-item full TOEFL speaking simulation with topic grouping and average scoring.
- **Tasks:** 65 total — 30 listen-repeat + 35 interview, random selection per session
- **Timer:** Countdown during recording (turns red at 5s), auto-stops at 0

### App Pages
| Page | Route | Status |
|------|-------|--------|
| Landing | `/` | ✅ Revamped (App Store Style) |
| Dashboard | `/toefl` | ✅ Revamped (Motivational Stats) |
| Practice | `/toefl/practice` | ✅ Revamped (Guided & Simulation) |
| History | `/toefl/history` | ✅ Revamped (Filtered view) |
| Attempt Review | `/toefl/attempt/[id]` | ✅ Revamped (Itemized Breakdown) |
| Profile | `/toefl/profile` | ✅ Revamped (Stats & Theme Toggle) |

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
| Tests | ✅ All tests passing (`npm test -- --run`, 2026-04-22) |
| Gemini API | ✅ Verified live (gemini-2.5-flash-lite) |
| Supabase local | ✅ Running (port 54321) — **shared with `~/work/smart-interview`** |

## Latest Engineering Milestone

**Branch/worktree:** `main` at `/home/pooh/work/toefl-mini`

- Synced `feat/ui-revamp` with simulation logic.
- Added simulation task planning utilities with tests for counts, ordering, prompt-bank sufficiency, mode parsing, duplicate prompt suppression, and near-duplicate prompt suppression.
- Added authenticated `GET /api/toefl/simulation/tasks` to fetch and build the required simulation task bank.
- Added dashboard entry points for guided practice and simulation mode.
- Updated practice mode to support full sequential simulation recording, scoring, and final score summary while preserving guided mode.
- Hardened prompt playback and recording lifecycle for simulation: no replay/transcript reveal, stale async guards, mic/runtime error handling, duplicate-recording prevention, placeholder TTS end fallback, and React StrictMode recorder auto-start fix.
- Added clickable simulation final-result rows linking successful items to `/toefl/attempt/[id]`, matching the history detail flow.
- **Implemented interview topic grouping:** The final 4 interview items in simulation are now guaranteed to be from the same `topic_domain`.
- Preserved phase-1 hardening already on `main`: score route validation, private bucket playback, attempt review audio, recording status, and itemized `scoring_details` review.

---

## Local Development Notes

**Shared Supabase Instance:** The local Supabase instance on port 54321 is shared with `~/work/smart-interview`. Both projects use the same local database, auth, and storage. This means:
- Starting one project's Supabase stops the other
- Schema changes affect both projects
- The `scoring_details` migration was applied automatically when Supabase started
- For isolated development, use separate Supabase Cloud projects (see Deployment Architecture below)

---

## Risks

1. **Gemini rate limits** — Mitigated with 3 retries + exponential backoff
2. **Audio placeholders** — All tasks use placeholder URLs; `AudioPlayer` falls back to browser TTS
3. **No retry loop yet** — Phase 2 feature (targeted retry, sentence-level retry)
4. **No profile update UI** — API exists but page is read-only
5. **Private recording playback** — ✅ Fixed. Score route stores storage path; attempt fetch generates signed URL. Verify bucket policies against the production Supabase project before launch.
6. **Simulation prompt bank dependency** — Simulation requires at least 7 `listen_repeat` and 4 `interview` tasks in Supabase; the API returns a blocking 404 if the bank is underfilled.
7. **Interview topic grouping implemented** — The planner now selects 4 unique interview prompts from one `topic_domain` for the final simulation items.

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

## Active Work: UI Revamp v2.0

**Branch:** `feat/ui-revamp`  
**Status:** Feature Complete / Merged to Main

### Completed
- [x] Design System v2.0 (`design-system/MASTER.md` & `LAYOUT.md`)
- [x] Tailwind v4 CSS variables for light/dark themes
- [x] Theme Provider with system preference + manual toggle
- [x] Bottom Navigation with elevated Practice button (FAB style)
- [x] Core UI components: Button, Card, ScoreDisplay, PageTransition
- [x] Landing page with hero, features, how-it-works, CTA
- [x] Dashboard with motivational stats, recent attempts
- [x] Practice page (Guided & Full 6-item Simulation)
- [x] Attempt review page with itemized breakdown
- [x] PWA setup (manifest.json, sw.js, and icons)
- [x] Integrated simulation logic (interview topic grouping)
- [x] Unit tests for new components (AudioPlayer, RecordButton)

### Remaining
- [ ] Final production build and Vercel deployment

---

## Follow-ups

- [ ] Deploy to Vercel + new Supabase Cloud project
- [x] **Save scoring details as JSONB** — flexible schema for review page itemized breakdown (evidence + tips per dimension); easy to extend without migrations
- [x] **UI Revamp v2.0** — PWA icons/service worker + merge to main
- [ ] Phase 2: Targeted retry + sentence-level retry
- [ ] Phase 2: Side-by-side attempt comparison
- [ ] Generate real audio prompts (replace TTS fallback)
- [ ] Score trend chart on dashboard
- [ ] Streak tracking + profile updates
