import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoriesService } from '../../categories/categories.service';
import { TtlCache } from '../../common/utils/ttl-cache.util';

const PROMOTIONS_CACHE_TTL = 120;

export type CategoryPromotion = {
  id: string;
  type: string;
  value: unknown;
  startsAt: Date | null;
  expiresAt: Date | null;
};

@Injectable()
export class ProductPromotionService {
  private readonly logger = new Logger(ProductPromotionService.name);
  private readonly promotionsCache = new TtlCache<
    string,
    Array<{
      id: string;
      type: string;
      value: unknown;
      startsAt: Date | null;
      expiresAt: Date | null;
      promotionCategories: Array<{ categoryId: string; applyToDescendants: boolean }>;
    }>
  >(PROMOTIONS_CACHE_TTL);

  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * Get promotions that apply to products in the given categories via PromotionCategory.
   * Respects applyToDescendants: when true, promotion applies to category and its descendants.
   */
  async getCategoryPromotionsForCategories(
    categoryIds: string[],
  ): Promise<Map<string, CategoryPromotion[]>> {
    if (categoryIds.length === 0) {
      return new Map();
    }

    const now = new Date();
    const cacheKey = 'promotions:active';

    let promotions = this.promotionsCache.get(cacheKey);
    if (!promotions) {
      const raw = await this.prisma.promotion.findMany({
        where: {
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
          ],
          promotionCategories: { some: {} },
        },
        include: { promotionCategories: true },
      });
      promotions = raw.map((p) => ({
        id: p.id,
        type: p.type,
        value: p.value,
        startsAt: p.startsAt,
        expiresAt: p.expiresAt,
        promotionCategories: p.promotionCategories.map((pc) => ({
          categoryId: pc.categoryId,
          applyToDescendants: pc.applyToDescendants,
        })),
      }));
      this.promotionsCache.set(cacheKey, promotions);
    }

    const ancestorMap = new Map<string, string[]>();
    for (const catId of [...new Set(categoryIds)]) {
      try {
        ancestorMap.set(
          catId,
          await this.categoriesService.getAncestorCategoryIds(catId),
        );
      } catch {
        ancestorMap.set(catId, [catId]);
      }
    }

    const result = new Map<string, CategoryPromotion[]>();

    for (const catId of categoryIds) {
      const ancestors = ancestorMap.get(catId) ?? [catId];
      const applicable: CategoryPromotion[] = [];

      for (const prom of promotions) {
        for (const pc of prom.promotionCategories) {
          if (!ancestors.includes(pc.categoryId)) continue;
          const isDirect = pc.categoryId === catId;
          if (isDirect || pc.applyToDescendants) {
            applicable.push({
              id: prom.id,
              type: prom.type,
              value: prom.value,
              startsAt: prom.startsAt,
              expiresAt: prom.expiresAt,
            });
            break;
          }
        }
      }
      result.set(catId, applicable);
    }

    return result;
  }

  invalidatePromotionsCache(): void {
    this.promotionsCache.delete('promotions:active');
    this.logger.debug('Promotions cache invalidated');
  }
}
