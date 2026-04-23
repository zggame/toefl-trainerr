import { beforeEach, describe, expect, test, vi } from 'vitest';
import { POST } from './route';
import { scoreAudio } from '@/lib/gemini';
import { getAuthenticatedUser, getSupabaseServer } from '@/lib/supabase-client';

const single = vi.fn();
const eq = vi.fn();
eq.mockReturnValue({ eq, single });
const select = vi.fn(() => ({ eq, single }));
const from = vi.fn(() => ({
  select,
  insert: vi.fn(() => ({ select })),
  update: vi.fn(() => ({ eq })),
}));
const upload = vi.fn();
const getPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://example.test/audio.webm' } }));
const fromStorage = vi.fn(() => ({ upload, getPublicUrl }));

vi.mock('@/lib/gemini', () => ({
  scoreAudio: vi.fn(),
}));

vi.mock('@/lib/supabase-client', () => ({
  getAuthenticatedUser: vi.fn(),
  getSupabaseServer: vi.fn(() => ({
    from,
    storage: {
      from: fromStorage,
    },
  })),
}));

const validBody = {
  audioBase64: Buffer.from('audio').toString('base64'),
  mimeType: 'audio/webm',
  taskId: '11111111-1111-4111-8111-111111111111',
  taskCategory: 'interview',
  taskTranscript: 'What is your favorite subject?',
  mode: 'guided',
};

const scoringResult = {
  delivery: { score: 3, evidence: 'clear', tip: 'slow down' },
  languageUse: { score: 3, evidence: 'accurate', tip: 'vary words' },
  topicDev: { score: 4, evidence: 'complete', tip: 'add detail' },
  overallScore: 3.4,
  errors: ['filler'],
  suggestion: 'Keep practicing.',
  transcript: 'I like science.',
  wpm: 130,
  fillerCount: 1,
};

function request(body: unknown) {
  return new Request('http://localhost:3000/api/toefl/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('TOEFL score route', () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-1' } as never);
    vi.mocked(getSupabaseServer).mockClear();
    vi.mocked(scoreAudio).mockReset();
    vi.mocked(scoreAudio).mockResolvedValue(scoringResult);
    from.mockClear();
    select.mockClear();
    eq.mockClear();
    single.mockReset();
    single.mockResolvedValue({ 
      data: { 
        daily_attempt_count: 0, 
        last_attempt_reset: new Date().toISOString(), 
        user_tier: 'free',
        total_attempts: 0
      }, 
      error: null 
    });
    upload.mockReset();
    upload.mockResolvedValue({ data: { fullPath: 'user-1/task.webm' }, error: null });
    getPublicUrl.mockClear();
    fromStorage.mockClear();
  });

  test('rejects malformed JSON without calling Gemini', async () => {
    const response = await POST(request('{bad json') as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON request body' });
    expect(scoreAudio).not.toHaveBeenCalled();
  });

  test('rejects unsupported audio mime types', async () => {
    const response = await POST(request({ ...validBody, mimeType: 'text/plain' }) as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Unsupported audio type' });
    expect(scoreAudio).not.toHaveBeenCalled();
  });

  test('returns a controlled error when Gemini scoring fails', async () => {
    vi.mocked(scoreAudio).mockRejectedValue(new SyntaxError('Unexpected token'));

    const response = await POST(request(validBody) as never);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: 'Scoring failed. Please try again.' });
  });

  test('validates previousAttemptId belongs to the authenticated user', async () => {
    // First call to single is for previousAttemptId check
    single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });

    const response = await POST(
      request({ ...validBody, previousAttemptId: '22222222-2222-4222-8222-222222222222' }) as never
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Previous attempt not found' });
    expect(scoreAudio).not.toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', '22222222-2222-4222-8222-222222222222');
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  test('surfaces recording upload failures instead of silently swallowing them', async () => {
    upload.mockResolvedValue({ data: null, error: { message: 'bucket missing' } });

    const response = await POST(request(validBody) as never);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Recording upload failed' });
  });

  test('enforces daily limit for free users', async () => {
    // Mock profile to have reached limit
    single.mockResolvedValueOnce({ 
      data: { 
        daily_attempt_count: 10, 
        last_attempt_reset: new Date().toISOString(), 
        user_tier: 'free',
        total_attempts: 100
      }, 
      error: null 
    });

    const response = await POST(request(validBody) as never);

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ 
      error: 'Daily limit reached. Please upgrade to Premium or try again tomorrow!',
      limitReached: true 
    });
    expect(scoreAudio).not.toHaveBeenCalled();
  });

  test('resets daily limit if it is a new day', async () => {
    // Mock profile with limit from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    single.mockResolvedValueOnce({ 
      data: { 
        daily_attempt_count: 10, 
        last_attempt_reset: yesterday.toISOString(), 
        user_tier: 'free',
        total_attempts: 100
      }, 
      error: null 
    });

    const response = await POST(request(validBody) as never);

    expect(response.status).toBe(200);
    expect(scoreAudio).toHaveBeenCalled();
  });

  test('allows premium users to bypass daily limit', async () => {
    // Mock profile with 10 attempts but premium tier
    single.mockResolvedValueOnce({ 
      data: { 
        daily_attempt_count: 10, 
        last_attempt_reset: new Date().toISOString(), 
        user_tier: 'premium',
        total_attempts: 100
      }, 
      error: null 
    });

    const response = await POST(request(validBody) as never);

    expect(response.status).toBe(200);
    expect(scoreAudio).toHaveBeenCalled();
  });
});
