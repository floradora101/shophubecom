/**
 * Demo checkout mode — creates orders client-side without backend.
 * FORCED OFF in production for security (no stock decrement, no real orders).
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
