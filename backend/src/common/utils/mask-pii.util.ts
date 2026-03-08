/**
 * Mask PII (Personally Identifiable Information) for safe logging.
 * Prevents full email addresses from appearing in logs (GDPR, security).
 *
 * Examples:
 *   john.doe@example.com  → joh***@example.com
 *   a@b.co                 → a***@b.co
 */
export function maskEmail(email: string | null | undefined): string {
  if (email == null || typeof email !== 'string') return '[redacted]';
  const atIdx = email.indexOf('@');
  if (atIdx <= 0) return '[redacted]';
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 3);
  return `${visible}***${domain}`;
}
