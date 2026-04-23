# TOEFL Speaking Trainer — Layout & Spacing Rules

> **Purpose:** Authoritative reference for page layout, spacing, and alignment. All pages MUST follow these rules.
> **Last Updated:** 2026-04-22

---

## Philosophy

Mobile-first PWA. Content should breathe. Headings should float above cards. Cards should feel like distinct surfaces inset from the page edge.

---

## Page-Level Layout Rules

### 1. Page Container (REQUIRED on every page)

Every page's outermost wrapper MUST use:

```tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
```

NOT `className="space-y-6"` or `className="space-y-8"`. The `gap: '12px'` gives a small, consistent vertical breathing room between major blocks.

### 2. Header / Non-Card Text (REQUIRED)

Any text or controls that sit ABOVE or BETWEEN cards (headings, subtitles, filter buttons, section titles, action rows) MUST have horizontal padding:

```tsx
style={{ paddingLeft: '12px', paddingRight: '12px' }}
```

This makes the text/content indented MORE than the cards below, creating visual hierarchy.

**Examples of elements that need this padding:**
- Page title (e.g. "Practice History")
- Subtitle (e.g. "33 sessions completed")
- Filter buttons (All / Guided / Simulation)
- Section headers (e.g. "Recent Practice")
- Bottom action button rows
- Error badge rows

### 3. Cards (handled by component)

The `<Card>` component automatically adds:
- `marginLeft: '4px'`
- `marginRight: '4px'`
- `marginBottom: '12px'` (when `gap` prop is true, the default)

Cards are therefore slightly inset (4px) from the page edge, and the header text (12px padding) sits wider than the card — the heading visually "contains" the cards below it.

### 4. App Layout Shell

`AppLayout` provides:
- `px-4 pt-4 pb-4` on `<main>` (16px page padding)
- Bottom nav is sticky

The `px-4` + Card `margin: 4px` means card content starts at `16 + 4 = 20px` from screen edge.
The `px-4` + header `padding: 12px` means header text starts at `16 + 12 = 28px` from screen edge.

Header text is ~8px further in than card edges. This is the intended visual hierarchy.

---

## Visual Diagram

```
Screen edge (0px)
|
|  AppLayout px-4 (16px padding)
|  |
|  |   Header text (12px padding)
|  |   |"Practice History"          <- text at ~28px from edge
|  |   |
|  | Card margin: 4px
|  | |  +------------------+         <- card at ~20px from edge
|  | |  | Interview        |
|  | |  | Apr 22...        |
|  | |  +------------------+
|  | |
|  | |  +------------------+
|  | |  | Interview        |
|  | |  | Apr 22...        |
|  | |  +------------------+
```

---

## Page-by-Page Checklist

| Page | File | Outer Wrapper | Headers px-3? | Bottom Actions px-3? |
|------|------|---------------|---------------|----------------------|
| Dashboard | `toefl/page.tsx` | `flex col gap: 12px` | ✅ Welcome, Recent Practice | N/A |
| History | `toefl/history/page.tsx` | `flex col gap: 12px` | ✅ Title, Filters | N/A |
| Profile | `toefl/profile/page.tsx` | `flex col gap: 12px` | N/A (all in Cards) | N/A |
| Practice | `toefl/practice/page.tsx` | `flex col gap: 12px` | ✅ Header text | ✅ Score buttons |
| Attempt Review | `toefl/attempt/[id]/page.tsx` | `flex col gap: 12px` | ✅ Header, Meta, Errors | ✅ Actions |
| Landing | `page.tsx` | Marketing page — centered max-width, different rules |

---

## Component-Level Rules

### Card Component
```
- marginLeft: 4px
- marginRight: 4px
- marginBottom: 12px (via gap prop, default true)
- padding: 20px (md), 24px (lg), 12px (sm)
- borderRadius: 16px
- border: 1px solid var(--color-border)
- background: var(--color-bg-elevated)
```

### Button Component
```
- Primary: bg var(--color-primary), white text, shadow
- Secondary: transparent bg, 2px primary border
- Ghost: transparent bg, text-secondary
- All have active:scale-95 tap feedback
```

### Bottom Navigation
```
- Height: 80px (taller for FAB)
- Background: var(--color-bg) with backdrop-blur
- Border-top: 1px solid var(--color-border)
- Center Practice button: 56px circle, elevated, primary color
- Other tabs: 24px icons, active=primary, inactive=text-muted
```

---

## Anti-Patterns (DO NOT DO)

❌ Do NOT use `className="space-y-6"` or `space-y-8` on page wrappers — use `style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}`

❌ Do NOT add horizontal margin to headings — use `paddingLeft: '12px', paddingRight: '12px'` instead

❌ Do NOT make cards full-width flush to screen edge — they MUST have the 4px margin from the Card component

❌ Do NOT put bottom action buttons at the edge without `px-3` padding

❌ Do NOT use `mb-*` Tailwind classes on Card components — they use inline styles that override utilities

---

## Dark Mode

All spacing rules are identical in dark mode. Colors swap via CSS variables but margins/padding/gaps remain the same.

---

*This document is the authoritative reference. Any layout changes must be reflected here.*