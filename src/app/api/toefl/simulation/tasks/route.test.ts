import { beforeEach, describe, expect, test, vi } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser, getSupabaseServer } from '@/lib/supabase-client';

const select = vi.fn();
const from = vi.fn(() => ({ select }));

vi.mock('@/lib/supabase-client', () => ({
  getAuthenticatedUser: vi.fn(),
  getSupabaseServer: vi.fn(() => ({ from })),
}));

function task(id: string, category: 'listen_repeat' | 'interview') {
  return {
    id,
    category,
    audio_url: `https://example.test/${id}.mp3`,
    transcript: `${category} prompt ${id}`,
    difficulty: 'medium',
    prep_time_seconds: 0,
    record_time_seconds: category === 'listen_repeat' ? 20 : 45,
  };
}

describe('TOEFL simulation tasks route', () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedUser).mockReset();
    vi.mocked(getSupabaseServer).mockClear();
    from.mockClear();
    select.mockReset();
  });

  test('requires an authenticated user', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost:3000/api/toefl/simulation/tasks') as never);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(from).not.toHaveBeenCalled();
  });

  test('returns seven listen-repeat tasks followed by four interview tasks', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' } as never);
    select.mockResolvedValue({
      data: [
        ...Array.from({ length: 8 }, (_, index) => task(`listen-${index + 1}`, 'listen_repeat')),
        ...Array.from({ length: 5 }, (_, index) => task(`interview-${index + 1}`, 'interview')),
      ],
      error: null,
    });

    const response = await GET(new Request('http://localhost:3000/api/toefl/simulation/tasks') as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(11);
    expect(data.slice(0, 7).every((row: { category: string }) => row.category === 'listen_repeat')).toBe(true);
    expect(data.slice(7).every((row: { category: string }) => row.category === 'interview')).toBe(true);
    expect(data.map((row: { simulationItemNumber: number }) => row.simulationItemNumber))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(from).toHaveBeenCalledWith('toefl_tasks');
    expect(select).toHaveBeenCalledWith('*');
  });

  test('returns 404 when the prompt bank cannot supply a full simulation', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' } as never);
    select.mockResolvedValue({
      data: [
        ...Array.from({ length: 6 }, (_, index) => task(`listen-${index + 1}`, 'listen_repeat')),
        ...Array.from({ length: 4 }, (_, index) => task(`interview-${index + 1}`, 'interview')),
      ],
      error: null,
    });

    const response = await GET(new Request('http://localhost:3000/api/toefl/simulation/tasks') as never);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'Need at least 7 listen-repeat tasks and 4 interview tasks for simulation',
    });
  });
});
