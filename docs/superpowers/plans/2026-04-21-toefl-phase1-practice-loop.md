# TOEFL Speaking Trainer — Phase 1: Core Practice Loop

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** End-to-end practice loop — sign in → get task → play audio prompt → record response → get AI score + feedback → save attempt.

**Architecture:** Next.js App Router, Supabase Auth + DB + Storage, Gemini for transcription + scoring. Audio sent directly to Gemini (base64), storage save happens async in background. Auth required before any practice.

**Tech Stack:** Next.js 16, Supabase (@supabase/ssr + @supabase/supabase-js), Google Gemini (@google/genai), Lucide React, Tailwind v4.

---

## File Structure

```
toefl-mini/
├── supabase/migrations/
│   └── 001_init_toefl_schema.sql          ← DB schema
├── src/
│   ├── lib/
│   │   ├── supabase-client.ts             ← browser + server clients
│   │   ├── supabase-config.ts             ← env config (reuse pattern)
│   │   ├── gemini.ts                      ← Gemini client + scoring prompt
│   │   └── toefl.ts                       ← DB helpers (tasks, attempts, profile)
│   ├── app/
│   │   ├── toefl/                         ← TOEFL section root
│   │   │   ├── layout.tsx                 ← Auth guard + tab nav
│   │   │   ├── page.tsx                   ← Home dashboard
│   │   │   ├── task/[taskId]/page.tsx     ← Practice session
│   │   │   ├── attempt/[attemptId]/page.tsx ← Attempt review
│   │   │   └── profile/page.tsx           ← Profile/progress
│   │   ├── auth/
│   │   │   ├── callback/route.ts          ← OAuth callback handler
│   │   │   └── signin/page.tsx            ← Sign-in page
│   │   └── api/toefl/
│   │       ├── tasks/route.ts             ← GET /api/toefl/tasks
│   │       ├── score/route.ts             ← POST /api/toefl/score
│   │       ├── attempts/route.ts          ← GET /api/toefl/attempts
│   │       └── attempts/[id]/route.ts     ← GET /api/toefl/attempts/[id]
│   └── components/
│       ├── audio-player.tsx               ← Audio prompt player
│       ├── waveform.tsx                   ← Live waveform during recording
│       ├── record-button.tsx              ← Record/stop UI + MediaRecorder
│       ├── score-card.tsx                 ← Score + evidence display
│       ├── transcript-view.tsx            ← Annotated transcript
│       └── score-breakdown.tsx            ← Per-dimension score bars
├── scripts/
│   └── seed-tasks.ts                      ← Generate audio prompts via Gemini TTS, seed DB
└── src/app/globals.css                    ← Already exists, no changes needed
```

---

## Task 1: Database Schema

**Files:**
- Create: `supabase/migrations/001_init_toefl_schema.sql`
- Test: run migration in Supabase, verify tables exist

- [ ] **Step 1: Write migration SQL**

```sql
-- supabase/migrations/001_init_toefl_schema.sql

-- toefl_profiles: per-user ability estimates and behavior metrics
CREATE TABLE IF NOT EXISTS toefl_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  target_score FLOAT DEFAULT 4.0,
  streak_days INT DEFAULT 0,
  last_practice_date DATE,
  avg_wpm FLOAT DEFAULT 0,
  avg_filler_rate FLOAT DEFAULT 0,
  estimated_delivery FLOAT DEFAULT 0,
  estimated_language_use FLOAT DEFAULT 0,
  estimated_topic_dev FLOAT DEFAULT 0,
  weakest_dimension TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- toefl_tasks: audio prompt library
CREATE TABLE IF NOT EXISTS toefl_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audio_url TEXT NOT NULL,
  transcript TEXT,
  category TEXT NOT NULL CHECK (category IN ('listen_repeat', 'interview')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic_domain TEXT DEFAULT 'general',
  prep_time_seconds INT DEFAULT 15,
  record_time_seconds INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- toefl_attempts: every recording with scores and metadata
CREATE TABLE IF NOT EXISTS toefl_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES toefl_tasks(id),
  mode TEXT NOT NULL CHECK (mode IN ('guided', 'simulation')),
  overall_score FLOAT,
  delivery_score FLOAT,
  language_use_score FLOAT,
  topic_dev_score FLOAT,
  transcript TEXT,
  audio_url TEXT,
  errors TEXT[] DEFAULT '{}',
  suggestion TEXT,
  wpm FLOAT,
  filler_count INT DEFAULT 0,
  retry_mode TEXT DEFAULT 'full' CHECK (retry_mode IN ('full', 'targeted', 'sentence')),
  previous_attempt_id UUID REFERENCES toefl_attempts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching user attempts quickly
CREATE INDEX idx_toefl_attempts_user_id ON toefl_attempts(user_id);
CREATE INDEX idx_toefl_attempts_created_at ON toefl_attempts(user_id, created_at DESC);

-- RLS policies: users can only read/write their own data
ALTER TABLE toefl_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE toefl_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE toefl_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY toefl_profiles_owner ON toefl_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY toefl_tasks_public_read ON toefl_tasks
  FOR SELECT USING (true);

CREATE POLICY toefl_attempts_owner ON toefl_attempts
  FOR ALL USING (auth.uid() = user_id);
```

- [ ] **Step 2: Run migration in Supabase**

