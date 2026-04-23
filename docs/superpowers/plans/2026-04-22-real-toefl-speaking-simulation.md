# Real TOEFL Speaking Simulation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TOEFL 2026-style Speaking simulation with 11 items, ordered as 7 Listen and Repeat tasks followed by 4 Take an Interview tasks, with no guided transcript/replay scaffolding during the simulation.

**Architecture:** Add pure simulation utilities for mode parsing and task planning, then expose those through a new authenticated internal API route. Refactor the existing practice page to branch between the current guided single-task flow and a simulation flow that records all 11 answers first, scores them sequentially at the end, and shows a compact summary.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase server client, Vitest, ESLint 9 flat config.

---

## File Structure

- Create `src/lib/toefl-simulation.ts`: constants, task type, practice mode parser, deterministic task planner.
- Create `src/lib/toefl-simulation.test.ts`: unit tests for parser and task planner.
- Create `src/app/api/toefl/simulation/tasks/route.ts`: authenticated route returning the ordered 11-task plan.
- Create `src/app/api/toefl/simulation/tasks/route.test.ts`: route tests for auth, success, and insufficient prompt bank.
- Modify `src/components/audio-player.tsx`: hide replay/transcript controls in simulation through optional props.
- Modify `src/app/toefl/page.tsx`: wire dashboard actions to guided and simulation practice URLs.
- Modify `src/app/toefl/practice/page.tsx`: implement mode-aware guided/simulation state machine.
- Modify `docs/ai/current-state.md`: record the simulation milestone after verification.

---

### Task 1: Simulation Utilities

**Files:**
- Create: `src/lib/toefl-simulation.ts`
- Create: `src/lib/toefl-simulation.test.ts`

- [ ] **Step 1: Write the failing utility tests**

Create `src/lib/toefl-simulation.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import {
  SIMULATION_INTERVIEW_COUNT,
  SIMULATION_LISTEN_REPEAT_COUNT,
  SIMULATION_TOTAL_ITEMS,
  buildSimulationTaskPlan,
  getPracticeMode,
} from './toefl-simulation';

const listenRepeatTasks = Array.from({ length: 8 }, (_, index) => ({
  id: `listen-${index + 1}`,
  category: 'listen_repeat',
  audio_url: `https://example.test/listen-${index + 1}.mp3`,
  transcript: `Listen sentence ${index + 1}`,
  difficulty: 'medium',
  prep_time_seconds: 0,
  record_time_seconds: 20,
}));

const interviewTasks = Array.from({ length: 5 }, (_, index) => ({
  id: `interview-${index + 1}`,
  category: 'interview',
  audio_url: `https://example.test/interview-${index + 1}.mp3`,
  transcript: `Interview question ${index + 1}`,
  difficulty: 'medium',
  prep_time_seconds: 0,
  record_time_seconds: 45,
}));

