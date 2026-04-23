# TOEFL Speaking Trainer — Design System v2.0

> **Target Audience:** High school & college students preparing for TOEFL  
> **Mood:** Energetic, Motivational, Reduces Anxiety  
> **Platform:** Mobile-first PWA, responsive to desktop  
> **Tech Stack:** Next.js + Tailwind CSS + Dark Mode

---

## Philosophy

**"Duolingo meets Notion"** — Playful enough to be engaging, clean enough to feel professional, with clear progress tracking to keep students motivated without overwhelming them.

TOEFL is stressful. The UI should feel like a supportive coach, not a demanding taskmaster.

---

## Color System

### Primary Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `primary` | `#4F46E5` | `#6366F1` | Main brand color, CTAs, active states |
| `primary-light` | `#818CF8` | `#A5B4FC` | Hover states, highlights, secondary accents |
| `primary-dark` | `#3730A3` | `#4F46E5` | Pressed states, emphasis |

### Accent Colors (Energetic & Motivational)

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `accent` | `#F97316` | `#FB923C` | Success, progress, streaks, achievements |
| `accent-green` | `#22C55E` | `#4ADE80` | Good scores, positive feedback |
| `accent-yellow` | `#EAB308` | `#FDE047` | Warnings, medium scores, tips |
| `accent-red` | `#EF4444` | `#F87171` | Errors, low scores (use sparingly) |

### Neutral Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `bg` | `#FFFFFF` | `#0F172A` | Page background |
| `bg-elevated` | `#F8FAFC` | `#1E293B` | Cards, elevated surfaces |
| `bg-overlay` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.04)` | Subtle separators |
| `text-primary` | `#0F172A` | `#F1F5F9` | Headings, primary text |
| `text-secondary` | `#475569` | `#94A3B8` | Body text, descriptions |
| `text-muted` | `#94A3B8` | `#64748B` | Placeholders, timestamps |
| `border` | `#E2E8F0` | `#334155` | Card borders, dividers |

### Score Colors

| Score Range | Color | Dark Mode |
|-------------|-------|-----------|
| 3.5 - 4.0 | `#22C55E` (green) | `#4ADE80` |
| 2.5 - 3.4 | `#4F46E5` (indigo) | `#6366F1` |
| 1.5 - 2.4 | `#EAB308` (yellow) | `#FDE047` |
| 0.0 - 1.4 | `#EF4444` (red) | `#F87171` |

---

## Typography

### Font Family

Replace the current "Baloo 2 + Comic Neue" (childish) with:

| Role | Font | Fallback | Weight |
|------|------|----------|--------|
| **Headings** | `Outfit` | `system-ui, sans-serif` | 600, 700 |
| **Body** | `Inter` | `system-ui, sans-serif` | 400, 500, 600 |
| **Mono** | `JetBrains Mono` | `monospace` | 400, 500 | Timer, scores, stats |

### Why These Fonts?

- **Outfit:** Geometric, modern, friendly but not childish. Perfect for headlines.
- **Inter:** Highly readable, professional, designed for screens. The standard for modern web apps.
- **JetBrains Mono:** Clean monospace for numbers (timer, WPM, scores) — prevents jumping when digits change.

### Type Scale

| Token | Size | Line Height | Letter Spacing | Usage |
|-------|------|-------------|----------------|-------|
| `display` | 48px / 3rem | 1.1 | -0.02em | Hero headlines |
| `h1` | 32px / 2rem | 1.2 | -0.01em | Page titles |
| `h2` | 24px / 1.5rem | 1.3 | 0 | Section headings |
| `h3` | 20px / 1.25rem | 1.4 | 0 | Card titles |
| `body` | 16px / 1rem | 1.6 | 0 | Body text |
| `body-sm` | 14px / 0.875rem | 1.5 | 0 | Secondary text |
| `caption` | 12px / 0.75rem | 1.4 | 0.01em | Labels, timestamps |
| `overline` | 11px / 0.6875rem | 1.2 | 0.05em | Badges, categories |

---

## Spacing System

Use Tailwind's default spacing scale but with these base rules:

- **Base unit:** 4px (Tailwind default)
- **Page padding:** 16px mobile, 24px tablet, 32px desktop
- **Card padding:** 20px mobile, 24px desktop
- **Card gap:** 16px mobile, 24px desktop
- **Section gap:** 32px mobile, 48px desktop
- **Touch target:** Minimum 44px × 44px for all interactive elements

---

## Components

### Cards

```
Light Mode:
- Background: bg-elevated (#F8FAFC)
- Border: 1px solid border (#E2E8F0)
- Border radius: 16px (rounded-2xl)
- Shadow: subtle — 0 1px 3px rgba(0,0,0,0.08)
- Hover: shadow increases slightly, border color darkens

Dark Mode:
- Background: bg-elevated (#1E293B)
- Border: 1px solid border (#334155)
- Same radius and shadow (adjusted for dark)
```

### Buttons

**Primary Button:**
- Background: primary
- Text: white
- Padding: 14px 24px
- Border radius: 12px (rounded-xl)
- Font: body, weight 600
- Hover: primary-dark, slight scale (1.02)
- Active: scale (0.98)
- Shadow: 0 4px 14px rgba(79, 70, 229, 0.3)

