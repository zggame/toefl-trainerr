import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scoreAudio, transcribeAudio } from './gemini';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

describe('gemini', () => {
  beforeEach(() => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-key';
    mockGenerateContent.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('scoreAudio parses full scoring result including transcript, wpm, fillerCount', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        delivery: { score: 3, evidence: 'clear speech', tip: 'keep pace' },
        languageUse: { score: 3, evidence: 'good grammar', tip: 'vary vocab' },
        topicDev: { score: 4, evidence: 'detailed', tip: 'great' },
        overallScore: 3.4,
        errors: ['filler'],
        suggestion: 'Practice more',
        transcript: 'This is the spoken response.',
        wpm: 142,
        fillerCount: 2,
      }),
    });

    const result = await scoreAudio('fakebase64', 'audio/webm', 'interview');

    expect(result.overallScore).toBe(3.4);
    expect(result.transcript).toBe('This is the spoken response.');
    expect(result.wpm).toBe(142);
    expect(result.fillerCount).toBe(2);
    expect(result.delivery.score).toBe(3);
  });

  it('transcribeAudio returns trimmed text', async () => {
    mockGenerateContent.mockResolvedValue({ text: '  Hello world  ' });

    const text = await transcribeAudio('fakebase64', 'audio/webm');
    expect(text).toBe('Hello world');
  });
});
