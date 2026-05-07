# TOEFL Bright Theme Rollout Design

Date: 2026-05-06
Project: `toefl-mini`
Branch/worktree: `feat/desktop-dashboard-redesign` at `/home/pooh/work/toefl-mini/tmp-worktree/desktop-redesign`
Scope: TOEFL app pages under `/toefl`

## Goal

Extend the selected bright dashboard visual system across TOEFL pages so users do not see mixed light and dark surfaces. The current dashboard target is a bright, student-friendly shell. Other TOEFL pages can still inherit global dark theme variables, which creates inconsistent pages when the saved theme or system theme is dark.

## Problem

The app has a global theme provider with `light`, `dark`, and `system`. That is useful globally, but it conflicts with the selected TOEFL dashboard direction:

- Dashboard shell, sidebar, and hero are explicitly bright.
- Some cards and supporting components still use `var(--color-bg-elevated)` and `var(--color-text-*)`.
- In dark mode, those variables turn cards dark while surrounding dashboard areas remain bright.
- Other `/toefl/*` pages can show similar mixed visual language.

Mixed theme is worse than a deliberate bright-only TOEFL experience.

## Design Decision

Lock the TOEFL app section to the bright visual system for this release.

This does not remove the global theme provider from the app. It scopes the TOEFL product area so `/toefl`, `/toefl/practice`, `/toefl/history`, `/toefl/profile`, and `/toefl/attempt/[id]` render with the same bright surfaces regardless of global dark/system preference.

## Visual System

Use the dashboard reference as the source of truth:

- Outer app background: warm off-white.
- Main surfaces: white cards with soft borders and shadows.
- Primary action: indigo.
- Secondary exam/simulation action: orange.
- Improvement and positive progress: teal/green.
- Text: deep navy on light surfaces.
- No dark cards inside the TOEFL section unless a full dark theme is intentionally designed later.

## Layout Rules

### Shared TOEFL Shell

All TOEFL pages should sit inside a bright scoped wrapper. The wrapper should set light theme variables locally so existing components continue to work without hand-patching every usage.

The scope should cover:

- `/toefl`
- `/toefl/practice`
- `/toefl/history`
- `/toefl/profile`
- `/toefl/attempt/[attemptId]`

### Dashboard

Keep the current selected dashboard layout:

- Persistent desktop sidebar.
- Main content uses two content columns after the sidebar.
- Hero and recent practice in the left content column.
- Improvement, stats, and simulation in the right content column.
- Recent practice shows a compact 3-row preview.
- Simulation card fills the lower-right row so the page does not look unfinished.

### Non-Dashboard Pages

Do not redesign every page from scratch in this pass. Apply the shared bright theme first, then make only narrow visual corrections where dark variables would still leak through.

Expected page behavior:

- History: bright filters, white attempt cards, readable navy text.
- Practice: bright prompt/scoring cards and light loading/error states.
- Profile: bright stats and settings cards; no user-facing dark/system picker for TOEFL if the TOEFL area is intentionally bright-only.
- Attempt review: bright score, transcript, audio, and feedback cards.

## Theme Behavior

The global theme provider may continue to exist for the broader app, but the TOEFL section should override its visual tokens locally.

If the user has selected dark mode globally:

- `/toefl/*` remains bright.
- Cards remain white.
- Text remains readable navy/gray.
- Bottom navigation remains bright on mobile.

The profile page should not offer a TOEFL dark mode toggle until a full TOEFL dark design exists.

## Implementation Approach

1. Add a `toefl-bright-scope` wrapper in `src/app/toefl/layout.tsx`.
2. Define `.toefl-bright-scope` and `.dark .toefl-bright-scope` tokens in `src/app/globals.css`.
3. Remove or replace the TOEFL profile appearance picker so it does not imply supported dark mode for TOEFL pages.
4. Keep dashboard-specific explicit light surfaces that already match the selected PNG.
5. Add regression coverage that verifies the bright scope exists and that the profile page no longer exposes dark/system TOEFL theme choices.

## Testing Expectations

Run:

- Changed regression test for TOEFL bright theme guardrails.
- Full `npm test`.
- `npm run lint`.
- `npm run build`.

Manual visual check:

- Open the app with global dark theme active.
- Verify `/toefl`, `/toefl/history`, `/toefl/practice`, `/toefl/profile`, and an attempt detail page stay consistently bright.

## Non-Goals

- Do not design a full TOEFL dark theme in this pass.
- Do not change API contracts, auth behavior, scoring behavior, or database schema.
- Do not redesign non-TOEFL landing/auth pages.
- Do not introduce a new production dependency.

## Risks

- Users who intentionally prefer dark mode will see TOEFL pages in bright mode until a full dark design exists.
- Some shared components may still use global variables outside the TOEFL scope; this is acceptable if they render inside the bright scope and inherit the local token override.
- Profile theme preferences may still affect non-TOEFL pages if the global provider remains unchanged.

## Rollback Plan

Remove the `toefl-bright-scope` wrapper and its CSS token overrides. Restore the profile appearance picker if needed. Dashboard-specific bright surfaces can remain because they are part of the selected dashboard design.
