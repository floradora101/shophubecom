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

/**
 * Calculates and formats the remaining time for an offer countdown
 * Uses UTC timezone for consistency with backend
 * Shows hours when less than 48 hours remain
 * @param endDate - ISO date string when the offer ends
 * @returns Formatted countdown string (e.g., "2 days left", "5 hours left", "Ending soon")
 */
export function formatOfferCountdown(endDate: string): string {
  try {
    // Use UTC time for both current time and end time for consistency
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();

    // Calculate time remaining in milliseconds
    const timeLeft = Math.max(0, end - now);

    // Convert to different time units
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor(timeLeft / (1000 * 60));

    // Use Intl.RelativeTimeFormat for nicer output
    const rtf = new Intl.RelativeTimeFormat('en', {
      numeric: 'always',
      style: 'long'
    });

    // Show hours when less than 48 hours remain (2 days)
    if (hours < 48) {
      if (hours === 0) {
        // Less than 1 hour - show minutes or "Ending soon"
        if (minutes <= 5) {
          return "Ending soon";
        }
        return rtf.format(minutes, 'minute');
      }
      return rtf.format(hours, 'hour');
    }

    // Show days for longer periods
    if (days === 0) {
      return "Ending soon";
    }

    return rtf.format(days, 'day');
  } catch (error) {
    console.warn('Error calculating countdown:', error);
    return "Ending soon";
  }
}