**Secondary Button:**
- Background: transparent
- Border: 2px solid primary
- Text: primary
- Same padding/radius
- Hover: primary with 10% opacity background

**Ghost Button:**
- Background: transparent
- Text: text-secondary
- Hover: bg-overlay

### Score Display

```
Large Score (Overall):
- Font: JetBrains Mono, 64px, weight 700
- Color: Dynamic based on score range
- Decimal: smaller (32px) with /4 suffix

Sub-scores:
- Font: JetBrains Mono, 28px, weight 600
- Color: Same dynamic logic
- Label: caption size, text-muted
```

### Progress Bars

- Height: 8px
- Background: bg-overlay
- Fill: Dynamic color based on value
- Border radius: full (rounded-full)
- Animation: width transition 600ms ease-out on load

### Badges

```
Mode Badge:
- "Guided" — bg-primary/10 text-primary
- "Simulation" — bg-accent/10 text-accent

Score Badge:
- "Excellent" — bg-green-100 text-green-700 (dark: bg-green-900/30 text-green-400)
- "Good" — bg-indigo-100 text-indigo-700
- "Needs Work" — bg-yellow-100 text-yellow-700
- "Practice More" — bg-red-100 text-red-700
```

---

## Layout Patterns

### Mobile Navigation (Bottom Tab Bar with FAB)

```
Fixed bottom, 80px height (taller for FAB)
Background: bg with backdrop-blur
Border-top: 1px solid border
Safe area padding for notched devices
```

**Tab Layout:**
```
┌────────┬────────┬────────┬────────┐
│  🏠    │   🎙️   │   ⏱️   │   👤   │
│  Home  │Practice│History │Profile │
└────────┴────────┴────────┴────────┘
         ↑
    Center tab is PROMINENT:
    - Larger icon (28px vs 24px)
    - Primary color background
    - Slightly elevated (-8px translateY)
    - "Practice" is the main action
```

**Center Tab (Practice) — Elevated:**
- Background: primary color circle
- Icon: white, 28px
- Position: slightly above the bar (translateY: -8px)
- Shadow: 0 4px 12px rgba(79, 70, 229, 0.4)
- Tap: scale(0.95) bounce back

**Other Tabs:**
- Icons: 24px, Lucide
- Active: primary color + small indicator dot
- Inactive: text-muted
- Tap: gentle bounce animation

**Bouncy Animation on Tap:**
```css
@keyframes bounce-tap {
  0% { transform: scale(1); }
  30% { transform: scale(0.85); }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
/* Duration: 400ms, ease-out */
```
Fixed bottom, 64px height
Background: bg with backdrop-blur
Border-top: 1px solid border
Icons: 24px, Lucide
Active: primary color + small indicator dot
Inactive: text-muted
Safe area padding for notched devices
```

**Tabs:**
1. Home (dashboard)
2. Practice (microphone icon)
3. History (clock icon)
4. Profile (user icon)

### Page Structure

```
Every page:
┌─────────────────────────────┐
│  Status Bar (safe area)     │
├─────────────────────────────┤
│  Header (optional)          │
│  - Back button              │
│  - Page title               │
├─────────────────────────────┤
│                             │
│  Content (scrollable)       │
│  - Generous padding         │
│  - Card-based layout        │
│                             │
├─────────────────────────────┤
│  Bottom Nav (if main page)  │
│  Safe Area padding          │
└─────────────────────────────┘
```

### Landing Page Structure

```
1. Hero Section
   - Bold headline: "Speak Confidently. Score Higher."
   - Subheadline explaining value prop
   - Large CTA: "Start Practicing"
   - Animated illustration or abstract shapes

2. Social Proof
   - Stats: "X students improved their score"
   - Short testimonials or trust badges

3. How It Works (3 steps)
   - Step 1: Listen to prompt
   - Step 2: Record your response
   - Step 3: Get AI feedback
   - Simple icons, minimal text

4. Feature Highlights (Bento Grid)
   - 65+ practice tasks
   - Real-time AI scoring
   - Detailed feedback
   - Progress tracking
   - Mobile-friendly

5. CTA Section
   - "Ready to improve your speaking score?"
   - Final CTA button
   - "No signup required to try"
```

---

## Animations & Effects

### Micro-interactions

| Element | Trigger | Animation |
|---------|---------|-----------|
| Cards | Hover | translateY(-2px), shadow increase, 200ms ease |
| Buttons | Hover | scale(1.02), 150ms ease |
| Buttons | Active/Press | scale(0.98), 100ms ease |
| Score reveal | Load | Count up from 0, 800ms, easeOutExpo |
| Progress bar | Load | Width from 0% to value, 600ms ease-out |
| Recording | Active | Pulse animation on mic icon, 1.5s infinite |
| Nav items | Tap | Scale(0.95) then back, 100ms |
| Toast/Notification | Enter | Slide up + fade in, 300ms |
| Toast/Notification | Exit | Fade out, 200ms |

### Page Transitions

- **Enter:** Fade in + slight translateY(8px to 0), 300ms
- **Exit:** Fade out, 150ms
- Use Next.js App Router transitions or Framer Motion

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Dark Mode Strategy

### Implementation

- Use Tailwind's `darkMode: 'class'` strategy
- Toggle via system preference or manual toggle
- Store preference in localStorage
- Apply `dark` class to `<html>` element

### Dark Mode Colors

- Avoid pure black (`#000000`) — use `#0F172A` (slate-900) for less eye strain
- Elevated surfaces: `#1E293B` (slate-800)
- Text: `#F1F5F9` (slate-100) for primary, `#94A3B8` for secondary
- Borders: `#334155` (slate-700)
- Shadows are subtle — rely on border contrast instead

