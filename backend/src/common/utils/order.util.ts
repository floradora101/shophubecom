import type { PrismaClient } from '@prisma/client';

/**
 * Generate a sequential, human-friendly order number using PostgreSQL sequence.
 * Format: ORD-10001, ORD-10002, etc.
 * Collision-free, no timestamp leak, customer-friendly.
 */
export async function generateOrderNumber(
  prisma: PrismaClient,
): Promise<string> {
  const result = await prisma.$queryRaw<[{ nextval: bigint }]>`
    SELECT nextval('order_number_seq')
  `;
  const seq = result[0].nextval.toString().padStart(5, '0');
  return `ORD-${seq}`;
}
