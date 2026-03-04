import type { PrismaClient } from '@prisma/client';

/**
 * Transaction client type for Prisma operations within $transaction callbacks.
 * Omits methods that must not be used inside a transaction context.
 * Use this type for service methods that accept a transaction client.
 */
export type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
