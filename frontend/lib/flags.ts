/**
 * Feature flags for dual mock/API mode.
 *
 * Production safety:
 * - Both flags are FORCED OFF when NODE_ENV=production (next.config build guard rejects if env set)
 * - Mock code uses dynamic import() so mock-data is only loaded when USE_MOCKS=true
 */
const isProduction = process.env.NODE_ENV === "production";
const envDemoCheckout = process.env.NEXT_PUBLIC_DEMO_CHECKOUT === "true";

export const DEMO_CHECKOUT = envDemoCheckout && !isProduction;

/**
 * Mock data mode — uses local mock data instead of API.
 * FORCED OFF in production; only enabled when NEXT_PUBLIC_USE_MOCKS=true in development.
 */
export const USE_MOCKS =
  !isProduction && process.env.NEXT_PUBLIC_USE_MOCKS === "true";

if (isProduction && (process.env.NEXT_PUBLIC_USE_MOCKS === "true" || envDemoCheckout)) {
  console.error(
    "[ShopHub] Production safety: USE_MOCKS or DEMO_CHECKOUT are ignored in production. " +
      "Set NEXT_PUBLIC_USE_MOCKS=false and NEXT_PUBLIC_DEMO_CHECKOUT=false in your production environment."
  );
}
