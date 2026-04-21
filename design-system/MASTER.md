# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** TOEFL Speaking Trainer
**Generated:** 2026-04-20
**Audience:** College & high school students (ages 16–24)
**Category:** Language Learning App — Youth-oriented

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#4F46E5` | `--color-primary` |
| Secondary | `#818CF8` | `--color-secondary` |
| CTA/Accent | `#22C55E` | `--color-cta` |
| Background | `#EEF2FF` | `--color-background` |
| Text | `#312E81` | `--color-text` |

**Color Notes:** Learning indigo + progress green

### Typography

- **Heading Font:** Baloo 2
- **Body Font:** Comic Neue
- **Mood:** playful, friendly, colorful, energetic, modern, youthful, motivating
- **Best For:** Students, teenagers, young adults, educational games, engaging learning apps
- **Google Fonts:** [Baloo 2 + Comic Neue](https://fonts.google.com/share?selection.family=Baloo+2:wght@400;500;600;700|Comic+Neue:wght@300;400;700)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700&family=Comic+Neue:wght@300;400;700&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths (Claymorphism)

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `4px 4px 8px rgba(0,0,0,0.08), -2px -2px 6px rgba(255,255,255,0.9)` | Subtle lift |
| `--shadow-md` | `6px 6px 12px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.9)` | Cards, buttons |
| `--shadow-lg` | `8px 8px 16px rgba(0,0,0,0.1), -4px -4px 12px rgba(255,255,255,0.9)` | Modals, featured cards |
| `--shadow-xl` | `12px 12px 24px rgba(0,0,0,0.12), -6px -6px 16px rgba(255,255,255,0.95)` | Hero cards, primary CTAs |

---

## Component Specs

### Buttons

```css
/* Primary Button — CTA */
.btn-primary {
  background: #22C55E;
  color: white;
  padding: 12px 24px;
  border-radius: 9999px; /* pill shape — youthful */
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
  transition: all 200ms ease-out;
  cursor: pointer;
  border: 3px solid transparent;
  box-shadow: 0 4px 0 #16A34A, 0 4px 12px rgba(34,197,94,0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #16A34A, 0 6px 16px rgba(34,197,94,0.4);
}

.btn-primary:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0 #16A34A;
}

/* Secondary Button */
.btn-secondary {
  background: #EEF2FF;
  color: #4F46E5;
  border: 3px solid #4F46E5;
  padding: 12px 24px;
  border-radius: 9999px;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
  transition: all 200ms ease-out;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #4F46E5;
  color: white;
  transform: translateY(-2px);
}
```

### Cards (Claymorphism)

```css
.card {
  background: #EEF2FF;
  border-radius: 20px;
  padding: 24px;
  border: 3px solid rgba(79,70,229,0.15);
  box-shadow:
    6px 6px 12px rgba(0,0,0,0.08),
    -4px -4px 10px rgba(255,255,255,0.9);
  transition: all 200ms ease-out;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow:
    8px 8px 16px rgba(0,0,0,0.1),
    -4px -4px 12px rgba(255,255,255,0.9);
}
```

### Inputs

```css
.input {
  padding: 14px 18px;
  border: 3px solid rgba(79,70,229,0.2);
  border-radius: 14px;
  font-size: 16px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(4px);
  transition: all 200ms ease;
  font-family: 'Comic Neue', sans-serif;
}

.input:focus {
  border-color: #4F46E5;
  outline: none;
  box-shadow: 0 0 0 4px rgba(79,70,229,0.15);
  background: white;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Claymorphism

**Keywords:** Soft 3D, chunky, playful, bubbly, thick borders (3-4px), double shadows, rounded (16-24px), energetic, modern, youthful

**Best For:** Students (16–24), educational apps, engaging learning experiences, onboarding flows, progress-driven UI

**Key Effects:** Inner+outer shadows (subtle, no hard lines), soft press (200ms ease-out), fluffy elements, smooth transitions, pill-shaped buttons, large border-radius

### Page Pattern

**Pattern Name:** App Store Style Landing — Youth Edition

- **Conversion Strategy:** Show real screenshots. Include ratings (4.5+ stars). Gamified progress indicators. Platform-specific CTAs.
- **CTA Placement:** Prominent pill buttons throughout, floating action buttons on mobile
- **Section Order:** 1. Hero with animated device mockup, 2. App feature highlights with icons, 3. Screenshots carousel, 4. Social proof (student testimonials), 5. Download CTAs

---

## Anti-Patterns (Do NOT Use)

- ❌ Boring, flat, corporate design — student audience needs energy
- ❌ No motivation — must show progress, streaks, achievements
- ❌ Too childish — college students won't use an app that looks like a kids game
- ❌ Low energy — color should be vibrant, spacing should breathe, motion should feel alive

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