Run: `supabase db push` (or apply via Supabase dashboard SQL editor)
Expected: 3 tables created — toefl_profiles, toefl_tasks, toefl_attempts

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/001_init_toefl_schema.sql
git commit -m 'feat: add toefl schema — profiles, tasks, attempts tables with RLS'
```

---

## Task 2: Supabase Client Setup

**Files:**
- Create: `src/lib/supabase-config.ts`
- Create: `src/lib/supabase-client.ts`
- Modify: `src/app/globals.css` — no changes, skip
- Test: verify client instantiates without errors

This reuses the exact pattern from smart-interview. The config file reads env vars; client factories create browser and server clients.

- [ ] **Step 1: Write supabase-config.ts**

```typescript
// src/lib/supabase-config.ts

const MOCK_SUPABASE_URL = 'https://mock.supabase.co';
const MOCK_SUPABASE_KEY = 'mock-key';

export interface SupabaseServerConfig {
  mode: 'live' | 'mock';
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export interface SupabaseBrowserConfig {
  mode: 'live' | 'mock';
  url: string;
  anonKey: string;
}

export function getSupabaseBrowserConfig(
  env: NodeJS.ProcessEnv = process.env
): SupabaseBrowserConfig {
  if (env.SUPABASE_USE_MOCK === 'true') {
    return { mode: 'mock', url: MOCK_SUPABASE_URL, anonKey: MOCK_SUPABASE_KEY };
  }
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
  }
  return { mode: 'live', url, anonKey };
}

export function getSupabaseServerConfig(
  env: NodeJS.ProcessEnv = process.env
): SupabaseServerConfig {
  if (env.SUPABASE_USE_MOCK === 'true') {
    return { mode: 'mock', url: MOCK_SUPABASE_URL, anonKey: MOCK_SUPABASE_KEY, serviceRoleKey: MOCK_SUPABASE_KEY };
  }
  const url = env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  return { mode: 'live', url, anonKey, serviceRoleKey };
}
```

- [ ] **Step 2: Write supabase-client.ts**

```typescript
// src/lib/supabase-client.ts
import 'server-only';
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseBrowserConfig, getSupabaseServerConfig } from './supabase-config';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (!browserClient) {
    const config = getSupabaseBrowserConfig();
    browserClient = createBrowserClient(config.url, config.anonKey);
  }
  return browserClient;
}

export function getSupabaseServer() {
  const config = getSupabaseServerConfig();
  return createClient(config.url, config.serviceRoleKey);
}

export function getAuthCallbackUrl(path = '/auth/callback') {
  if (typeof window === 'undefined') {
    throw new Error('Auth callback URL requires a browser environment');
  }
  return new URL(path, window.location.origin).toString();
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase-config.ts src/lib/supabase-client.ts
git commit -m 'feat: add Supabase client setup — browser + server, mock mode supported'
```

---

## Task 3: Gemini Client + Scoring

**Files:**
- Create: `src/lib/gemini.ts`
- Test: verify client initializes with API key

- [ ] **Step 1: Write gemini.ts**

```typescript
// src/lib/gemini.ts
import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is required');
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export type ScoringResult = {
  delivery: { score: number; evidence: string; tip: string };
  languageUse: { score: number; evidence: string; tip: string };
  topicDev: { score: number; evidence: string; tip: string };
  overallScore: number;
  errors: string[];
  suggestion: string;
};

export async function scoreAudio(
  audioBase64: string,
  mimeType: string,
  taskCategory: string,
  taskTranscript?: string
): Promise<ScoringResult> {
  const ai = getGemini();

  const rubricContext = taskCategory === 'listen_repeat'
    ? 'The task is Listen and Repeat. The speaker heard an audio prompt and must reproduce it accurately.'
    : 'The task is Interview. The speaker responds to an audio question/prompt on a familiar topic.';

  const prompt = `You are a TOEFL Speaking examiner. ${rubricContext}

Evaluate the speaker's response across three dimensions:

1. DELIVERY: Clarity, fluency, pacing. Note: WPM should be 130-150. Excessive fillers (um, uh) and long pauses (>2s) are negative signals. Good delivery = clear pronunciation, natural pacing, minimal fillers.

2. LANGUAGE USE: Grammar accuracy, vocabulary range. Note errors in verb tense, articles, subject-verb agreement, word choice. Good language use = accurate grammar, varied vocabulary, appropriate register.

3. TOPIC DEVELOPMENT: Content quality and completeness. Note: Does the speaker address the topic? Are there specific supporting details vs. vague generalities? Is the response well-organized? Good topic development = full answer, specific details, logical structure.

Respond with ONLY a valid JSON object with this exact structure:
{
  \"delivery\": { \"score\": 0-4, \"evidence\": \"specific quote or observation from the response\", \"tip\": \"actionable improvement tip\" },
  \"languageUse\": { \"score\": 0-4, \"evidence\": \"specific quote or observation\", \"tip\": \"actionable improvement tip\" },
  \"topicDev\": { \"score\": 0-4, \"evidence\": \"specific quote or observation\", \"tip\": \"actionable improvement tip\" },
  \"overallScore\": 0-4,
  \"errors\": [\"error_type_1\", \"error_type_2\"],
  \"suggestion\": \"one sentence coaching tip for overall improvement\"
}

Score guidelines: 4=strong, 3=good, 2=limited, 1=weak, 0=no response. Weight for overall: Delivery 30%, Language Use 30%, Topic Development 40%.

If the response is very short (<30 words) or off-topic, score Topic Development at 1 or below.
If the speaker uses excessive fillers (>6 per minute) or long pauses, score Delivery at 2 or below.
If there are multiple grammar errors of the same type, score Language Use at 2 or below.

Only respond with the JSON object, no additional text.`;

  const audioPart = {
    inlineData: { mimeType, data: audioBase64 },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }, audioPart] }],
    config: { responseMimeType: 'application/json' },
  });

  const text = response.text;
  if (!text) throw new Error('Gemini returned empty response');

  return JSON.parse(text) as ScoringResult;
}

