# TOEFL Speaking Trainer — Deployment Guide

> **Status:** Draft — for discussion  
> **Last Updated:** 2026-04-22

---

## Architecture Overview

```
+-----------------+      +------------------+      +-----------------+
|   Next.js 16    |------|  Supabase Cloud  |------|  Gemini API     |
|   (Frontend)    |      |  Auth + DB +     |      |  (Google GenAI) |
|                 |      |  Storage         |      |                 |
+-----------------+      +------------------+      +-----------------+
        |
   +----+----+
   |  Vercel |  <-- Hosting + Edge + CI/CD
   +---------+
```

**Current Stack:**
- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (Postgres + Auth + Storage)
- **AI:** Google Gemini API (`gemini-2.5-flash-lite`)
- **Optional:** Upstash Redis (rate limiting — currently unused)

---

## Option A: Vercel + Supabase Cloud (Recommended for MVP)

**Best for:** Fastest deployment, automatic CI/CD, free tier covers MVP.

### Pros
- Zero server management
- Auto-deploy on every push to `main`
- Edge functions close to users
- Supabase free tier: 500MB DB, 2GB bandwidth
- Vercel free tier: 100GB bandwidth, serverless functions

### Cons
- Cold starts on serverless (mitigated by keeping functions warm)
- Supabase Cloud requires project migration from local
- Gemini API key exposed to serverless environment

### Prerequisites
1. [Vercel account](https://vercel.com) (free)
2. [Supabase account](https://supabase.com) (free)
3. [Google AI Studio](https://aistudio.google.com) API key
4. GitHub repo already created: `zggame/toefl-trainerr`

### Step-by-Step

#### 1. Create Supabase Cloud Project
```bash
# Install Supabase CLI if not already
npm install -g supabase

# Link your local project to cloud
supabase login
supabase link --project-ref <your-project-ref>

# Push schema and seed data
supabase db push
# Or use dashboard SQL Editor to run:
#   - supabase/migrations/001_init_toefl_schema.sql
#   - scripts/seed-more-tasks.sql
```

#### 2. Configure Auth (Google OAuth)
In Supabase Dashboard -> Authentication -> Providers -> Google:
- Enable Google provider
- Add Client ID + Secret from [Google Cloud Console](https://console.cloud.google.com)
- Set callback URL: `https://your-vercel-app.vercel.app/auth/callback`

#### 3. Create Storage Bucket
In Supabase Dashboard -> Storage:
- Create bucket: `toefl_recordings`
- Set to **private**
- Add RLS policy: allow authenticated users to upload/read their own files

#### 4. Deploy to Vercel
```bash
# Option 1: Vercel CLI
npm install -g vercel
vercel --prod

# Option 2: GitHub integration (recommended)
# 1. Go to vercel.com -> Add New Project
# 2. Import `zggame/toefl-trainerr`
# 3. Framework preset: Next.js
# 4. Set environment variables (see below)
# 5. Deploy
```

#### 5. Environment Variables
In Vercel Dashboard -> Project Settings -> Environment Variables:

| Variable | Value | Source |
|----------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase Project Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase Project Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase Project Settings -> API (service role) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `AIza...` | Google AI Studio |

**Important:** Do NOT commit `.env.local` to Git. Add it to `.gitignore`.

---

## Option B: Self-Hosted (Docker Compose)

**Best for:** Full control, no vendor lock-in, private deployment.

### Pros
- Complete data control
- No Supabase/Vercel limits
- Fixed costs (VPS ~$5-10/mo)

### Cons
- Manual server management
- Need to configure SSL, backups, monitoring
- More setup time

### Stack
```yaml
# docker-compose.yml (example)
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - supabase

  supabase:
    # Use official Supabase Docker setup
    # https://github.com/supabase/supabase/tree/master/docker
```

### Hosting Options
- [Railway](https://railway.app) — easy Docker deploy
- [Render](https://render.com) — free tier + auto-deploy
- [DigitalOcean](https://digitalocean.com) — droplet + App Platform
- [Hetzner](https://hetzner.com) — cheapest VPS

---

## Option C: Mixed (Vercel + Self-Hosted Supabase)

**Best for:** Want Vercel's speed but keep data self-hosted.

- Frontend on Vercel
- Supabase self-hosted (Docker) on a VPS
- Gemini API direct

**Note:** Requires exposing Supabase to internet (or using Vercel's IP allowlist).

---

## Recommended Decision Matrix

| Criteria | Vercel+Supabase Cloud | Self-Hosted | Mixed |
|----------|----------------------|-------------|-------|
| **Setup Time** | 30 min | 2-4 hours | 1-2 hours |
| **Monthly Cost (MVP)** | $0 | $5-10 | $5-10 |
| **Scale Cost** | Medium | Low | Medium |
| **Data Control** | Limited | Full | Partial |
| **DevOps Burden** | None | High | Medium |
| **Best For** | MVP, fast iteration | Production, privacy | Balanced |

---

## CI/CD Pipeline (Vercel Option)

```
git push origin main
        |
   Vercel auto-build
        |
   Run tests (optional)
        |
   Deploy to production
        |
   Create tag: git tag v0.1.0-alpha.2
```

**To add tests to CI:**
1. Vercel Dashboard -> Project Settings -> Git
2. Add "Build Command": `npm run build && npm run test`
3. Or use GitHub Actions for pre-deployment testing

---

## Rollback Procedure

```bash
# Option 1: Revert commit
git revert <commit-hash>
git push origin main

# Option 2: Redeploy previous version
# Vercel Dashboard -> Deployments -> Select previous -> Promote to Production

# Option 3: Git tag rollback
git checkout v0.1.0-alpha.1
git checkout -b hotfix/rollback
git push origin hotfix/rollback
# Create PR to main
```

---

## Security Checklist

- [ ] `.env.local` in `.gitignore`
- [ ] Supabase RLS enabled on all tables
- [ ] Supabase Auth email confirmation (optional)
- [ ] Google OAuth callback URL matches deployed domain
- [ ] Storage bucket `toefl_recordings` is private
- [ ] Gemini API key rotated periodically
- [ ] CORS configured in Supabase (if needed)

---

## Open Questions

1. **Domain name?** Custom domain or `vercel.app` subdomain?
2. **Analytics?** Add Vercel Analytics or Google Analytics?
3. **Rate limiting?** Currently unused — enable Upstash Redis on Vercel?
4. **Email?** Supabase Auth email templates for password reset?
5. **Monitoring?** Add Sentry or Logflare for error tracking?
