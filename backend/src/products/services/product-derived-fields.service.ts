import { Injectable } from '@nestjs/common';
import { toNumber } from '../../common/utils/decimal.util';
import type { PrismaTransactionClient } from '../../common/types/prisma-transaction.client';

/**
 * Service responsible for computing derived product fields (effectiveStock, minPrice, maxPrice, price)
 * These fields are now calculated on-the-fly from variants, not stored in the database.
 */
@Injectable()
export class ProductDerivedFieldsService {
  /**
   * Computes derived fields from variant aggregates.
   * Computes: effectiveStock (sum of variant stocks), minPrice, maxPrice, and price (set to minPrice).
   * Used for validation and calculations, but fields are no longer stored in the database.
   */
  async computeDerivedFields(
    tx: PrismaTransactionClient,
    productId: string,
  ): Promise<{
    effectiveStock: number;
    minPrice: number;
    maxPrice: number;
    price: number;
  }> {
    const aggregate = await tx.productVariant.aggregate({
      where: { productId },
      _sum: { stock: true },
      _min: { price: true },
      _max: { price: true },
    });

    const effectiveStock = aggregate._sum.stock ?? 0;
    const minPrice = aggregate._min.price ? Number(aggregate._min.price) : 0;
    const maxPrice = aggregate._max.price ? Number(aggregate._max.price) : 0;
    const price = minPrice;

    // No longer updating the database - fields are calculated on-the-fly
    return { effectiveStock, minPrice, maxPrice, price };
  }
}
