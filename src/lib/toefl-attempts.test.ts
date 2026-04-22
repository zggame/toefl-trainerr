import { describe, expect, test } from 'vitest';
import { parseAttemptsResponse } from './toefl-attempts';

describe('parseAttemptsResponse', () => {
  test('returns an empty list when the API returns an error object', () => {
    expect(parseAttemptsResponse({ error: 'Unauthorized' })).toEqual([]);
  });

  test('keeps array responses unchanged', () => {
    const attempts = [{ id: 'attempt-1', overall_score: 4 }];
    expect(parseAttemptsResponse(attempts)).toBe(attempts);
  });
});
