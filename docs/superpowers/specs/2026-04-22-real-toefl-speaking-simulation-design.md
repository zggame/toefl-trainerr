# Real TOEFL Speaking Simulation Design

## Goal

Build a simulation mode that behaves like the current TOEFL iBT Speaking section format after January 21, 2026: an 11-item speaking sequence using Listen and Repeat and Take an Interview tasks, with test-like pacing and no guided scaffolding during the exam flow.

## Source Baseline

Official ETS pages confirm the current Speaking section uses:

- Task types: Listen and Repeat, Take an Interview
- Number of Speaking items: 11
- Approximate base time: 8 minutes

Sources:

- `https://www.ets.org/toefl/ibt-enhancements/content.html`
- `https://www.ets.org/toefl/test-takers/ibt/about/content/speaking.html`
- `https://www.ets.org/toefl/score-users/ibt/about/content-structure.html`

ETS public pages do not clearly publish the exact split between the two Speaking task types. The app will implement the split already used in local TOEFL 2026 research notes and current prep references: 7 Listen and Repeat items followed by 4 Take an Interview items. Keep this split as a named constant so it can be changed quickly if ETS publishes a different breakdown.

## Scope

In scope:

- A full Speaking simulation launched from the dashboard.
- Exactly 11 tasks per simulation attempt.
- Ordered task plan:
  - Items 1-7: `listen_repeat`
  - Items 8-11: `interview`
- No prompt transcript reveal in simulation.
- No prompt replay in simulation.
- No retry or score feedback between items.
- Automatic progression through prompt playback and recording.
- End-of-simulation scoring and summary after all recordings are collected.
- Save every response as an existing `toefl_attempts` row with `mode = 'simulation'`.

Out of scope:

- A new database session table.
- Adaptive item selection.
- Official TOEFL scoring-scale migration.
- Full TOEFL Reading, Listening, or Writing simulation.
- Proctoring, lockdown, browser focus enforcement, or anti-cheat behavior.

## User Flow

### Dashboard Entry

The dashboard keeps guided practice as the default path. The existing Simulation control becomes active and launches `/toefl/practice?mode=simulation`.

The main Start Practice button continues to launch guided practice.

### Simulation Start

When the practice page loads with `mode=simulation`, the app fetches an ordered 11-task simulation plan before showing the first item.

The simulation screen shows:

- Mode label: Simulation
- Item progress: `Item N of 11`
- Task type: Listen and Repeat or Take an Interview
- A compact status line for the current phase

It does not show:

- Show Text
- Replay
- Guided helper copy
- Score card during the session

### Per-Item Flow

Each item follows the same state machine:

1. Prompt plays once automatically.
2. Recording starts after the prompt ends.
3. Recording stops when the user taps stop or the timer reaches zero.
4. The audio blob and task metadata are stored in local component state.
5. The app advances to the next item.

For Listen and Repeat, the prompt transcript remains hidden. For Take an Interview, the interview prompt transcript remains hidden as well; the learner answers only from audio, matching simulation behavior.

### End-of-Simulation Flow

After item 11 is recorded:

1. The app displays a scoring state for the whole simulation.
2. It submits the 11 recordings sequentially to `POST /api/toefl/score` with `mode = 'simulation'`.
3. It stores each returned attempt and scoring result.
4. It shows a summary page in the same route.

The summary shows:

- Average overall score across completed items.
- Count of completed items.
- Per-item list with task type, item number, and overall score.
- A button back to dashboard.
- A button to start another simulation.

If some scoring requests fail, the summary still appears for successfully scored items and shows a concise failure count. Failed items are not silently ignored.

## Architecture

### Constants and Utilities

Create a small simulation utility module with:

- `SIMULATION_LISTEN_REPEAT_COUNT = 7`
- `SIMULATION_INTERVIEW_COUNT = 4`
- `SIMULATION_TOTAL_ITEMS = 11`
- `getPracticeMode(value)` returning `guided` or `simulation`
- `buildSimulationTaskPlan(tasks)` validating enough tasks exist and returning ordered tasks

This keeps route parsing and task ordering testable without rendering the practice page.

### API

Add `GET /api/toefl/simulation/tasks`.

Behavior:

- Requires authenticated user, same as other TOEFL APIs.
- Fetches all `listen_repeat` tasks and all `interview` tasks.
- Randomizes within each category.
- Returns 7 listen-repeat tasks followed by 4 interview tasks.
- Returns `404` with a clear error if the prompt bank lacks enough tasks.

This is an internal app API, but it is still a new route. It does not change public database shape or external service contracts.

### Practice Page

Refactor `src/app/toefl/practice/page.tsx` enough to support two modes:

- Guided mode preserves the current single-task flow.
- Simulation mode uses an array of tasks and an item index.

Avoid introducing a new route unless the page becomes hard to read. The first implementation should keep behavior local to the existing practice route and extract only pure helper functions that need tests.

### Audio Player

Extend `AudioPlayer` with optional props:

- `allowReplay?: boolean`
- `allowTranscript?: boolean`

Defaults:

- `allowReplay = true`
- `allowTranscript = true`

Guided practice passes the defaults. Simulation passes both as `false`.

### Score Route

No route contract change is required. The route already accepts `mode = 'simulation'`. Simulation client code must send `mode: 'simulation'` for every item.

## Error Handling

Task loading:

- If the simulation task API returns an error, show a blocking error with a dashboard link.

Recording:

- If microphone permission fails, show a blocking error and do not advance the item.
- If a recording yields no base64 payload, stay on the item and show a retry message.

Scoring:

- Submit recordings sequentially to avoid overwhelming Gemini or storage.
- If one item fails, record that failure in local state and continue scoring remaining items.
- Summary must show both successes and failures.

## Testing

Add focused tests before implementation:

- Practice mode parser:
  - Missing mode returns guided.
  - `simulation` returns simulation.
  - Unknown mode returns guided.
- Simulation task planner:
  - Returns 7 listen-repeat followed by 4 interview tasks.
  - Throws or returns an error when either category lacks enough tasks.
- Simulation tasks API:
  - Requires authentication.
  - Returns ordered 11-task plan.
  - Returns `404` when prompt bank is insufficient.
- Existing score-route tests stay green and continue covering `mode` validation.

Run final verification:

- `npm test`
- `npm run lint`
- `npm run build`

## Deployment Risk

No database migration or production dependency is required. The main risk is user-perceived latency after item 11 because 11 Gemini scoring calls happen sequentially. This is intentional for MVP reliability; if latency is too high in manual testing, the next step is limited-concurrency scoring with a concurrency cap of 2.

## Rollback

Rollback is code-only:

- Disable the Simulation dashboard button or point it back to guided mode.
- Remove the new simulation task route and helper module.
- Keep existing guided practice untouched.