describe('toefl simulation utilities', () => {
  test('parses supported practice modes with guided as fallback', () => {
    expect(getPracticeMode(null)).toBe('guided');
    expect(getPracticeMode('')).toBe('guided');
    expect(getPracticeMode('guided')).toBe('guided');
    expect(getPracticeMode('simulation')).toBe('simulation');
    expect(getPracticeMode('unknown')).toBe('guided');
  });

  test('defines the TOEFL 2026 speaking simulation counts', () => {
    expect(SIMULATION_LISTEN_REPEAT_COUNT).toBe(7);
    expect(SIMULATION_INTERVIEW_COUNT).toBe(4);
    expect(SIMULATION_TOTAL_ITEMS).toBe(11);
  });

  test('builds seven listen-repeat tasks followed by four interview tasks', () => {
    const plan = buildSimulationTaskPlan([...interviewTasks, ...listenRepeatTasks]);

    expect(plan).toHaveLength(11);
    expect(plan.slice(0, 7).every(task => task.category === 'listen_repeat')).toBe(true);
    expect(plan.slice(7).every(task => task.category === 'interview')).toBe(true);
    expect(plan.map(task => task.simulationItemNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  test('throws when the prompt bank lacks enough listen-repeat tasks', () => {
    expect(() => buildSimulationTaskPlan([...listenRepeatTasks.slice(0, 6), ...interviewTasks]))
      .toThrow('Need at least 7 listen-repeat tasks and 4 interview tasks for simulation');
  });

  test('throws when the prompt bank lacks enough interview tasks', () => {
    expect(() => buildSimulationTaskPlan([...listenRepeatTasks, ...interviewTasks.slice(0, 3)]))
      .toThrow('Need at least 7 listen-repeat tasks and 4 interview tasks for simulation');
  });
});
```

- [ ] **Step 2: Run the utility tests to verify RED**

Run:

```bash
npx vitest run src/lib/toefl-simulation.test.ts
```

Expected: FAIL because `src/lib/toefl-simulation.ts` does not exist.

- [ ] **Step 3: Add the utility implementation**

Create `src/lib/toefl-simulation.ts`:

```ts
export const SIMULATION_LISTEN_REPEAT_COUNT = 7;
export const SIMULATION_INTERVIEW_COUNT = 4;
export const SIMULATION_TOTAL_ITEMS = SIMULATION_LISTEN_REPEAT_COUNT + SIMULATION_INTERVIEW_COUNT;

export type PracticeMode = 'guided' | 'simulation';
export type ToeflTaskCategory = 'listen_repeat' | 'interview';

export type SimulationSourceTask = {
  id: string;
  category: string;
  audio_url: string;
  transcript: string | null;
  difficulty: string | null;
  prep_time_seconds: number | null;
  record_time_seconds: number | null;
};

export type SimulationTask = SimulationSourceTask & {
  category: ToeflTaskCategory;
  simulationItemNumber: number;
};

const INSUFFICIENT_TASKS_MESSAGE = 'Need at least 7 listen-repeat tasks and 4 interview tasks for simulation';

export function getPracticeMode(value: string | null | undefined): PracticeMode {
  return value === 'simulation' ? 'simulation' : 'guided';
}

export function buildSimulationTaskPlan(tasks: SimulationSourceTask[]): SimulationTask[] {
  const listenRepeat = tasks.filter((task): task is SimulationTask => task.category === 'listen_repeat');
  const interview = tasks.filter((task): task is SimulationTask => task.category === 'interview');

  if (listenRepeat.length < SIMULATION_LISTEN_REPEAT_COUNT || interview.length < SIMULATION_INTERVIEW_COUNT) {
    throw new Error(INSUFFICIENT_TASKS_MESSAGE);
  }

  return [
    ...listenRepeat.slice(0, SIMULATION_LISTEN_REPEAT_COUNT),
    ...interview.slice(0, SIMULATION_INTERVIEW_COUNT),
  ].map((task, index) => ({
    ...task,
    simulationItemNumber: index + 1,
  }));
}
```

- [ ] **Step 4: Run the utility tests to verify GREEN**

Run:

```bash
npx vitest run src/lib/toefl-simulation.test.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add src/lib/toefl-simulation.ts src/lib/toefl-simulation.test.ts
git commit -m "feat: add TOEFL simulation utilities"
```

---

### Task 2: Simulation Task API

**Files:**
- Create: `src/app/api/toefl/simulation/tasks/route.ts`
- Create: `src/app/api/toefl/simulation/tasks/route.test.ts`
- Modify: `src/lib/toefl-simulation.ts`
- Test: `src/app/api/toefl/simulation/tasks/route.test.ts`

- [ ] **Step 1: Write the failing route tests**

Create `src/app/api/toefl/simulation/tasks/route.test.ts`:

```ts
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser, getSupabaseServer } from '@/lib/supabase-client';

const select = vi.fn();
const from = vi.fn(() => ({ select }));

vi.mock('@/lib/supabase-client', () => ({
  getAuthenticatedUser: vi.fn(),
  getSupabaseServer: vi.fn(() => ({ from })),
}));

function task(id: string, category: 'listen_repeat' | 'interview') {
  return {
    id,
    category,
    audio_url: `https://example.test/${id}.mp3`,
    transcript: `${category} prompt ${id}`,
    difficulty: 'medium',
    prep_time_seconds: 0,
    record_time_seconds: category === 'listen_repeat' ? 20 : 45,
  };
}

describe('TOEFL simulation tasks route', () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedUser).mockReset();
    vi.mocked(getSupabaseServer).mockClear();
    from.mockClear();
    select.mockReset();
  });

  test('requires an authenticated user', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost:3000/api/toefl/simulation/tasks') as never);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(from).not.toHaveBeenCalled();
  });

  test('returns seven listen-repeat tasks followed by four interview tasks', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' } as never);
    select.mockResolvedValue({
      data: [
        ...Array.from({ length: 8 }, (_, index) => task(`listen-${index + 1}`, 'listen_repeat')),
        ...Array.from({ length: 5 }, (_, index) => task(`interview-${index + 1}`, 'interview')),
      ],
      error: null,
    });

    const response = await GET(new Request('http://localhost:3000/api/toefl/simulation/tasks') as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(11);
    expect(data.slice(0, 7).every((row: { category: string }) => row.category === 'listen_repeat')).toBe(true);
    expect(data.slice(7).every((row: { category: string }) => row.category === 'interview')).toBe(true);
    expect(data.map((row: { simulationItemNumber: number }) => row.simulationItemNumber))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(from).toHaveBeenCalledWith('toefl_tasks');
    expect(select).toHaveBeenCalledWith('*');
  });

  test('returns 404 when the prompt bank cannot supply a full simulation', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' } as never);
    select.mockResolvedValue({
      data: [
        ...Array.from({ length: 6 }, (_, index) => task(`listen-${index + 1}`, 'listen_repeat')),
        ...Array.from({ length: 4 }, (_, index) => task(`interview-${index + 1}`, 'interview')),
      ],
      error: null,
    });

    const response = await GET(new Request('http://localhost:3000/api/toefl/simulation/tasks') as never);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'Need at least 7 listen-repeat tasks and 4 interview tasks for simulation',
    });
  });
});
```

- [ ] **Step 2: Run the route tests to verify RED**

Run:

```bash
npx vitest run src/app/api/toefl/simulation/tasks/route.test.ts
```

Expected: FAIL because `src/app/api/toefl/simulation/tasks/route.ts` does not exist.

- [ ] **Step 3: Export the insufficient-tasks message**

Modify `src/lib/toefl-simulation.ts`:

```ts
export const INSUFFICIENT_SIMULATION_TASKS_MESSAGE =
  'Need at least 7 listen-repeat tasks and 4 interview tasks for simulation';
