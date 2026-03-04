import type { Prisma } from '@prisma/client';

/**
 * Convert Prisma Decimal, number, or null/undefined to number
 * Used consistently across services to handle Prisma Decimal types
 */
export function toNumber(value?: Prisma.Decimal | number | null): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return Number(value);
}