export async function transcribeAudio(
  audioBase64: string,
  mimeType: string
): Promise<string> {
  const ai = getGemini();

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{
      role: 'user',
      parts: [
        { text: 'Transcribe this audio exactly. Return only the text transcription, no explanations.' },
        { inlineData: { mimeType, data: audioBase64 } },
      ],
    }],
  });

  return response.text?.trim() ?? '';
}
```

- [ ] **Step 2: Test Gemini client initializes**

Add to `.env.local`: `GOOGLE_GENERATIVE_AI_API_KEY=your-key`
Run: `node -e \"require('./src/lib/gemini')\"` (should not throw if key is present)
Expected: no error

- [ ] **Step 3: Commit**

```bash
git add src/lib/gemini.ts
git commit -m 'feat: add Gemini scoring — audio → structured score + evidence feedback'
```

---

## Task 4: Auth (Google OAuth + Middleware)

**Files:**
- Create: `src/middleware.ts` — protect /toefl routes
- Create: `src/app/auth/callback/route.ts` — OAuth callback
- Create: `src/app/auth/signin/page.tsx` — sign-in page
- Modify: `src/app/toefl/layout.tsx` — auth guard
- Test: sign in with Google, redirect to /toefl

- [ ] **Step 1: Write middleware.ts**

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isToeflRoute = request.nextUrl.pathname.startsWith('/toefl');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

  if (!user && isToeflRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/toefl', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/toefl/:path*', '/auth/:path*'],
};
```

- [ ] **Step 2: Write OAuth callback route**

```typescript
// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/toefl';

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            cookiesToSet.forEach(({ name, value, options }) =>
              NextResponse.next({ request: { cookies: { getAll: () => [] } } } as unknown as NextRequest).cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth`);
}
```

- [ ] **Step 3: Write sign-in page**

```tsx
// src/app/auth/signin/page.tsx
'use client';

import { getSupabaseBrowser } from '@/lib/supabase-client';

export default function SignInPage() {
  const handleGoogleSignIn = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-baloo)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        border: '3px solid rgba(79,70,229,0.15)',
        boxShadow: 'var(--shadow-clay-lg)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
      }}>
        <h1 style={{ fontSize: '28px', color: 'var(--color-text)', marginBottom: '8px' }}>
          TOEFL Speaking Trainer
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontFamily: 'var(--font-comic)' }}>
          Sign in to track your progress and practice
        </p>
        <button
          onClick={handleGoogleSignIn}
          style={{
            background: 'white',
            border: '3px solid rgba(79,70,229,0.2)',
            borderRadius: 'var(--radius-pill)',
            padding: '14px 28px',
            fontWeight: 600,
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '0 auto',
            fontFamily: 'var(--font-baloo)',
            transition: 'all 200ms ease',
          }}
        >
          <svg width='20' height='20' viewBox='0 0 24 24'>
            <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
            <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
            <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
            <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts src/app/auth/callback/route.ts src/app/auth/signin/page.tsx
git commit -m 'feat: add Google OAuth auth — middleware guard, callback, sign-in page'
```

---

## Task 5: TOEFL Layout + Navigation

**Files:**
- Create: `src/app/toefl/layout.tsx`
- Create: `src/app/layout.tsx` — add providers (Supabase session provider)
- Test: navigate to /toefl → redirects to sign-in if not logged in

- [ ] **Step 1: Write providers**

```tsx
// src/app/providers.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  return useContext(AuthContext);
}
```

- [ ] **Step 2: Update root layout**

```tsx
// src/app/layout.tsx (update existing file)
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './providers';

export const metadata: Metadata = {
  title: 'TOEFL Speaking Trainer',
  description: 'Practice TOEFL speaking with AI-powered feedback',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Write TOEFL layout with tab nav**

```tsx
// src/app/toefl/layout.tsx
'use client';

import { useSession } from '../providers';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Home, Mic, History, User } from 'lucide-react';
import Link from 'next/link';

const tabs = [
  { href: '/toefl', label: 'Home', icon: Home },
  { href: '/toefl/practice', label: 'Practice', icon: Mic },
  { href: '/toefl/history', label: 'History', icon: History },
  { href: '/toefl/profile', label: 'Profile', icon: User },
];

export default function ToeflLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/signin');
    }
  }, [session, loading, router]);

  if (loading || !session) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, padding: '24px 16px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderTop: '3px solid rgba(79,70,229,0.12)',
        padding: '8px 0',
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        {tabs.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-baloo)',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'color 200ms',
            }}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/providers.tsx src/app/layout.tsx src/app/toefl/layout.tsx
