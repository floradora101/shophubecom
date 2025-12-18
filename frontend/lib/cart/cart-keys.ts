/**
 * Cart Query Keys
 *
 * Single source of truth: ["cart"]
 * Backend handles guest vs user identification via cookies/JWT.
 * Frontend never branches query keys by auth state.
 */

export const cartKeys = {
  all: ["cart"] as const,
};
