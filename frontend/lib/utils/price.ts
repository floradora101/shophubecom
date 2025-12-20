/**
 * Formats a price value for display
 * @param price - The price value (number)
 * @param options - Formatting options
 * @returns Formatted price string (e.g., "$30" or "$29.99")
 */
export function formatPrice(
  price: number,
  options?: {
    /**
     * Whether to always show 2 decimal places (for cart/checkout/orders)
     * If false, removes trailing zeros (for product listings)
     * @default false
     */
    alwaysShowDecimals?: boolean;
    /**
     * Currency code
     * @default "USD"
     */
    currency?: string;
  }
): string {
  const { alwaysShowDecimals = false, currency = "USD" } = options || {};

  if (alwaysShowDecimals) {
    // For cart/checkout/orders: always show 2 decimals
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } else {
    // For product listings: show decimals only when needed
    // Format with up to 2 decimals, then remove trailing zeros
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

    // Remove trailing zeros and decimal point if not needed
    return formatted.replace(/\.00$/, "");
  }
}

/**
 * Formats a price range for display
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @param options - Formatting options
 * @returns Formatted price range string (e.g., "$30 - $50" or "$29.99 - $49.99")
 */
export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  options?: {
    alwaysShowDecimals?: boolean;
    currency?: string;
  }
): string {
  const min = formatPrice(minPrice, options);
  const max = formatPrice(maxPrice, options);
  return `${min} - ${max}`;
}