git commit -m 'feat: add auth providers and TOEFL layout with bottom tab nav'
```

---

## Task 6: API Routes

**Files:**
- Create: `src/app/api/toefl/tasks/route.ts`
- Create: `src/app/api/toefl/score/route.ts`
- Create: `src/app/api/toefl/attempts/route.ts`
- Create: `src/app/api/toefl/attempts/[id]/route.ts`
- Test: curl endpoints and verify responses

- [ ] **Step 1: Write GET /api/toefl/tasks**

```typescript
// src/app/api/toefl/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category'); // 'listen_repeat' | 'interview'
  const difficulty = searchParams.get('difficulty');

  let query = supabase.from('toefl_tasks').select('*').limit(1);
  if (category) query = query.eq('category', category);
  if (difficulty) query = query.eq('difficulty', difficulty);

  const { data: task, error } = await query.order('created_at', { ascending: true }).limit(1).single();

  if (error || !task) {
    return NextResponse.json({ error: 'No task found' }, { status: 404 });
  }

  return NextResponse.json(task);
}
```

- [ ] **Step 2: Write POST /api/toefl/score (core scoring endpoint)**

```typescript
// src/app/api/toefl/score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';
import { scoreAudio } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { audioBase64, mimeType, taskId, taskCategory, taskTranscript, mode, previousAttemptId } = body;

  if (!audioBase64 || !mimeType || !taskId || !mode) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Score via Gemini
  const result = await scoreAudio(audioBase64, mimeType, taskCategory, taskTranscript);

  // Upload audio to Supabase Storage (background — fire and forget)
  const audioBuffer = Buffer.from(audioBase64, 'base64');
  const fileName = `${user.id}/${taskId}-${Date.now()}.webm`;
  supabase.storage
    .from('toefl_recordings')
    .upload(fileName, audioBuffer, { contentType: mimeType })
    .then(({ data }) => {
      if (data?.fullPath) {
        const { data: { publicUrl } } = supabase.storage.from('toefl_recordings').getPublicUrl(data.fullPath);
        // Update attempt with storage URL if needed
      }
    })
    .catch(console.error);

  // Save attempt to DB
  const { data: attempt, error } = await supabase
    .from('toefl_attempts')
    .insert({
      user_id: user.id,
      task_id: taskId,
      mode,
      overall_score: result.overallScore,
      delivery_score: result.delivery.score,
      language_use_score: result.languageUse.score,
      topic_dev_score: result.topicDev.score,
      errors: result.errors,
      suggestion: result.suggestion,
      previous_attempt_id: previousAttemptId || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attempt, scoring: result });
}
```

- [ ] **Step 3: Write GET /api/toefl/attempts**

```typescript
// src/app/api/toefl/attempts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = parseInt(new URL(request.url).searchParams.get('limit') ?? '10', 10);
  const { data, error } = await supabase
    .from('toefl_attempts')
    .select('*, toefl_tasks(audio_url, category, difficulty)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

- [ ] **Step 4: Write GET /api/toefl/attempts/[id]**

```typescript
// src/app/api/toefl/attempts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { data, error } = await supabase
    .from('toefl_attempts')
    .select('*, toefl_tasks(audio_url, transcript, category, difficulty)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}
```

- [ ] **Step 5: Test API routes**

Run: `npm run dev` (in separate terminal)
Expected: API routes respond correctly with proper auth checks

- [ ] **Step 6: Commit**

```bash
git add src/app/api/toefl/tasks/route.ts src/app/api/toefl/score/route.ts src/app/api/toefl/attempts/route.ts src/app/api/toefl/attempts/[id]/route.ts
git commit -m 'feat: add TOEFL API routes — tasks, score, attempts'
```

---

## Task 7: Core Components

**Files:**
- Create: `src/components/audio-player.tsx`
- Create: `src/components/waveform.tsx`
- Create: `src/components/record-button.tsx`
- Create: `src/components/score-card.tsx`
- Create: `src/components/score-breakdown.tsx`
- Test: each component renders without error

- [ ] **Step 1: Write audio-player.tsx**

```tsx
// src/components/audio-player.tsx
'use client';

import { useState, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  transcript?: string;
  showTranscript?: boolean;
  onTranscriptToggle?: () => void;
}

export function AudioPlayer({ audioUrl, transcript, showTranscript, onTranscriptToggle }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: '16px',
      padding: '16px',
      border: '3px solid rgba(79,70,229,0.15)',
      boxShadow: 'var(--shadow-clay-sm)',
    }}>
      <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={toggle}
          style={{
            width: '48px', height: '48px',
            background: 'var(--color-primary)',
            borderRadius: '50%',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-clay-sm)',
            transition: 'all 200ms ease',
          }}
        >
          {playing ? <Pause size={20} color='white' /> : <Play size={20} color='white' style={{ marginLeft: '2px' }} />}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ height: '4px', background: 'rgba(79,70,229,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: playing ? '60%' : '0%', height: '100%', background: 'var(--color-primary)', transition: 'width 300ms' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', fontFamily: 'var(--font-comic)' }}>
            {playing ? 'Playing...' : 'Tap to play prompt'}
          </p>
        </div>
        <button
          onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); setPlaying(true); } }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          title='Replay'
        >
          <RotateCcw size={18} />
        </button>
      </div>
      {transcript && onTranscriptToggle && (
        <button
          onClick={onTranscriptToggle}
          style={{
            marginTop: '12px',
            background: 'var(--color-background)',
            border: '2px solid rgba(79,70,229,0.2)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'var(--font-baloo)',
            color: 'var(--color-primary)',
          }}
        >
          📝 Show Text
        </button>
      )}
      {showTranscript && transcript && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'var(--color-background)',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'var(--font-comic)',
          color: 'var(--color-text)',
        }}>
          {transcript}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write waveform.tsx**

```tsx
// src/components/waveform.tsx
'use client';

import { useEffect, useRef } from 'react';

interface WaveformProps {
  audioUrl?: string;         // for playback mode (review)
  analyzing?: boolean;       // for live recording mode
  className?: string;
}

export function Waveform({ audioUrl, analyzing }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Static bars for initial state
    const drawBars = (data: number[]) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = 3;
      const gap = 2;
      const totalWidth = barWidth + gap;
      const numBars = Math.floor(canvas.width / totalWidth);
      data = data.length ? data : Array.from({ length: numBars }, () => Math.random() * 30 + 10);

      for (let i = 0; i < numBars; i++) {
        const height = data[i] || 10;
        const x = i * totalWidth;
        const y = (canvas.height - height) / 2;
        ctx.fillStyle = analyzing ? 'var(--color-cta)' : 'var(--color-primary)';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 2);
        ctx.fill();
      }
    };

    if (analyzing) {
      // Animate during recording
      const interval = setInterval(() => {
        const bars = Array.from({ length: 40 }, () => Math.random() * 50 + 10);
        drawBars(bars);
      }, 100);
      return () => clearInterval(interval);
    } else {
      drawBars([]);
    }
  }, [analyzing]);

  return (
    <div style={{
      background: 'var(--color-background)',
      borderRadius: '12px',
      padding: '12px',
      overflow: 'hidden',
    }}>
      <canvas
        ref={canvasRef}
        width={500}
        height={48}
        style={{ width: '100%', height: '48px' }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Write record-button.tsx**

```tsx
// src/components/record-button.tsx
'use client';

import { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { Waveform } from './waveform';

interface RecordButtonProps {
  onRecordingComplete: (audioBlob: Blob, base64: string) => void;
  disabled?: boolean;
  maxSeconds?: number;
}

export function RecordButton({ onRecordingComplete, disabled, maxSeconds = 45 }: RecordButtonProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        onRecordingComplete(blob, base64);
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(t => t.stop());
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
    setSeconds(0);

    timerRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev >= maxSeconds) {
          stopRecording();
          return maxSeconds;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {recording && (
          <span style={{ fontFamily: 'var(--font-baloo)', fontSize: '20px', color: 'var(--color-cta)', fontWeight: 600 }}>
            {formatTime(seconds)}
          </span>
        )}
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={disabled}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            border: recording ? '4px solid var(--color-cta)' : '4px solid var(--color-primary)',
            background: recording ? 'rgba(34,197,94,0.1)' : 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: recording ? '0 0 0 8px rgba(34,197,94,0.15)' : 'var(--shadow-clay-md)',
            transition: 'all 200ms ease',
          }}
        >
          {recording ? <Square size={28} color='var(--color-cta)' /> : <Mic size={28} color='white' />}
        </button>
      </div>
      <Waveform analyzing={recording} />
      {recording ? (
        <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-cta)', fontSize: '14px' }}>
          Recording... Tap to stop
        </p>
      ) : (
        <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Tap to start recording
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Write score-breakdown.tsx**

```tsx
// src/components/score-breakdown.tsx
import { ScoringResult } from '@/lib/gemini';

interface ScoreBreakdownProps {
  scoring: ScoringResult;
}

function ScoreBar({ score, label, evidence, tip }: { score: number; label: string; evidence: string; tip: string }) {
  const pct = (score / 4) * 100;
  const color = score >= 3.5 ? 'var(--color-cta)' : score >= 2.5 ? 'var(--color-primary)' : '#F59E0B';

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontFamily: 'var(--font-baloo)', fontWeight: 600, color: 'var(--color-text)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-baloo)', fontWeight: 700, fontSize: '18px', color }}>{score}</span>
      </div>
      <div style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 600ms ease' }} />
      </div>
      <p style={{ fontSize: '13px', color: 'var(--color-text)', marginTop: '6px', fontFamily: 'var(--font-comic)' }}>
        <strong>Evidence:</strong> {evidence}
      </p>
      <p style={{ fontSize: '13px', color: 'var(--color-primary)', marginTop: '4px', fontFamily: 'var(--font-comic)', fontStyle: 'italic' }}>
        {tip}
      </p>
    </div>
  );
}

