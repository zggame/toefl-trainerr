import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createServerClient } from '@supabase/ssr';
import { getAuthenticatedUser } from './supabase-client';

const getUser = vi.fn();

vi.mock('@supabase/ssr', async () => {
  const actual = await vi.importActual<typeof import('@supabase/ssr')>('@supabase/ssr');
  return {
    ...actual,
    createServerClient: vi.fn((_url, _anonKey, options) => ({
      auth: { getUser },
      __cookieOptions: options.cookies,
    })),
  };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('getAuthenticatedUser', () => {
  beforeEach(() => {
    vi.mocked(createServerClient).mockClear();
    getUser.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  });

  test('authenticates with request cookies from the browser session', async () => {
    const cookies = [{ name: 'sb-test-auth-token', value: 'session-value' }];
    const request = {
      cookies: {
        getAll: () => cookies,
      },
    };
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

    const user = await getAuthenticatedUser(request as never);

    expect(user).toEqual({ id: 'user-1' });
    const client = vi.mocked(createServerClient).mock.results[0].value as {
      __cookieOptions: { getAll: () => typeof cookies };
    };
    expect(client.__cookieOptions.getAll()).toBe(cookies);
  });
});
