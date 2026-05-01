# Dashboard Redesign Design

Date: 2026-04-30
Project: `toefl-mini`
Scope: `/toefl` dashboard only

## Goal

Redesign the dashboard so the main action is obvious immediately, while preserving a premium, focused tone. The current dashboard spreads attention across the mode toggle, quick action card, stats cards, and recent history. The redesign should make the dashboard feel like a coaching surface, not a generic widget board.

## User Intent

- The dashboard should feel premium and focused.
- The strongest action should usually be guided practice, not simulation.
- Guided practice should be recommended because it is the best default lever for score improvement.
- The dashboard should work well on both phone and desktop.
- Above the fold, the user should see the main action plus a compact, meaningful insight layer.

## Chosen Direction

Use an action-plus-insight split layout.

- Left side on desktop: dominant coaching hero with the recommended next action.
- Right side on desktop: one focused insight card showing the user's weakest skill.
- On phone: stack the hero first, then the insight card directly below it.
- Supporting score signals should be compact and subordinate to the hero.

This direction preserves a premium feel while keeping the dashboard decisively action-first.

## Information Hierarchy

### Above the fold

1. Coaching hero
2. Weakest-skill insight card
3. Compact score signals

### Below the fold

1. Recent practice list
2. Secondary simulation entry point

The page should answer these questions in order:

1. What should I do now?
2. What should I improve?
3. What do my recent results say?

## Layout

### Desktop

- Top band uses a `2fr / 1fr` split.
- Left column is visually dominant and taller.
- Right column is denser and more analytical.
- Recent practice list spans full width below the top band.

### Phone

- Top band stacks vertically.
- Hero appears first.
- Insight card appears second.
- Compact score signals appear either inside the insight card footer or as a tight strip directly below it.
- Recent practice begins only after the full action-and-insight block.

## Hero Card

### Purpose

The hero is the primary decision surface. It should remove ambiguity and push the user toward guided practice by default.

### Content

- Eyebrow: `Best next step`
- Primary headline: `Start Guided Practice`
- Support line: specific reason tied to score improvement, for example:
  - `Best for lifting score consistency before your next simulation.`
- Optional time signal:
  - `8 to 10 min`
- Primary CTA:
  - `Start Guided Practice`
- Optional secondary affordance:
  - short explanation link or subdued secondary action

### Behavior

- Default recommendation is guided practice.
- The hero should not depend on a visible guided/simulation toggle.
- If adaptive recommendation logic exists later, the hero can vary its supporting copy, but the layout remains the same.

## Insight Card

### Purpose

The right-side card explains what the user should improve right now. It is not a general stats panel.

### Content

- Heading: `Weakest skill right now`
- Primary signal: one skill only
  - example: `Topic Development`
- Supporting evidence:
  - one short sentence
  - example: `Your lowest scoring dimension across recent attempts.`
- Optional micro-metric:
  - example: `Last 5 attempts: 2.4 avg`

### Rules

- Show one insight only.
- Avoid multiple charts or competing diagnostic blocks.
- Keep the card supportive and specific, not punitive.

## Compact Score Signals

The compact stats layer should show:

- Average score
- Last score
- Attempts this week

These should appear as one composed strip or compact panel, not three or four equally weighted dashboard cards. Their role is to reinforce the story, not compete with the hero.

## Simulation Placement

Simulation remains important but should move to a secondary position.

- It should not compete with the hero in the first visual read.
- It can appear as:
  - a smaller secondary card below the top band, or
  - a secondary CTA attached to the hero area

The simulation entry point should still be easy to find, but visually subordinate to guided practice.

## Recent Practice List

The recent practice section should become quieter.

- Reduce badge noise.
- Tighten row layout.
- Keep score legible.
- Preserve direct navigation into attempt detail.

This section should support reflection, not overpower the dashboard entry experience.

## Visual Direction

- Premium, focused, less toy-like
- Strong typography
- Deeper surface contrast
- Fewer equal-weight colored blocks
- One controlled accent treatment in the hero
- Cleaner desktop composition

The redesigned page should feel more like a coaching app and less like a generic mobile widget grid.

## Interaction Notes

- Remove the current top-level guided/simulation toggle from the dashboard.
- The main action should be recognizable in under two seconds.
- Desktop should use width intentionally instead of merely stretching mobile cards across a larger canvas.

## Error Handling and Empty States

- If no attempts exist, keep the same hierarchy:
  - hero first
  - insight card adapted to onboarding language
  - lightweight explanation of what guided practice improves
- If profile or attempts data is incomplete, the hero should still render with safe fallback copy.
- Insight card should gracefully degrade to a neutral coaching hint if weakest-skill data cannot be derived.

## Testing Expectations

Implementation should verify:

- guided practice is the dominant CTA on phone and desktop
- the top-level toggle is removed from the dashboard
- the hero, insight card, and compact stats render in the correct order
- simulation remains accessible but visually secondary
- recent practice still links correctly to attempt detail
- empty state preserves the same hierarchy without looking broken

## Non-Goals

- No changes to practice flow behavior
- No changes to score calculation logic
- No new recommendation engine in this iteration
- No redesign of history, profile, or attempt detail pages in this task

## Open Implementation Notes

- Reuse the existing design tokens where possible, but change composition and emphasis.
- The hero and insight cards should likely become dedicated dashboard-specific components rather than more inline blocks inside `src/app/toefl/page.tsx`.
- Compact stats should be redesigned as a unified module rather than continuing the current equal-card pattern.
