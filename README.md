# TOEFL Speaking Trainer

AI-powered TOEFL speaking practice app with timed tasks, multi-dimensional scoring, and a targeted retry loop.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 + Claymorphism design system
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** Google Gemini (scoring + transcription)
- **Rate Limiting:** Upstash Redis

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Supabase, Gemini, and Upstash credentials

# Run the dev server
npm run dev
```

## Project Structure

```
src/
  app/              # Next.js App Router pages
    page.tsx        # Landing page
    layout.tsx      # Root layout
    globals.css     # Design tokens + Tailwind
  lib/              # Shared utilities (Supabase, Gemini clients)
  components/       # Reusable UI components

supabase/
  migrations/       # Database schema

docs/init/          # Research package (frozen, do not edit)
design-system/      # UI/UX design system (MASTER.md)
```

## Design System

See `design-system/MASTER.md` for the claymorphism design system including:
- Color palette (indigo primary, green CTA)
- Typography (Baloo 2 headings, Comic Neue body)
- Shadow system (claymorphism depth levels)
- Component specs (buttons, cards, inputs, modals)
- Pre-delivery checklist

## Research

Background research on TOEFL speaking tasks, rubrics, workflows, and UX is in `docs/init/`. That folder is frozen and serves as the design reference — all app decisions should trace back to it.