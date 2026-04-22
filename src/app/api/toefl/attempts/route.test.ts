import { beforeEach, describe, expect, test, vi } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser, getSupabaseServer } from '@/lib/supabase-client';

const limit = vi.fn();
const order = vi.fn(() => ({ limit }));
const eq = vi.fn(() => ({ order }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

vi.mock('@/lib/supabase-client', () => ({
  getAuthenticatedUser: vi.fn(),
  getSupabaseServer: vi.fn(() => ({
    from,
    auth: {
      getUser: vi.fn(() => {
        throw new Error('service role auth should not identify route users');
      }),
    },
  })),
}));

describe('TOEFL attempts route', () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedUser).mockReset();
    vi.mocked(getSupabaseServer).mockClear();
    from.mockClear();
    select.mockClear();
    eq.mockClear();
    order.mockClear();
    limit.mockReset();
    limit.mockResolvedValue({ data: [{ id: 'attempt-1' }], error: null });
  });

  test('uses the request-authenticated user when listing attempts', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' } as never);
    const request = new Request('http://localhost:3000/api/toefl/attempts?limit=5');

    const response = await GET(request as never);

    await expect(response.json()).resolves.toEqual([{ id: 'attempt-1' }]);
    expect(response.status).toBe(200);
    expect(getAuthenticatedUser).toHaveBeenCalledWith(request);
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(limit).toHaveBeenCalledWith(5);
  });
});
