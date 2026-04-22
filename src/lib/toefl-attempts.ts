export type ToeflAttemptSummary = Record<string, unknown>;

export function parseAttemptsResponse(data: unknown): ToeflAttemptSummary[] {
  return Array.isArray(data) ? data : [];
}
