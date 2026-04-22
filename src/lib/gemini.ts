import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is required');
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export type ScoringResult = {
  delivery: { score: number; evidence: string; tip: string };
  languageUse: { score: number; evidence: string; tip: string };
  topicDev: { score: number; evidence: string; tip: string };
  overallScore: number;
  errors: string[];
  suggestion: string;
  transcript: string;
  wpm: number;
  fillerCount: number;
};

export async function scoreAudio(
  audioBase64: string,
  mimeType: string,
  taskCategory: string,
  taskTranscript?: string
): Promise<ScoringResult> {
  const ai = getGemini();

  const rubricContext = taskCategory === 'listen_repeat'
    ? 'The task is Listen and Repeat. The speaker heard an audio prompt and must reproduce it accurately.'
    : 'The task is Interview. The speaker responds to an audio question/prompt on a familiar topic.';

  const prompt = `You are a TOEFL Speaking examiner. ${rubricContext}

Evaluate the speaker's response across three dimensions:

1. DELIVERY: Clarity, fluency, pacing. Note: WPM should be 130-150. Excessive fillers (um, uh) and long pauses (>2s) are negative signals. Good delivery = clear pronunciation, natural pacing, minimal fillers.

2. LANGUAGE USE: Grammar accuracy, vocabulary range. Note errors in verb tense, articles, subject-verb agreement, word choice. Good language use = accurate grammar, varied vocabulary, appropriate register.

3. TOPIC DEVELOPMENT: Content quality and completeness. Note: Does the speaker address the topic? Are there specific supporting details vs. vague generalities? Is the response well-organized? Good topic development = full answer, specific details, logical structure.

Respond with ONLY a valid JSON object with this exact structure:
{
  \"delivery\": { \"score\": 0-4, \"evidence\": \"specific quote or observation from the response\", \"tip\": \"actionable improvement tip\" },
  \"languageUse\": { \"score\": 0-4, \"evidence\": \"specific quote or observation\", \"tip\": \"actionable improvement tip\" },
  \"topicDev\": { \"score\": 0-4, \"evidence\": \"specific quote or observation\", \"tip\": \"actionable improvement tip\" },
  \"overallScore\": 0-4,
  \"errors\": [\"error_type_1\", \"error_type_2\"],
  \"suggestion\": \"one sentence coaching tip for overall improvement\",
  \"transcript\": \"full verbatim transcription of the speaker's response\",
  \"wpm\": estimated_words_per_minute_as_number,
  \"fillerCount\": number_of_filler_words_detected_like_um_uh_like_you_know
}

Score guidelines: 4=strong, 3=good, 2=limited, 1=weak, 0=no response. Weight for overall: Delivery 30%, Language Use 30%, Topic Development 40%.

If the response is very short (<30 words) or off-topic, score Topic Development at 1 or below.
If the speaker uses excessive fillers (>6 per minute) or long pauses, score Delivery at 2 or below.
If there are multiple grammar errors of the same type, score Language Use at 2 or below.

Only respond with the JSON object, no additional text.`;

  const audioPart = {
    inlineData: { mimeType, data: audioBase64 },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }, audioPart] }],
    config: { responseMimeType: 'application/json' },
  });

  const text = response.text;
  if (!text) throw new Error('Gemini returned empty response');

  return JSON.parse(text) as ScoringResult;
}

export async function transcribeAudio(
  audioBase64: string,
  mimeType: string
): Promise<string> {
  const ai = getGemini();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{
      role: 'user',
      parts: [
        { text: 'Transcribe this audio exactly. Return only the text transcription, no explanations.' },
        { inlineData: { mimeType, data: audioBase64 } },
      ],
    }],
  });

  return response.text?.trim() ?? '';
}