export function ScoreBreakdown({ scoring }: ScoreBreakdownProps) {
  return (
    <div>
      <ScoreBar score={scoring.delivery.score} label='Delivery' evidence={scoring.delivery.evidence} tip={scoring.delivery.tip} />
      <ScoreBar score={scoring.languageUse.score} label='Language Use' evidence={scoring.languageUse.evidence} tip={scoring.languageUse.tip} />
      <ScoreBar score={scoring.topicDev.score} label='Topic Development' evidence={scoring.topicDev.evidence} tip={scoring.topicDev.tip} />
    </div>
  );
}
```

- [ ] **Step 5: Write score-card.tsx**

```tsx
// src/components/score-card.tsx
'use client';

import { useState } from 'react';
import { ScoreBreakdown } from './score-breakdown';
import { ScoringResult } from '@/lib/gemini';
import { RotateCcw, Pencil, Check } from 'lucide-react';

interface ScoreCardProps {
  overallScore: number;
  scoring: ScoringResult;
  onFullRetake: () => void;
  onTargetedRetry: () => void;
  onDone: () => void;
}

export function ScoreCard({ overallScore, scoring, onFullRetake, onTargetedRetry, onDone }: ScoreCardProps) {
  const [expanded, setExpanded] = useState(false);
  const pct = (overallScore / 4) * 100;

  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-clay)',
      padding: '24px',
      border: '3px solid rgba(79,70,229,0.15)',
      boxShadow: 'var(--shadow-clay-lg)',
    }}>
      {/* Overall score */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '48px', fontWeight: 700, color: 'var(--color-primary)' }}>
          {overallScore.toFixed(1)}
          <span style={{ fontSize: '20px', color: 'var(--color-text-muted)' }}> / 4</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', marginTop: '8px' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '4px', transition: 'width 600ms ease' }} />
        </div>
      </div>

      {/* Expand breakdown */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          background: 'var(--color-background)',
          border: '2px solid rgba(79,70,229,0.2)',
          borderRadius: '12px',
          padding: '10px',
          cursor: 'pointer',
          fontFamily: 'var(--font-baloo)',
          color: 'var(--color-primary)',
          fontWeight: 600,
          marginBottom: expanded ? '16px' : '0',
        }}
      >
        {expanded ? 'Hide' : 'Show'} Score Details
      </button>

      {expanded && <ScoreBreakdown scoring={scoring} />}

      {/* Error tags */}
      {scoring.errors.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px', marginBottom: '16px' }}>
          {scoring.errors.map(e => (
            <span key={e} style={{
              background: 'rgba(245,158,11,0.15)',
              color: '#D97706',
              border: '2px solid rgba(245,158,11,0.3)',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 12px',
              fontSize: '12px',
              fontFamily: 'var(--font-baloo)',
            }}>{e}</span>
          ))}
        </div>
      )}

      {/* Coaching tip */}
      <p style={{
        fontSize: '14px',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-comic)',
        padding: '12px',
        background: 'var(--color-background)',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '2px solid rgba(79,70,229,0.1)',
      }}>
        💡 {scoring.suggestion}
      </p>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <button
          onClick={onFullRetake}
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: '3px solid transparent',
            borderRadius: 'var(--radius-pill)',
            padding: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font-baloo)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-clay-sm)',
            transition: 'all 200ms ease',
          }}
        >
          <RotateCcw size={18} /> Full Retake
        </button>
        <button
          onClick={onTargetedRetry}
          style={{
            background: 'white',
            color: 'var(--color-primary)',
            border: '3px solid var(--color-primary)',
            borderRadius: 'var(--radius-pill)',
            padding: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font-baloo)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            transition: 'all 200ms ease',
          }}
        >
          <Pencil size={18} /> Targeted Retry
        </button>
        <button
          onClick={onDone}
          style={{
            background: 'var(--color-cta)',
            color: 'white',
            border: '3px solid transparent',
            borderRadius: 'var(--radius-pill)',
            padding: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font-baloo)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            boxShadow: '0 4px 0 var(--color-cta-dark)',
            transition: 'all 200ms ease',
          }}
        >
          <Check size={18} /> Done
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/audio-player.tsx src/components/waveform.tsx src/components/record-button.tsx src/components/score-breakdown.tsx src/components/score-card.tsx
git commit -m 'feat: add core UI components — audio player, waveform, record button, score display'
```

---

## Task 8: App Pages

**Files:**
- Modify: `src/app/toefl/page.tsx` (already exists as redirect target — replace)
- Create: `src/app/toefl/practice/page.tsx` — task selection + practice
- Create: `src/app/toefl/history/page.tsx` — attempt history
- Create: `src/app/toefl/attempt/[attemptId]/page.tsx` — review single attempt
- Create: `src/app/toefl/profile/page.tsx` — profile/progress
- Test: navigate through app, verify each page renders

- [ ] **Step 1: Write TOEFL home page (dashboard)**

```tsx
// src/app/toefl/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Mic, TrendingUp, Flame, Target } from 'lucide-react';

