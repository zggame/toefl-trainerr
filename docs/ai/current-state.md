# TOEFL Speaking Trainer — Current State

**Project:** toefl-trainerr  
**Branch:** feat/toefl-phase1 (merged to main)  
**Tag:** `v0.2.0-alpha.1`  
**Last Updated:** 2026-04-22 (all recent changes pushed to origin/main)

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

---

## Active Work: UI Revamp v2.0

**Branch:** `feat/ui-revamp`  
**Worktree:** `.worktrees/ui-revamp`  
**Status:** Feature Complete / Ready for Merge

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
- [ ] Merge feat/ui-revamp into main
- [ ] Final production build and Vercel deployment

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
