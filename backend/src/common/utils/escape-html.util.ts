/**
 * Escape user-provided strings for safe HTML interpolation.
 * Prevents XSS/HTML injection when rendering emails or HTML templates.
 *
 * Replaces: & < > " '
 */
export function escapeHtml(str: string | null | undefined): string {
  if (str == null || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