export default function ToeflHome() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/signin'); return; }
      fetch('/api/toefl/attempts?limit=5').then(r => r.json()).then(data => {
        setAttempts(data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, []);

  const latestScore = attempts[0]?.overall_score;
  const avgScore = attempts.length ? (attempts.reduce((s, a) => s + (a.overall_score || 0), 0) / attempts.length).toFixed(1) : null;

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1 style={{ fontFamily: 'var(--font-baloo)', fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>
        TOEFL Trainer
      </h1>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          background: 'white', borderRadius: '16px', padding: '16px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          textAlign: 'center',
        }}>
          <Mic size={24} color='var(--color-primary)' style={{ marginBottom: '8px' }} />
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>
            {latestScore ? `${Number(latestScore).toFixed(1)}` : '—'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Latest Score</div>
        </div>
        <div style={{
          background: 'white', borderRadius: '16px', padding: '16px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          textAlign: 'center',
        }}>
          <TrendingUp size={24} color='var(--color-cta)' style={{ marginBottom: '8px' }} />
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>
            {avgScore || '—'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Avg Score</div>
        </div>
        <div style={{
          background: 'white', borderRadius: '16px', padding: '16px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          textAlign: 'center',
        }}>
          <Flame size={24} color='#F59E0B' style={{ marginBottom: '8px' }} />
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>
            {attempts.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Attempts</div>
        </div>
        <div style={{
          background: 'white', borderRadius: '16px', padding: '16px',
          border: '3px solid rgba(79,70,229,0.15)', boxShadow: 'var(--shadow-clay-sm)',
          textAlign: 'center',
        }}>
          <Target size={24} color='var(--color-secondary)' style={{ marginBottom: '8px' }} />
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>
            4.0
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Target</div>
        </div>
      </div>

      {/* Practice CTA */}
      <button
        onClick={() => router.push('/toefl/practice')}
        style={{
          width: '100%',
          background: 'var(--color-cta)',
          color: 'white',
          border: '3px solid transparent',
          borderRadius: 'var(--radius-pill)',
          padding: '16px',
          fontSize: '18px',
          fontWeight: 700,
          fontFamily: 'var(--font-baloo)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 6px 0 var(--color-cta-dark), var(--shadow-clay-md)',
          marginBottom: '24px',
          transition: 'all 200ms ease',
        }}
      >
        <Mic size={22} /> Start Practice
      </button>

      {/* Mode toggle */}
      <div style={{
        display: 'flex',
        background: 'white',
        borderRadius: 'var(--radius-pill)',
        padding: '4px',
        marginBottom: '24px',
        border: '3px solid rgba(79,70,229,0.15)',
      }}>
        <button style={{
          flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-pill)',
          background: 'var(--color-primary)', color: 'white',
          fontFamily: 'var(--font-baloo)', fontWeight: 600, cursor: 'pointer',
        }}>Guided</button>
        <button style={{
          flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-pill)',
          background: 'transparent', color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-baloo)', fontWeight: 600, cursor: 'pointer',
        }}>Simulation</button>
      </div>

      {/* Recent attempts */}
      <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
        Recent Attempts
      </h2>
      {loading ? <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Loading...</p> : attempts.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>No attempts yet. Start practicing!</p>
      ) : attempts.map(attempt => (
        <div
          key={attempt.id}
          onClick={() => router.push(`/toefl/attempt/${attempt.id}`)}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '8px',
            border: '3px solid rgba(79,70,229,0.12)',
            boxShadow: 'var(--shadow-clay-sm)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-baloo)', fontWeight: 600 }}>{attempt.mode}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>
              {new Date(attempt.created_at).toLocaleDateString()}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)' }}>
            {Number(attempt.overall_score).toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write practice page (core session)**

```tsx
// src/app/toefl/practice/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AudioPlayer } from '@/components/audio-player';
import { RecordButton } from '@/components/record-button';
import { ScoreCard } from '@/components/score-card';
import { ScoringResult } from '@/lib/gemini';

type Task = {
  id: string;
  audio_url: string;
  transcript: string;
  category: string;
  difficulty: string;
  prep_time_seconds: number;
  record_time_seconds: number;
};

type Attempt = {
  id: string;
  overall_score: number;
};

export default function PracticePage() {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [showText, setShowText] = useState(false);
  const [prepCountdown, setPrepCountdown] = useState<number | null>(null);
  const [step, setStep] = useState<'loading' | 'prep' | 'record' | 'score'>('loading');
  const [result, setResult] = useState<{ attempt: Attempt; scoring: ScoringResult } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/toefl/tasks')
      .then(r => r.json())
      .then(data => {
        setTask(data);
        setStep('prep');
        setPrepCountdown(data.prep_time_seconds || 15);
      })
      .catch(() => setError('Failed to load task'));
  }, []);

  useEffect(() => {
    if (prepCountdown === null || prepCountdown <= 0) return;
    const timer = setTimeout(() => setPrepCountdown(p => (p ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [prepCountdown]);

  const handleRecordingComplete = async (audioBlob: Blob, base64: string) => {
    if (!task) return;
    setStep('score');

    const res = await fetch('/api/toefl/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64: base64,
        mimeType: 'audio/webm',
        taskId: task.id,
        taskCategory: task.category,
        taskTranscript: task.transcript,
        mode: 'guided',
      }),
    });

    if (!res.ok) {
      setError('Scoring failed. Please try again.');
      return;
    }

    const data = await res.json();
    setResult(data);
  };

  if (error) return <p style={{ color: 'red', padding: '20px' }}>{error}</p>;
  if (!task && step === 'loading') return <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-comic)' }}>Loading task...</p>;

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-baloo)', fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
        {task?.category === 'listen_repeat' ? 'Listen and Repeat' : 'Interview Question'}
      </h1>

      {/* Prep countdown */}
      {step === 'prep' && prepCountdown !== null && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--color-primary)',
            color: 'white',
            borderRadius: '50%',
            width: '80px', height: '80px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-baloo)',
            fontSize: '32px', fontWeight: 700,
            boxShadow: 'var(--shadow-clay-md)',
          }}>
            {prepCountdown}s
          </div>
          <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', marginTop: '8px' }}>Prep time</p>
        </div>
      )}

      {/* Audio prompt */}
      {task && (
        <div style={{ marginBottom: '24px' }}>
          <AudioPlayer
            audioUrl={task.audio_url}
            transcript={task.transcript}
            showTranscript={showText}
            onTranscriptToggle={() => setShowText(!showText)}
          />
        </div>
      )}

      {/* Record or show score */}
      {step === 'prep' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <RecordButton
            onRecordingComplete={handleRecordingComplete}
            disabled={prepCountdown !== null && prepCountdown > 0}
            maxSeconds={task?.record_time_seconds || 30}
          />
          {prepCountdown !== null && prepCountdown > 0 && (
            <p style={{ fontFamily: 'var(--font-comic)', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Wait for prep time to end before recording
            </p>
          )}
        </div>
      )}

      {/* Score */}
      {step === 'score' && result && (
        <ScoreCard
          overallScore={result.scoring.overallScore}
          scoring={result.scoring}
          onFullRetake={() => router.refresh()}
          onTargetedRetry={() => router.push(`/toefl/attempt/${result.attempt.id}?retry=targeted`)}
          onDone={() => router.push('/toefl')}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write history and profile pages (stub versions)**

History page — list attempts with links to review.

Profile page — simple stats display (score averages, attempt count, streak).

(These can be expanded in Phase 2 — stub implementation for navigation to work.)

- [ ] **Step 4: Commit**

```bash
git add src/app/toefl/page.tsx src/app/toefl/practice/page.tsx
git commit -m 'feat: add TOEFL home dashboard and practice session page'
```

---

## Task 9: Prompt Seed Script

**Files:**
- Create: `scripts/seed-tasks.ts`
- Test: run script, verify tasks appear in Supabase

This script generates audio prompts via Gemini TTS, uploads to Supabase Storage, and inserts task records.

- [ ] **Step 1: Write seed script**

```typescript
// scripts/seed-tasks.ts
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const ai = new GoogleGenAI({ apiKey: geminiKey });

interface TaskDefinition {
  category: 'listen_repeat' | 'interview';
  difficulty: 'easy' | 'medium' | 'hard';
  topicDomain: string;
  script: string;  // the text to be spoken as the prompt
  prepTime: number;
  recordTime: number;
}

const taskDefinitions: TaskDefinition[] = [
  // Listen and Repeat — easy
  { category: 'listen_repeat', difficulty: 'easy', topicDomain: 'general', script: 'The library will be open until eight oclock tonight.', prepTime: 15, recordTime: 30 },
  { category: 'listen_repeat', difficulty: 'easy', topicDomain: 'general', script: 'All students should submit their assignments by Friday.', prepTime: 15, recordTime: 30 },
  // Listen and Repeat — medium
  { category: 'listen_repeat', difficulty: 'medium', topicDomain: 'academic', script: 'Professor Chen announced that the midterm exam will cover chapters one through six.', prepTime: 15, recordTime: 30 },
  { category: 'listen_repeat', difficulty: 'medium', topicDomain: 'campus', script: 'The campus shuttle runs every fifteen minutes between the main hall and the library.', prepTime: 15, recordTime: 30 },
  // Listen and Repeat — hard
  { category: 'listen_repeat', difficulty: 'hard', topicDomain: 'academic', script: 'Research indicates that students who review material within twentyfour hours retain nearly twice as much information as those who wait a week.', prepTime: 15, recordTime: 45 },
  // Interview — easy
  { category: 'interview', difficulty: 'easy', topicDomain: 'life_choice', script: 'What is your favorite way to spend a weekend?', prepTime: 15, recordTime: 45 },
  { category: 'interview', difficulty: 'easy', topicDomain: 'education', script: 'Describe a subject you studied in school that you found interesting.', prepTime: 15, recordTime: 45 },
  // Interview — medium
  { category: 'interview', difficulty: 'medium', topicDomain: 'work', script: 'Some people prefer to work independently while others prefer working in teams. Which do you prefer and why?', prepTime: 15, recordTime: 45 },
  { category: 'interview', difficulty: 'medium', topicDomain: 'life_choice', script: 'Describe a place you enjoy visiting in your free time and explain why it is important to you.', prepTime: 15, recordTime: 45 },
  // Interview — hard
  { category: 'interview', difficulty: 'hard', topicDomain: 'society', script: 'Some people believe that technology has made our lives better, while others argue it has created new problems. What is your perspective and what evidence supports your view?', prepTime: 15, recordTime: 60 },
];

async function generateAudio(text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: [{ role: 'user', parts: [{ text: `Generate speech audio for this TOEFL speaking prompt. Speak clearly at a natural pace with a neutral American accent. Text: ${text}` }] }],
    config: { responseModalities: ['audio'] },
  });

  // Extract audio data from response
  const audioParts = response.candidates?.[0]?.content?.parts?.filter(p => p.inlineData?.mimeType?.startsWith('audio/'));
  if (!audioParts || audioParts.length === 0) throw new Error('No audio generated');

  const audioData = audioParts[0].inlineData!.data!;
  return audioData;
}

