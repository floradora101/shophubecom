import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CategoryNotFoundException,
  ProductNotFoundException,
} from '../common/exceptions';
import { hasVariantImage } from '../common/utils/image.util';
import {
  ensureUniqueSlugInDb,
  generateSlug,
} from '../common/utils/slug.util';
import {
  CreateProductDto,
  UpdateProductDto,
  FilterProductsDto,
  ProductResponseDto,
} from './dto';
import { ProductMapperService } from './services/product-mapper.service';
import { VariantService } from './services/variant.service';
import { ProductPromotionService } from './services/product-promotion.service';
import { ProductQueryService } from './services/product-query.service';
import { CategoriesService } from '../categories/categories.service';
import type { PrismaTransactionClient } from '../common/types/prisma-transaction.client';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: {
      include: {
        parent: true;
        _count: { select: { products: true } };
      };
    };
    variants: { include: { options: true } };
    defaultVariant: {
      select: { id: true; image: true; images: true };
    };
    promotionProducts: { include: { promotion: true } };
  };
}>;

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  private readonly productInclude = {
    category: {
      include: {
        parent: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    },
    variants: { include: { options: true } },
    defaultVariant: {
      select: {
        id: true,
        image: true,
        images: true,
      },
    },
    promotionProducts: {
      include: {
        promotion: true,
      },
    },
  } as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly productMapper: ProductMapperService,
    private readonly variantService: VariantService,
    private readonly categoriesService: CategoriesService,
    private readonly productPromotionService: ProductPromotionService,
    private readonly productQueryService: ProductQueryService,
  ) {}


  async findAll(
    filters: FilterProductsDto,
    isAdmin = false,
  ): Promise<{
    data: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.productQueryService.findAll(filters, isAdmin);
  }

  async findOne(idOrSlug: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: this.productInclude,
    });

    if (!product) {
      throw new ProductNotFoundException();
    }

    const categoryPromotionsMap =
      await this.productPromotionService.getCategoryPromotionsForCategories([product.categoryId]);
    return this.productMapper.toProductResponse(
      product,
      categoryPromotionsMap.get(product.categoryId),
    );
  }

  /**
   * Featured products: manually curated via isFeatured flag.
   * Used for homepage "Featured" section.
   */
  async findFeatured(limit = 8): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: this.productInclude,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const categoryIds = [...new Set(products.map((p) => p.categoryId))];
    const categoryPromotionsMap =
      await this.productPromotionService.getCategoryPromotionsForCategories(categoryIds);
    return products.map((product) =>
      this.productMapper.toProductResponse(
        product,
        categoryPromotionsMap.get(product.categoryId),
      ),
    );
  }

  /**
   * Latest products: newest first by creation date.
   * Used for homepage "Latest" / "New Arrivals" section.
   */
  async findLatest(limit = 8): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: this.productInclude,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const categoryIds = [...new Set(products.map((p) => p.categoryId))];
    const categoryPromotionsMap =
      await this.productPromotionService.getCategoryPromotionsForCategories(categoryIds);
    return products.map((product) =>
      this.productMapper.toProductResponse(
        product,
        categoryPromotionsMap.get(product.categoryId),
      ),
    );
  }

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new CategoryNotFoundException();
    }

    const baseSlug = generateSlug(createProductDto.name);
    const uniqueSlug = await ensureUniqueSlugInDb(
      this.prisma,
      baseSlug,
      'product',
    );

    // Variants are required in SKU-first model
    if (!createProductDto.variants || createProductDto.variants.length === 0) {
      throw new BadRequestException(
        'At least one variant is required. Products must have variants.',
      );
    }

    const variants = createProductDto.variants;

    // Check for duplicate SKUs within the provided variants
    const skus = variants.map((v) => v.sku);
    const duplicateSkus = skus.filter(
      (sku, index) => skus.indexOf(sku) !== index,
    );
    if (duplicateSkus.length > 0) {
      throw new BadRequestException(
        `Duplicate SKUs found within the provided variants: ${duplicateSkus.join(', ')}. Each variant must have a unique SKU.`,
      );
    }

    // Check for existing SKUs in the database
    const existingVariants = await this.prisma.productVariant.findMany({
      where: {
        sku: {
          in: skus,
        },
      },
      select: {
        sku: true,
      },
    });

    if (existingVariants.length > 0) {
      const existingSkus = existingVariants.map((v) => v.sku);
      throw new BadRequestException(
        `The following SKUs already exist in the database: ${existingSkus.join(', ')}. Each SKU must be unique.`,
      );
    }

    // Use provided variants
    const variantsToCreate = variants.map((variant) => ({
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      image: variant.image,
      images: variant.images ?? [],
      options: this.variantService.buildVariantOptions(variant.options),
    }));

    const product = await this.prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: createProductDto.name,
          slug: uniqueSlug,
          description: createProductDto.description,
          specs: createProductDto.specs
            ? (createProductDto.specs as Prisma.InputJsonValue)
            : undefined,
          // Derived fields (price, minPrice, maxPrice, effectiveStock) are calculated on-the-fly from variants
          currency: (createProductDto.currency ?? 'USD').toUpperCase(),
          categoryId: createProductDto.categoryId,
          isActive: createProductDto.isActive ?? true,
          isFeatured: createProductDto.isFeatured ?? false,
          isOnSale: createProductDto.isOnSale ?? false,
          discountType: createProductDto.discountType ?? null,
          discountValue:
            createProductDto.discountValue !== undefined
              ? createProductDto.discountValue
              : null,
          saleStartsAt: createProductDto.saleStartsAt
            ? new Date(createProductDto.saleStartsAt)
            : null,
          saleEndsAt: createProductDto.saleEndsAt
            ? new Date(createProductDto.saleEndsAt)
            : null,
          variants: {
            create: variantsToCreate.map((variant) => ({
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock,
              image: variant.image,
              images: variant.images ?? [],
              options: variant.options,
            })),
          },
        },
        include: this.productInclude,
      }) as ProductWithRelations;

      // Set defaultVariantId using smart fallback (prefers variant with image)
      if (created.variants && created.variants.length > 0) {
        const fallbackVariantId = this.variantService.selectDefaultVariantFallback(
          created.variants.map((v) => ({
            id: v.id,
            stock: v.stock,
            image: v.image,
            images: v.images,
          })),
        );
        if (fallbackVariantId) {
          // Validate that the variant belongs to this product (should always pass here, but for safety)
          await this.variantService.validateDefaultVariant(tx, created.id, fallbackVariantId);
          await tx.product.update({
            where: { id: created.id },
            data: { defaultVariant: { connect: { id: fallbackVariantId } } },
          });
        }
      }

      // Derived fields are calculated on-the-fly, no need to store them

      return tx.product.findUnique({
        where: { id: created.id },
        include: this.productInclude,
      });
    });

    if (!product) {
      throw new ProductNotFoundException();
    }

    this.logger.log(`Product created: ${product.id} - ${product.name}`);
    const categoryPromotionsMap =
      await this.productPromotionService.getCategoryPromotionsForCategories([product.categoryId]);
    return this.productMapper.toProductResponse(
      product,
      categoryPromotionsMap.get(product.categoryId),
    );
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const existing = await this.prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new ProductNotFoundException();
    }

    if (updateProductDto.categoryId !== undefined) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new CategoryNotFoundException();
      }
    }

    const data: Prisma.ProductUpdateInput = {};

    if (updateProductDto.name !== undefined) {
      if (updateProductDto.name !== existing.name) {
        data.name = updateProductDto.name;

        const baseSlug = generateSlug(updateProductDto.name);
        const existingProduct = await this.prisma.product.findFirst({
          where: {
            slug: baseSlug,
            id: { not: id },
          },
          select: { slug: true },
        });

        if (existingProduct) {
          data.slug = await ensureUniqueSlugInDb(this.prisma, baseSlug, 'product', id);
        } else {
          data.slug = baseSlug;
        }
      }
    }

    if (updateProductDto.description !== undefined) {
      data.description = updateProductDto.description;
    }

    // Price and stock are derived from variants - do NOT accept them directly
    // If variants are updated, price/stock will be recalculated automatically

    if (updateProductDto.currency !== undefined) {
      if (updateProductDto.currency) {
        data.currency = updateProductDto.currency.toUpperCase();
      }
    }

    if (updateProductDto.isOnSale !== undefined) {
      data.isOnSale = updateProductDto.isOnSale;
    }

    if (updateProductDto.discountType !== undefined) {
      data.discountType = updateProductDto.discountType;
    }

    if (updateProductDto.discountValue !== undefined) {
      data.discountValue = updateProductDto.discountValue;
    }

    if (updateProductDto.saleStartsAt !== undefined) {
      data.saleStartsAt = updateProductDto.saleStartsAt
        ? new Date(updateProductDto.saleStartsAt)
        : null;
    }

    if (updateProductDto.saleEndsAt !== undefined) {
      data.saleEndsAt = updateProductDto.saleEndsAt
        ? new Date(updateProductDto.saleEndsAt)
        : null;
    }

    if (updateProductDto.categoryId !== undefined) {
      data.category = {
        connect: { id: updateProductDto.categoryId },
      };
    }

    if (updateProductDto.isActive !== undefined) {
      data.isActive = updateProductDto.isActive;
    }

    if (updateProductDto.isFeatured !== undefined) {
      data.isFeatured = updateProductDto.isFeatured;
    }

    // Validate defaultVariantId if provided (validate before transaction)
    if (updateProductDto.defaultVariantId !== undefined) {
      if (updateProductDto.defaultVariantId === null) {
        data.defaultVariant = { disconnect: true };
      } else {
        await this.variantService.validateDefaultVariant(
          this.prisma,
          id,
          updateProductDto.defaultVariantId,
        );
        data.defaultVariant = { connect: { id: updateProductDto.defaultVariantId } };
      }
    }

    const variantsPayload = updateProductDto.variants;
    const hasVariantPayload = variantsPayload !== undefined;

    if (Object.keys(data).length === 0 && !hasVariantPayload) {
      const unchanged = await this.prisma.product.findUnique({
        where: { id },
        include: this.productInclude,
      });

      if (!unchanged) {
        throw new ProductNotFoundException();
      }

      const categoryPromotionsMap =
        await this.productPromotionService.getCategoryPromotionsForCategories([unchanged.categoryId]);
      return this.productMapper.toProductResponse(
        unchanged,
        categoryPromotionsMap.get(unchanged.categoryId),
      );
    }

    try {
      const product = await this.prisma.$transaction(async (tx) => {
        if (hasVariantPayload) {
          // Sync variants - derived fields (effectiveStock, minPrice, maxPrice, price) are calculated on-the-fly
          await this.variantService.syncVariants(tx, id, variantsPayload ?? []);

          // Update defaultVariantId if needed
          const updatedProduct = await tx.product.findUnique({
            where: { id },
            include: { variants: true },
          });

          if (updatedProduct && updatedProduct.variants.length > 0) {
            const currentDefaultVariantId = updatedProduct.defaultVariantId;
            const currentDefaultVariant = updatedProduct.variants.find(
              (v) => v.id === currentDefaultVariantId,
            );

            // Check if default variant is missing, deleted, or has no images
            const needsFallback =
              !currentDefaultVariant ||
              !hasVariantImage({
                image: currentDefaultVariant.image,
                images: currentDefaultVariant.images,
              });

            if (needsFallback) {
              const fallbackVariantId = this.variantService.selectDefaultVariantFallback(
                updatedProduct.variants.map((v) => ({
                  id: v.id,
                  stock: v.stock,
                  image: v.image,
                  images: v.images,
                })),
              );
              if (fallbackVariantId) {
                // Validate (should always pass, but for safety)
                await this.variantService.validateDefaultVariant(tx, id, fallbackVariantId);
                data.defaultVariant = { connect: { id: fallbackVariantId } };
              }
            }
          }
        }
        // Note: Price and stock cannot be updated directly - they must be updated via variants

        return tx.product.update({
          where: { id },
          data,
          include: this.productInclude,
        });
      });

      this.logger.log(`Product updated: ${product.id} - ${product.name}`);
      const categoryPromotionsMap =
        await this.productPromotionService.getCategoryPromotionsForCategories([product.categoryId]);
      return this.productMapper.toProductResponse(
        product,
        categoryPromotionsMap.get(product.categoryId),
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(`Unique constraint violation updating product ${id}`);
        const target = error.meta?.target;
        if (Array.isArray(target) && target.includes('sku')) {
          throw new ConflictException(
            'A variant with this SKU already exists. Each SKU must be unique.',
          );
        }
        throw new ConflictException(
          'Product with this name or slug already exists',
        );
      }

      if (error instanceof Error) {
        this.logger.error(
          `Failed to update product ${id}: ${error.message}`,
          error.stack,
        );
      }

      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { cartItems: true, orderItems: true },
    });

    if (!product) {
      throw new ProductNotFoundException();
    }

    if (product.cartItems.length > 0 || product.orderItems.length > 0) {
      await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      this.logger.log(`Product soft-deleted: ${id} - ${product.name}`);
    } else {
      await this.prisma.product.delete({ where: { id } });
      this.logger.log(`Product deleted: ${id} - ${product.name}`);
    }
  }

  /**
   * Invalidate promotions cache. Call when promotions are created/updated/deleted.
   * Used by PromotionsService to ensure product listing shows fresh promotion data.
   */
  invalidatePromotionsCache(): void {
    this.productPromotionService.invalidatePromotionsCache();
  }
}