```

Update `buildSimulationTaskPlan` to throw `INSUFFICIENT_SIMULATION_TASKS_MESSAGE`.

- [ ] **Step 4: Add the route implementation**

Create `src/app/api/toefl/simulation/tasks/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseServer } from '@/lib/supabase-client';
import { buildSimulationTaskPlan } from '@/lib/toefl-simulation';

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from('toefl_tasks').select('*');

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to load simulation tasks' }, { status: 500 });
  }

  try {
    return NextResponse.json(buildSimulationTaskPlan(shuffle(data)));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to build simulation tasks';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
```

- [ ] **Step 5: Run route and utility tests to verify GREEN**

Run:

```bash
npx vitest run src/lib/toefl-simulation.test.ts src/app/api/toefl/simulation/tasks/route.test.ts
```

Expected: PASS, 8 tests.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add src/lib/toefl-simulation.ts src/app/api/toefl/simulation/tasks/route.ts src/app/api/toefl/simulation/tasks/route.test.ts
git commit -m "feat: add simulation task API"
```

---

### Task 3: Audio Player Simulation Controls

**Files:**
- Modify: `src/components/audio-player.tsx`

- [ ] **Step 1: Add control props to the component**

Modify the props interface:

```ts
interface AudioPlayerProps {
  audioUrl: string;
  transcript?: string;
  showTranscript?: boolean;
  onTranscriptToggle?: () => void;
  autoPlay?: boolean;
  onEnded?: () => void;
  allowReplay?: boolean;
  allowTranscript?: boolean;
}
```

Update the function signature:

```ts
export function AudioPlayer({
  audioUrl,
  transcript,
  showTranscript,
  onTranscriptToggle,
  autoPlay,
  onEnded,
  allowReplay = true,
  allowTranscript = true,
}: AudioPlayerProps) {
```

- [ ] **Step 2: Hide replay and transcript controls when disabled**

Replace the replay button block with:

```tsx
{allowReplay && (
  <button
    onClick={() => {
      if (useTts) { stopSpeaking(); speak(); }
      else if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); setPlaying(true); }
    }}
    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
    title='Replay'
  >
    {useTts ? <Volume2 size={18} /> : <RotateCcw size={18} />}
  </button>
)}
```

Replace the transcript toggle condition with:

```tsx
{allowTranscript && transcript && onTranscriptToggle && (
```

Replace the transcript body condition with:

```tsx
{allowTranscript && showTranscript && transcript && (
```

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit Task 3**

Run:

```bash
git add src/components/audio-player.tsx
git commit -m "feat: support simulation audio controls"
```

---

### Task 4: Dashboard Entry Points

**Files:**
- Modify: `src/app/toefl/page.tsx`

- [ ] **Step 1: Wire guided and simulation navigation**

In `src/app/toefl/page.tsx`, change the Start Practice click handler to:

```tsx
onClick={() => router.push('/toefl/practice?mode=guided')}
```

Change the Guided segmented button to include:

```tsx
onClick={() => router.push('/toefl/practice?mode=guided')}
```

Change the Simulation segmented button to include:

```tsx
onClick={() => router.push('/toefl/practice?mode=simulation')}
```

Keep the existing visual styling.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 3: Commit Task 4**

Run:

```bash
git add src/app/toefl/page.tsx
git commit -m "feat: launch TOEFL simulation from dashboard"
```

---

### Task 5: Practice Page Simulation Flow

**Files:**
- Modify: `src/app/toefl/practice/page.tsx`
- Test: `src/lib/toefl-simulation.test.ts`

- [ ] **Step 1: Reuse the tested mode parser**

Import `useSearchParams` and simulation helpers:

```ts
import { useRouter, useSearchParams } from 'next/navigation';
import { getPracticeMode, SIMULATION_TOTAL_ITEMS, type PracticeMode, type SimulationTask } from '@/lib/toefl-simulation';
```

Inside `PracticePage`:

```ts
const searchParams = useSearchParams();
const mode = getPracticeMode(searchParams.get('mode'));
const isSimulation = mode === 'simulation';
```

- [ ] **Step 2: Extend page state**

Add these types near the existing types:

```ts
type RecordedSimulationAnswer = {
  task: SimulationTask;
  base64: string;
  mimeType: string;
};

type SimulationScoreResult = {
  itemNumber: number;
  task: SimulationTask;
  attemptId?: string;
  overallScore?: number;
  error?: string;
};
```

Add these state values:

```ts
const [simulationTasks, setSimulationTasks] = useState<SimulationTask[]>([]);
const [simulationIndex, setSimulationIndex] = useState(0);
const [simulationRecordings, setSimulationRecordings] = useState<RecordedSimulationAnswer[]>([]);
const [simulationResults, setSimulationResults] = useState<SimulationScoreResult[]>([]);
```

Set current task from mode:

```ts
const activeSimulationTask = simulationTasks[simulationIndex] ?? null;
const activeTask = isSimulation ? activeSimulationTask : task;
```

- [ ] **Step 3: Load tasks by mode**

Replace the current load-task `useEffect` with:

```ts
useEffect(() => {
  const url = isSimulation ? '/api/toefl/simulation/tasks' : '/api/toefl/tasks';
  fetch(url)
    .then(r => r.ok ? r.json() : r.json().then(body => Promise.reject(body)))
    .then(data => {
      if (data.error) { setError(data.error); return; }
      if (isSimulation) {
        setSimulationTasks(data);
        setTask(null);
      } else {
        setTask(data);
      }
      setStep('playing');
    })
    .catch(err => setError(err?.error || 'Failed to load task'));
}, [isSimulation]);
```

- [ ] **Step 4: Score one response through a helper**

Add a helper inside the component:

```ts
const submitScore = async (
  scoreTask: Task | SimulationTask,
  base64: string,
  scoreMode: PracticeMode
) => {
  const res = await fetch('/api/toefl/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audioBase64: base64,
      mimeType: 'audio/webm',
      taskId: scoreTask.id,
      taskCategory: scoreTask.category,
      taskTranscript: scoreTask.transcript,
      mode: scoreMode,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'Scoring failed' }));
    throw new Error(errData.error || 'Scoring failed. Please try again.');
  }

  return res.json();
};
```

- [ ] **Step 5: Branch recording completion**

Replace `handleRecordingComplete` with:

```ts
const handleRecordingComplete = async (_audioBlob: Blob, base64: string) => {
  if (!activeTask) return;

  if (!base64) {
    setError('Recording did not produce audio. Please try again.');
    setStep('record');
    return;
  }

  if (isSimulation) {
    const simulationTask = activeTask as SimulationTask;
    const nextRecordings = [
      ...simulationRecordings,
      { task: simulationTask, base64, mimeType: 'audio/webm' },
    ];
    setSimulationRecordings(nextRecordings);

    if (simulationIndex + 1 < simulationTasks.length) {
      setSimulationIndex(simulationIndex + 1);
      setShowText(false);
      setStep('playing');
      return;
    }

    setStep('scoring');
    const scoredResults: SimulationScoreResult[] = [];
    for (const recording of nextRecordings) {
      try {
        const data = await submitScore(recording.task, recording.base64, 'simulation');
        scoredResults.push({
          itemNumber: recording.task.simulationItemNumber,
          task: recording.task,
          attemptId: data.attempt.id,
          overallScore: data.scoring.overallScore,
        });
      } catch (err) {
        scoredResults.push({
          itemNumber: recording.task.simulationItemNumber,
          task: recording.task,
          error: err instanceof Error ? err.message : 'Scoring failed',
        });
      }
      setSimulationResults([...scoredResults]);
    }
    setStep('score');
    return;
  }

  setStep('scoring');
  try {
    const data = await submitScore(activeTask, base64, 'guided');
    setResult(data);
    setStep('score');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Scoring failed. Please try again.');
    setStep('record');
  }
};
```

- [ ] **Step 6: Render mode-aware labels and audio controls**

Use `activeTask` in place of `task` for headings and audio rendering.

Change the heading to:

```tsx
<h1 style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
  {activeTask?.category === 'listen_repeat' ? 'Listen and Repeat' : 'Take an Interview'}
</h1>
{isSimulation && (
  <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
    Simulation · Item {simulationIndex + 1} of {SIMULATION_TOTAL_ITEMS}
  </p>
)}
```

Pass simulation controls into `AudioPlayer`:

```tsx
<AudioPlayer
  audioUrl={activeTask.audio_url}
  transcript={activeTask.transcript ?? undefined}
  showTranscript={showText}
  onTranscriptToggle={isSimulation ? undefined : () => setShowText(!showText)}
  autoPlay={step === 'playing'}
  onEnded={handleAudioEnded}
  allowReplay={!isSimulation}
  allowTranscript={!isSimulation}
/>
```

Change the guided helper copy to render only when not simulation:

```tsx
{!isSimulation && step === 'playing' && (
  <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', fontSize: '14px' }}>
    Recording will start automatically when the prompt finishes
  </p>
)}
```

- [ ] **Step 7: Render simulation summary**

Before the existing guided `ScoreCard` block, add:

```tsx
{isSimulation && step === 'score' && (
  <div style={{ paddingBottom: '80px' }}>
    <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
      Simulation Complete
    </h2>
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      border: '3px solid rgba(79,70,229,0.15)',
      boxShadow: 'var(--shadow-clay-md)',
      marginBottom: '16px',
    }}>
      <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '36px', fontWeight: 700, color: 'var(--color-primary)' }}>
        {(() => {
          const scored = simulationResults.filter(item => typeof item.overallScore === 'number');
          if (scored.length === 0) return '—';
          return (scored.reduce((sum, item) => sum + (item.overallScore ?? 0), 0) / scored.length).toFixed(1);
        })()}
      </div>
      <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)' }}>
        Average score across {simulationResults.filter(item => typeof item.overallScore === 'number').length} scored items
      </p>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
      {simulationResults.map(item => (
        <div key={item.itemNumber} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '12px 14px',
          border: '2px solid rgba(79,70,229,0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-baloo)', fontWeight: 600 }}>Item {item.itemNumber}</div>
            <div style={{ fontFamily: 'var(--font-comic)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {item.task.category === 'listen_repeat' ? 'Listen and Repeat' : 'Take an Interview'}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '20px', fontWeight: 700, color: item.error ? '#EF4444' : 'var(--color-primary)' }}>
            {item.error ? 'Failed' : Number(item.overallScore).toFixed(1)}
          </div>
        </div>
      ))}
    </div>
    <button
      onClick={() => window.location.reload()}
      style={{
        width: '100%',
        background: 'var(--color-cta)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius-pill)',
        padding: '14px',
        fontFamily: 'var(--font-baloo)',
        fontWeight: 700,
        cursor: 'pointer',
        marginBottom: '10px',
      }}
    >
      Start Another Simulation
    </button>
    <button
      onClick={() => router.push('/toefl')}
      style={{
        width: '100%',
        background: 'white',
        color: 'var(--color-primary)',
        border: '3px solid var(--color-primary)',
        borderRadius: 'var(--radius-pill)',
        padding: '14px',
        fontFamily: 'var(--font-baloo)',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      Back to Home
    </button>
  </div>
)}
```

Change the guided `ScoreCard` condition to:

```tsx
{!isSimulation && step === 'score' && result && (
```

- [ ] **Step 8: Run focused and full checks**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all PASS. Build may retain the existing Next middleware/proxy warning.

- [ ] **Step 9: Commit Task 5**

Run:

```bash
git add src/app/toefl/practice/page.tsx src/components/audio-player.tsx src/app/toefl/page.tsx
git commit -m "feat: add TOEFL speaking simulation flow"
```

---

### Task 6: State Documentation and Final Verification

**Files:**
- Modify: `docs/ai/current-state.md`

- [ ] **Step 1: Update current state**

In `docs/ai/current-state.md`, update the Phase 1 or milestone section to include:

```md
## Latest Engineering Milestone

**Branch/worktree:** `main` at `/home/pooh/work/toefl-mini`

- Added TOEFL 2026-style Speaking simulation mode: 11 items, 7 Listen and Repeat followed by 4 Take an Interview.
- Simulation hides transcript/replay scaffolding, records all items first, then scores responses sequentially.
- Added authenticated simulation task-selection API and utility tests for mode parsing and task planning.
```

Move `Simulation mode (no replay, no transcript)` out of the Follow-ups list if it is still present.

- [ ] **Step 2: Run final verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected:

- `npm test`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS, allowing the pre-existing Next middleware/proxy warning.

- [ ] **Step 3: Commit Task 6**

Run:

```bash
git add docs/ai/current-state.md
git commit -m "docs: update state for speaking simulation"
```

---

## Self-Review

Spec coverage:

- 11-item full simulation: Task 1 constants, Task 2 API, Task 5 practice flow.
- 7 Listen and Repeat then 4 Interview: Task 1 planner and Task 2 route.
- No transcript/replay: Task 3 audio controls and Task 5 simulation props.
- No score feedback between items: Task 5 records all answers before scoring.
- Sequential scoring after item 11: Task 5 scoring loop.
- Existing DB schema: Task 5 uses `POST /api/toefl/score` with `mode = 'simulation'`; no migration task exists.
- Final verification: Task 6.

Placeholder scan:

- No `TBD`, `TODO`, or unspecified implementation steps are intentionally left in this plan.

Type consistency:

- `SimulationTask`, `PracticeMode`, `getPracticeMode`, and `buildSimulationTaskPlan` are defined in Task 1 and reused in later tasks.
- Route paths and file paths match the existing Next App Router layout.

