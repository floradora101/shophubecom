import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductVariantNotFoundException } from '../../common/exceptions';
import type { PrismaTransactionClient } from '../../common/types/prisma-transaction.client';
import { hasVariantImage } from '../../common/utils/image.util';
import { UpdateProductVariantDto } from '../dto';

/**
 * Service responsible for variant operations: syncing, validation, and default variant selection
 */
@Injectable()
export class VariantService {
  /**
   * Validates that defaultVariantId belongs to the same product.
   * Throws BadRequestException if validation fails.
   */
  async validateDefaultVariant(
    tx: PrismaTransactionClient,
    productId: string,
    defaultVariantId: string | null | undefined,
  ): Promise<void> {
    if (!defaultVariantId) {
      return; // null/undefined is allowed
    }

    const variant = await tx.productVariant.findUnique({
      where: { id: defaultVariantId },
      select: { id: true, productId: true },
    });

    if (!variant) {
      throw new BadRequestException(
        `Default variant with id "${defaultVariantId}" does not exist`,
      );
    }

    if (variant.productId !== productId) {
      throw new BadRequestException(
        'Default variant must belong to the same product',
      );
    }
  }

  /**
   * Selects a default variant fallback based on priority:
   * 1. Variant with stock > 0 and image
   * 2. Variant with image
   * 3. First variant
   */
  selectDefaultVariantFallback(
    variants: Array<{
      id: string;
      stock: number;
      image?: string | null;
      images?: string[] | null;
    }>,
  ): string | null {
    if (variants.length === 0) {
      return null;
    }

    // Priority 1: variant with stock > 0 and image
    const withStockAndImage = variants.find(
      (v) => v.stock > 0 && hasVariantImage(v),
    );

    if (withStockAndImage) {
      return withStockAndImage.id;
    }

    // Priority 2: variant with image (regardless of stock)
    const withImage = variants.find((v) => hasVariantImage(v));

    if (withImage) {
      return withImage.id;
    }

    // Priority 3: first variant
    return variants[0].id;
  }

  /**
   * Builds Prisma variant options data structure from Record<string, string>
   */
  buildVariantOptions(options?: Record<string, string>) {
    const entries = options
      ? Object.entries(options).filter(
          ([key, value]) => key && value != null,
        )
      : [];

    if (!entries.length) {
      return undefined;
    }

    return {
      create: entries.map(([name, value]) => ({
        name,
        value,
      })),
    };
  }

  /**
   * Syncs variants for a product: creates, updates, and deletes variants.
   * Returns the total stock count after sync.
   */
  async syncVariants(
    tx: PrismaTransactionClient,
    productId: string,
    variants: UpdateProductVariantDto[],
  ): Promise<number> {
    const existingVariants = await tx.productVariant.findMany({
      where: { productId },
      include: {
        options: true,
        cartItems: { select: { id: true } },
        orderItems: { select: { id: true } },
      },
    });

    const existingMap = new Map(
      existingVariants.map((variant: { id: string }) => [variant.id, variant]),
    );
    const incomingIds = new Set(
      variants
        .filter((variant) => Boolean(variant.id))
        .map((variant) => variant.id as string),
    );

    // Check for duplicate SKUs within the provided variants
    const incomingSkus = variants
      .filter((v) => v.sku)
      .map((v) => v.sku as string);
    const duplicateSkus = incomingSkus.filter(
      (sku, index) => incomingSkus.indexOf(sku) !== index,
    );
    if (duplicateSkus.length > 0) {
      throw new BadRequestException(
        `Duplicate SKUs found within the provided variants: ${duplicateSkus.join(', ')}. Each variant must have a unique SKU.`,
      );
    }

    // Check for SKU conflicts with existing variants (excluding current product's variants)
    if (incomingSkus.length > 0) {
      const existingSkusInOtherProducts = await tx.productVariant.findMany({
        where: {
          sku: { in: incomingSkus },
          productId: { not: productId },
        },
        select: { sku: true },
      });

      if (existingSkusInOtherProducts.length > 0) {
        const conflictingSkus = existingSkusInOtherProducts.map(
          (v: { sku: string }) => v.sku,
        );
        throw new BadRequestException(
          `The following SKUs already exist in other products: ${conflictingSkus.join(', ')}. Each SKU must be unique.`,
        );
      }

      // Check for SKU conflicts within the current product (for new variants or updated SKUs)
      for (const variant of variants) {
        if (variant.sku) {
          const existingVariantWithSku = existingVariants.find(
            (ev: { sku: string; id: string }) => ev.sku === variant.sku && ev.id !== variant.id,
          );
          if (existingVariantWithSku) {
            throw new BadRequestException(
              `SKU "${variant.sku}" is already used by another variant in this product.`,
            );
          }
        }
      }
    }

    const variantsToRemove = existingVariants.filter(
      (variant: { id: string }) => !incomingIds.has(variant.id),
    );

    for (const variant of variantsToRemove) {
      if (variant.cartItems.length === 0 && variant.orderItems.length === 0) {
        await tx.variantOption.deleteMany({
          where: { productVariantId: variant.id },
        });
        await tx.productVariant.delete({ where: { id: variant.id } });
      } else {
        await tx.variantOption.deleteMany({
          where: { productVariantId: variant.id },
        });
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: 0 },
        });
      }
    }

    for (const variant of variants) {
      if (variant.id && existingMap.has(variant.id)) {
        const updateData: Prisma.ProductVariantUpdateInput = {};
        if (variant.sku !== undefined) {
          updateData.sku = variant.sku;
        }
        if (variant.price !== undefined) {
          updateData.price = variant.price;
        }
        if (variant.stock !== undefined) {
          updateData.stock = variant.stock;
        }
        if (variant.image !== undefined) {
          updateData.image = variant.image;
        }
        if (variant.images !== undefined) {
          updateData.images = variant.images;
        }
        if (variant.options !== undefined) {
          await tx.variantOption.deleteMany({
            where: { productVariantId: variant.id },
          });
          const optionData = this.buildVariantOptions(variant.options);
          if (optionData) {
            updateData.options = optionData;
          }
        }

        await tx.productVariant.update({
          where: { id: variant.id },
          data: updateData,
        });
      } else {
        if (variant.id) {
          throw new ProductVariantNotFoundException();
        } else {
          if (
            !variant.sku ||
            variant.price === undefined ||
            variant.stock === undefined
          ) {
            throw new BadRequestException(
              'New variants must include sku, price, and stock',
            );
          }

          await tx.productVariant.create({
            data: {
              productId,
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock,
              image: variant.image,
              images: variant.images ?? [],
              options: this.buildVariantOptions(variant.options),
            },
          });
        }
      }
    }

    const aggregate = await tx.productVariant.aggregate({
      where: { productId },
      _sum: { stock: true },
    });

    return aggregate._sum.stock ?? 0;
  }
}
