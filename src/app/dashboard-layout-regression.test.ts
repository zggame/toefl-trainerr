import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('dashboard visual parity guardrails', () => {
  test('does not reset all element padding after Tailwind utilities are imported', () => {
    const css = readFileSync('src/app/globals.css', 'utf8');

    expect(css).not.toMatch(/\*\s*\{[^}]*padding:\s*0;[^}]*\}/s);
  });

  test('does not ship dashboard demo auth or demo data switches', () => {
    const page = readFileSync('src/app/toefl/page.tsx', 'utf8');
    const proxy = readFileSync('src/proxy.ts', 'utf8');

    expect(page).not.toContain('USE_DEMO');
    expect(proxy).not.toContain('DEMO MODE');
  });

  test('keeps selected dashboard design on light surfaces even when global dark theme is active', () => {
    const dashboardFiles = [
      'src/components/dashboard/dashboard-insight-card.tsx',
      'src/components/dashboard/dashboard-recent-attempts.tsx',
      'src/components/dashboard/dashboard-stats-strip.tsx',
    ];

    for (const file of dashboardFiles) {
      expect(readFileSync(file, 'utf8')).not.toContain('var(--color-bg-elevated)');
    }
  });
});
