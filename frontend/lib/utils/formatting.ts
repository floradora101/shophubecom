/**
 * Formatting Utilities
 *
 * Consolidated formatting functions for price, date, currency, and other display values.
 *
 * This module re-exports formatting utilities from specialized modules for convenience
 * and provides a single import point for all formatting functions.
 *
 * @see NEXT_REFACTORING_STRATEGIC_ROADMAP.md - Phase 3.2: Utility Consolidation
 */

// Re-export price formatting utilities
export {
  formatPrice,
  formatPriceRange,
} from "./price";

// Re-export date formatting utilities
export {
  formatDate,
  formatDateTime,
  formatOfferCountdown,
  getDetailedCountdown,
} from "./date";

/**
 * Formats a currency value for display
 * @param value - The numeric value to format
 * @param currency - ISO currency code (default: "USD")
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options || {};

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

/**
 * Formats a percentage value for display
 * @param value - The numeric value (0-100 or 0-1)
 * @param options - Formatting options
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  options?: {
    /** If true, treats value as 0-1 (0.25 = 25%). If false, treats as 0-100 (25 = 25%) */
    fromDecimal?: boolean;
    /** Number of decimal places */
    decimals?: number;
  }
): string {
  const { fromDecimal = false, decimals = 0 } = options || {};
  const percentage = fromDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Formats a number with thousands separator
 * @param value - The numeric value
 * @param options - Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const { minimumFractionDigits = 0, maximumFractionDigits = 2 } = options || {};

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}