### Toggle Button

```
Position: Header or settings page
Icon: Sun (light mode) / Moon (dark mode)
Animation: Icon rotation on toggle
```

---

## PWA Considerations

### Manifest

```json
{
  "name": "TOEFL Speaking Trainer",
  "short_name": "TOEFL Speak",
  "theme_color": "#4F46E5",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "orientation": "portrait"
}
```

### Icons

- Provide 192px and 512px icons
- Maskable icon for adaptive shapes
- Use primary color as background

### Behaviors

- `standalone` display mode (no browser chrome)
- Add to home screen prompt
- Offline page (cached shell)
- Pull-to-refresh disabled where not needed
- Overscroll-behavior: contain on main content

---

## Responsive Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile-First Approach

```css
/* Base styles are mobile */
.container {
  padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    max-width: 720px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 960px;
  }
}
```

---

## Accessibility

- WCAG AA minimum (4.5:1 contrast for text)
- All interactive elements: minimum 44×44px touch target
- Focus rings visible on all focusable elements
- `prefers-reduced-motion` respected
- Alt text on all images
- Semantic HTML (button, not div with onClick)
- ARIA labels where needed
- Color is not the only indicator (icons + text)

---

## Anti-Patterns to Avoid

❌ **Childish fonts** — No Baloo, Comic Sans, or overly playful typefaces  
❌ **Excessive shadows** — Keep shadows subtle and consistent  
❌ **Pure black in dark mode** — Always use dark slate, never #000000  
❌ **Too many colors** — Stick to the defined palette  
❌ **Busy layouts** — Generous whitespace, one action per screen on mobile  
❌ **Small touch targets** — Minimum 44px for everything tappable  
❌ **Emoji as icons** — Always use SVG icons (Lucide)  
❌ **No feedback on tap** — Every tap must have visual feedback  
❌ **Horizontal scroll** — Avoid on mobile, use vertical stacking  
❌ **Cluttered dashboard** — Show only what's needed, hide details behind cards  

---

## File Structure

```
.worktrees/ui-revamp/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── ...
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with fonts, theme provider
│   │   ├── globals.css        # Tailwind imports + custom CSS
│   │   ├── page.tsx           # Landing page (revamped)
│   │   ├── auth/
│   │   ├── toefl/
│   │   │   ├── layout.tsx     # App shell with bottom nav
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── practice/
│   │   │   ├── history/
│   │   │   ├── attempt/
│   │   │   └── profile/
│   │   └── api/
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── score-display.tsx
│   │   │   ├── progress-bar.tsx
│   │   │   ├── badge.tsx
│   │   │   └── icon.tsx
│   │   ├── layout/
│   │   │   ├── bottom-nav.tsx
│   │   │   ├── header.tsx
│   │   │   └── page-wrapper.tsx
│   │   ├── audio-player.tsx   # Revamped
│   │   ├── record-button.tsx  # Revamped
│   │   ├── score-card.tsx     # Revamped
│   │   ├── score-breakdown.tsx # Revamped
│   │   └── waveform.tsx       # Revamped
│   ├── hooks/
│   │   ├── use-theme.ts       # Dark mode management
│   │   └── use-media-query.ts # Responsive helpers
│   ├── lib/
│   │   ├── utils.ts           # cn() helper, etc.
│   │   └── constants.ts       # Design tokens
│   └── types/
│       └── index.ts
├── tailwind.config.ts         # Extended config with design tokens
├── next.config.js             # PWA config
└── package.json
```

---

## Implementation Order

1. **Setup** — Tailwind config, fonts, colors, dark mode provider
2. **Layout Components** — Bottom nav, header, page wrapper
3. **UI Components** — Button, card, score display, progress bar, badge
4. **Landing Page** — Hero, features, CTA (the "wow" moment)
5. **Dashboard** — Stats cards, recent attempts, quick actions
6. **Practice Page** — Audio player, record button, timer (reduce anxiety)
7. **ScoreCard** — Score reveal animation, recording status
8. **Review Page** — Full itemized breakdown
9. **History & Profile** — List views, settings
10. **PWA** — Manifest, icons, service worker, install prompt
11. **Polish** — Animations, transitions, reduced motion, accessibility audit

---

*Generated with ui-ux-pro-max skill*  
*For: TOEFL Speaking Trainer v2.0 UI Revamp*  
*Worktree: `.worktrees/ui-revamp`*
