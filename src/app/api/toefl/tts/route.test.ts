import { beforeEach, describe, expect, test, vi } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser, getSupabaseServer } from '@/lib/supabase-client';
import { generateTTS } from '@/lib/gemini';

const single = vi.fn();
const eq = vi.fn(() => ({ single }));
const select = vi.fn(() => ({ eq }));
const upsert = vi.fn();
const from = vi.fn(() => ({
  select,
  upsert,
}));

vi.mock('@/lib/supabase-client', () => ({
  getAuthenticatedUser: vi.fn(),
  getSupabaseServer: vi.fn(() => ({
    from,
  })),
}));

vi.mock('@/lib/gemini', () => ({
  generateTTS: vi.fn(),
}));

function request(body: any) {
  return new Request('http://localhost:3000/api/toefl/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('TTS API route', () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedUser).mockReset();
    vi.mocked(getSupabaseServer).mockClear();
    vi.mocked(generateTTS).mockReset();
    from.mockClear();
    select.mockClear();
    eq.mockClear();
    single.mockReset();
    upsert.mockClear();
  });

  test('returns 401 if unauthorized', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);
    const res = await POST(request({ text: 'test' }) as any);
    expect(res.status).toBe(401);
  });

  test('returns cached audio if available', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' } as any);
    single.mockResolvedValue({ data: { audio_data: 'cached-base64' }, error: null });

    const res = await POST(request({ text: 'Hello world' }) as any);
    const data = await res.json();

    expect(data.audioData).toBe('cached-base64');
    expect(generateTTS).not.toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('text_hash', expect.any(String));
  });

  test('generates and caches new audio if missing from cache', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' } as any);
    single.mockResolvedValue({ data: null, error: null });
    vi.mocked(generateTTS).mockResolvedValue('new-base64');

    const res = await POST(request({ text: 'New prompt' }) as any);
    const data = await res.json();

    expect(data.audioData).toBe('new-base64');
    expect(generateTTS).toHaveBeenCalledWith('New prompt', 'Kore');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ audio_data: 'new-base64' }),
      { onConflict: 'text_hash' }
    );
  });
});
