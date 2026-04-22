# TOEFL Speaking Trainer — Current State

**Project:** toefl-trainerr  
**Branch:** feat/toefl-phase1 (merged to main)  
**Tag:** `v0.2.0-alpha.1`  
**Last Updated:** 2026-04-22 (all recent changes pushed to origin/main)

---

## What's Implemented (Phase 1 MVP)

### Core Practice Loop
- **Auth:** Google OAuth via Supabase Auth with middleware guards
- **Flow:** Play audio prompt (TTS fallback) → auto-start recording when prompt ends → AI scoring → save attempt
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
| Practice | `/toefl/practice` | ✅ Done |
| History | `/toefl/history` | ✅ Done |
| Attempt Review | `/toefl/attempt/[id]` | ✅ Done |
| Profile | `/toefl/profile` | ✅ Done |

### API Routes
- `GET /api/toefl/tasks` — random task
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
| Tests | ✅ 13/13 passing (`npm test`, 2026-04-22) |
| Gemini API | ✅ Verified live (gemini-2.5-flash-lite) |
| Supabase local | ✅ Running (port 54321) — **shared with `~/work/smart-interview`** |

## Latest Engineering Milestone

**Branch/worktree:** `main` at `/home/pooh/work/toefl-mini` (all recent edits in root, not worktree)

- Added ESLint 9 flat config and Vitest config excluding `.worktrees/**`.
- Added score-route tests for malformed requests, audio type validation, Gemini failure handling, previous-attempt ownership, and storage upload failure.
- Hardened `POST /api/toefl/score` validation/error handling and made recording upload awaited before attempt insert.
- Cleaned hook dependencies required by lint in auth, dashboard, audio player, and recorder components.
- **Added audio playback to attempt review page** — `<audio>` player shows when `audio_url` is available.
- **Added recording status indicator to ScoreCard** — shows "Recording will be available on the review page" with a direct link.
- **Fixed private bucket playback** — score route now stores the storage path (not public URL); attempt fetch generates a signed URL via `createSignedUrl()` for 1-hour playback. Works with private `toefl_recordings` bucket.
- **Added `scoring_details` JSONB column** — stores full per-dimension feedback (score, evidence, tip) as flexible JSON. Review page renders itemized breakdown with progress bars, evidence quotes, and actionable tips.

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
**Worktree:** `.worktrees/ui-revamp`  
**Status:** In Progress

### Design Decisions (Approved)
- **Vibe:** Energetic & Motivational (reduces anxiety)
- **Target:** High school & college students
- **Mobile:** Yes, PWA-first
- **Tech:** Tailwind CSS v4 + Dark Mode
- **Landing Page:** The "wow" moment with video/demo
- **Animations:** Playful (Duolingo-style bouncing)
- **Dark Mode:** Follow system preference with manual toggle
- **Bottom Nav:** Elevated center button for Practice (FAB style)
- **Card spacing:** Horizontal: 4px left/right margin so content breathes with a visible gap between card edge and screen edge. Vertical: `gap` prop defaults to `true` (12px bottom margin between stacked cards). Tailwind utility margins (`mb-*`) don't work on Card because it uses inline styles — use the `marginBottom` prop or `gap` prop instead

### Completed
- [x] Design System v2.0 (`design-system/MASTER.md`)
- [x] Tailwind v4 CSS variables for light/dark themes
- [x] Theme Provider with system preference + manual toggle
- [x] Bottom Navigation with elevated Practice button
- [x] Core UI components: Button, Card, ScoreDisplay, PageTransition
- [x] Landing page with hero, features, how-it-works, CTA
- [x] Dashboard with motivational stats, recent attempts
- [x] Practice page (anxiety-reducing, minimal interface)
- [x] Attempt review page with itemized breakdown
- [x] PWA manifest.json
- [x] History page (filter by mode, score badges, consistent design)
- [x] Profile page (stats grid, progress bars, focus area, theme toggle)
- [x] Dark mode toggle in Profile page (light/dark/system)
- [x] Page enter animations (slide-up)
- [x] Bottom nav tap feedback (active:scale-95)
- [x] Card component with style prop and gap prop

### Remaining
- [ ] PWA icons (real PNGs) and service worker
- [ ] Merge feat/ui-revamp into main

---

## Follow-ups

- [ ] Deploy to Vercel + new Supabase Cloud project
- [x] **Save scoring details as JSONB** — flexible schema for review page itemized breakdown (evidence + tips per dimension); easy to extend without migrations
- [ ] **UI Revamp v2.0** — PWA icons/service worker + merge to main
- [ ] Phase 2: Targeted retry + sentence-level retry
- [ ] Phase 2: Side-by-side attempt comparison
- [ ] Generate real audio prompts (replace TTS fallback)
- [ ] Score trend chart on dashboard
- [ ] Streak tracking + profile updates
- [ ] Simulation mode (no replay, no transcript)
