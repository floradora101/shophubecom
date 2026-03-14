const MULTIPLIERS_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

const MULTIPLIERS_S: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
};

/**
 * Parse a compact duration string (e.g. "15m", "7d", "3600s") to milliseconds.
 * Returns `fallbackMs` when the value is falsy or doesn't match the pattern.
 */
export function parseDurationToMs(value: string | undefined, fallbackMs: number): number {
  if (!value) return fallbackMs;
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return fallbackMs;
  const [, amountStr, unit] = match;
  return parseInt(amountStr, 10) * (MULTIPLIERS_MS[unit] ?? 1000);
}

/**
 * Parse a compact duration string (e.g. "15m", "7d", "3600s") to seconds.
 * Returns `fallbackSeconds` when the value is falsy or doesn't match the pattern.
 */
export function parseDurationToSeconds(value: string | undefined, fallbackSeconds: number): number {
  if (!value) return fallbackSeconds;
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return fallbackSeconds;
  const [, amountStr, unit] = match;
  return parseInt(amountStr, 10) * (MULTIPLIERS_S[unit] ?? 1);
}
