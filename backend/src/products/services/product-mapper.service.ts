import { Injectable } from '@nestjs/common';
import { Prisma, DiscountType } from '@prisma/client';
import { toNumber } from '../../common/utils/decimal.util';
import { transformVariantOptions } from '../../common/utils/variant.util';
import { ProductResponseDto } from '../dto';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: {
      include: {
        parent: true;
        _count: {
          select: {
            products: true;
          };
        };
      };
    };
    variants: {
      include: { options: true };
    };
    defaultVariant: {
      select: {
        id: true;
        image: true;
        images: true;
      };
    };
    promotionProducts: {
      include: {
        promotion: true;
      };
    };
  };
}>;

/** Promotion with minimal fields needed for discount display */
type PromotionForProduct = {
  id: string;
  type: string;
  value: unknown;
  startsAt: Date | null;
  expiresAt: Date | null;
};

/**
 * Service responsible for transforming Prisma product models to ProductResponseDto
 */
@Injectable()
export class ProductMapperService {
  toProductResponse(
    product: ProductWithRelations,
    categoryPromotions?: PromotionForProduct[],
  ): ProductResponseDto {
    // Calculate derived fields from variants
    const variantPrices = product.variants?.map((v) => toNumber(v.price)) ?? [];
    const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
    const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : 0;
    const effectiveStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
    const price = minPrice; // Price is the minimum variant price

    // Promotion logic: Check for active promotions
    let isOnSale = product.isOnSale ?? false;
    let discountType = product.discountType as DiscountType | null;
    let discountValue = product.discountValue !== null ? toNumber(product.discountValue) : null;
    let saleStartsAt = product.saleStartsAt;
    let saleEndsAt = product.saleEndsAt;

    const now = new Date();

    const filterActive = (p: {
      isActive: boolean;
      startsAt: Date | null;
      expiresAt: Date | null;
    }) => {
      if (!p.isActive) return false;
      if (p.startsAt && p.startsAt > now) return false;
      if (p.expiresAt && p.expiresAt < now) return false;
      return true;
    };

    const sortByBest = (
      a: { type: string; value: unknown },
      b: { type: string; value: unknown },
    ) => {
      if (a.type === 'PERCENTAGE' && b.type !== 'PERCENTAGE') return -1;
      if (a.type !== 'PERCENTAGE' && b.type === 'PERCENTAGE') return 1;
      return Number(b.value) - Number(a.value);
    };

    // Product-specific promotions
    const productPromotions = (product.promotionProducts ?? [])
      .map((pp) => pp.promotion)
      .filter(filterActive);

    // Category promotions (passed from ProductsService when pre-fetched)
    const categoryPromosFiltered = (categoryPromotions ?? []).filter((p) => {
      if (p.startsAt && p.startsAt > now) return false;
      if (p.expiresAt && p.expiresAt < now) return false;
      return true;
    });

    const activePromotions = [...productPromotions, ...categoryPromosFiltered]
      .filter(
        (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
      ) /* dedupe by id */
      .sort(sortByBest);

    if (activePromotions.length > 0) {
      const bestPromo = activePromotions[0];
      isOnSale = true;
      discountType = bestPromo.type as DiscountType;
      discountValue = toNumber(bestPromo.value as number);
      saleStartsAt = bestPromo.startsAt;
      saleEndsAt = bestPromo.expiresAt ?? null;
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? null,
      price,
      currency: product.currency,
      stock: effectiveStock,
      isFeatured: product.isFeatured ?? undefined,
      defaultVariantId: product.defaultVariantId ?? null,
      defaultVariant: product.defaultVariant
        ? {
            id: product.defaultVariant.id,
            image: product.defaultVariant.image,
            images: product.defaultVariant.images ?? [],
          }
        : null,
      isOnSale,
      discountType: discountType ?? undefined,
      discountValue,
      saleStartsAt: saleStartsAt ?? null,
      saleEndsAt: saleEndsAt ?? null,
      categoryId: product.categoryId,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
            description: product.category.description ?? null,
            image: product.category.image ?? null,
            parentId: product.category.parentId ?? null,
            parent: product.category.parent
              ? {
                  id: product.category.parent.id,
                  name: product.category.parent.name,
                  slug: product.category.parent.slug,
                }
              : null,
            createdAt: product.category.createdAt,
            updatedAt: product.category.updatedAt,
            productCount: product.category._count?.products ?? 0,
          }
        : null,
      variants: product.variants?.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        price: toNumber(variant.price),
        stock: variant.stock,
        image: variant.image,
        images: variant.images ?? [],
        options:
          variant.options && variant.options.length > 0
            ? transformVariantOptions(variant.options)
            : undefined,
      })),
      // Include minPrice and maxPrice for products with multiple variant prices
      // Only include if maxPrice > minPrice (indicating a price range)
      minPrice: maxPrice > minPrice ? minPrice : undefined,
      maxPrice: maxPrice > minPrice ? maxPrice : undefined,
      // Rating fields
      averageRating:
        product.averageRating !== undefined && product.averageRating !== null
          ? toNumber(product.averageRating)
          : undefined,
      reviewCount: product.reviewCount ?? undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
