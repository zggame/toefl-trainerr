import { beforeEach, describe, expect, test, vi } from 'vitest';
import { GET } from './route';

const exchangeCodeForSession = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((_url, _anonKey, options) => {
    exchangeCodeForSession.mockImplementation(async () => {
      options.cookies.setAll([
        {
          name: 'sb-test-auth-token',
          value: 'session-value',
          options: { path: '/', httpOnly: true },
        },
      ]);
      return { error: null };
    });

    return {
      auth: { exchangeCodeForSession },
    };
  }),
}));

describe('auth callback route', () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  });

  test('redirects with session cookies set during code exchange', async () => {
    const request = {
      url: 'http://localhost:3000/auth/callback?code=test-code',
      cookies: { getAll: () => [] },
    };

    const response = await GET(request as never);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/toefl');
    expect(response.headers.getSetCookie()[0]).toContain('sb-test-auth-token=session-value');
  });
});