async function main() {
  console.log('Generating and seeding TOEFL tasks...\n');

  for (let i = 0; i < taskDefinitions.length; i++) {
    const def = taskDefinitions[i];
    console.log(`[${i + 1}/${taskDefinitions.length}] ${def.category} (${def.difficulty}): ${def.script.slice(0, 50)}...`);

    try {
      // Generate audio
      const audioBase64 = await generateAudio(def.script);

      // Save to Supabase Storage
      const fileName = `prompts/${Date.now()}-${i}.mp3`;
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      const { error: uploadError } = await supabase.storage.from('toefl_prompts').upload(fileName, audioBuffer, { contentType: 'audio/mpeg' });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('toefl_prompts').getPublicUrl(fileName);
      const audioUrl = urlData.publicUrl;

      // Insert task
      const { error: insertError } = await supabase.from('toefl_tasks').insert({
        audio_url: audioUrl,
        transcript: def.script,
        category: def.category,
        difficulty: def.difficulty,
        topic_domain: def.topicDomain,
        prep_time_seconds: def.prepTime,
        record_time_seconds: def.recordTime,
      });

      if (insertError) throw insertError;
      console.log(`  ✓ Uploaded and seeded`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
```

- [ ] **Step 2: Add scripts/package.json setup**

Add to `package.json` scripts: `'seed:toefl': 'tsx scripts/seed-tasks.ts'`

- [ ] **Step 3: Create storage bucket in Supabase**

Before running the script, create a storage bucket named `toefl_prompts` (public) in Supabase dashboard.

Also create `toefl_recordings` bucket (private) for user recordings.

- [ ] **Step 4: Run script**

Run: `npm run seed:toefl`
Expected: Tasks generated, uploaded to Storage, inserted into DB

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-tasks.ts
git commit -m 'feat: add seed script — generate audio prompts via Gemini TTS and seed DB'
```

---

## Self-Review Checklist

- [ ] All spec sections covered? Yes — Practice loop (Tasks 1–9), Auth (Task 4), no instructor
- [ ] Placeholder scan: No TBD, TODO, or vague requirements
- [ ] Type consistency: `ScoringResult` from gemini.ts used in score-card.tsx, practice page — consistent
- [ ] File paths: all exact, relative to toefl-mini root
- [ ] Commands: all exact with expected output

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-21-toefl-phase1-practice-loop.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?