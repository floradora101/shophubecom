import { randomBytes } from 'crypto';

/**
 * Generate a collision-resistant order number.
 * Uses crypto.randomBytes for uniqueness; timestamp prefix aids debugging.
 * For high-volume production, consider a database sequence for sequential ordering.
 */
export function generateOrderNumber(): string {
  const suffix = randomBytes(6).toString('hex').toUpperCase();
  return `ORD-${Date.now()}-${suffix}`;
}
