/**
 * Date formatting utilities
 * Provides consistent date formatting across the application
 */

/**
 * Formats a date string to a localized date string
 * @param value - Date string or null/undefined
 * @returns Formatted date string or "—" if value is empty
 */
export function formatDate(value?: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
}

/**
 * Formats a date string to a localized date and time string
 * @param value - Date string or null/undefined
 * @returns Formatted date and time string or "—" if value is empty
 */
export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}
