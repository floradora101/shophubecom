import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductNotFoundException } from '../common/exceptions/product-not-found.exception';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all favorite product IDs for a user
   */
  async findAll(userId: string): Promise<string[]> {
    const favorites = await this.prisma.userFavorite.findMany({
      where: { userId },
      select: { productId: true },
    });
    return favorites.map((f) => f.productId);
  }

  /**
   * Add a product to user's favorites
   */
  async add(userId: string, productId: string): Promise<void> {
    await this.ensureProductExists(productId);
    await this.prisma.userFavorite.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      create: { userId, productId },
      update: {},
    });
  }

  /**
   * Remove a product from user's favorites
   */
  async remove(userId: string, productId: string): Promise<void> {
    await this.prisma.userFavorite.deleteMany({
      where: { userId, productId },
    });
  }

  /**
   * Sync multiple product IDs (replace user's favorites with given list)
   */
  async sync(userId: string, productIds: string[]): Promise<string[]> {
    const uniqueIds = [...new Set(productIds)];
    for (const id of uniqueIds) {
      await this.ensureProductExists(id);
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.userFavorite.deleteMany({ where: { userId } });
      if (uniqueIds.length > 0) {
        await tx.userFavorite.createMany({
          data: uniqueIds.map((productId) => ({ userId, productId })),
          skipDuplicates: true,
        });
      }
    });
    return this.findAll(userId);
  }

  private async ensureProductExists(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      throw new ProductNotFoundException();
    }
  }
}
