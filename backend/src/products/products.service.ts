import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CategoryNotFoundException,
  ProductNotFoundException,
  ProductVariantNotFoundException,
} from '../common/exceptions';
import { ensureUniqueSlug, generateSlug } from '../common/utils/slug.util';
import {
  CreateProductDto,
  UpdateProductDto,
  FilterProductsDto,
  ProductResponseDto,
  UpdateProductVariantDto,
} from './dto';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: {
      include: {
        parent: true;
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
  };
}>;

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly productInclude = {
    category: {
      include: {
        parent: true,
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
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates that defaultVariantId belongs to the same product.
   * Throws BadRequestException if validation fails.
   * @param tx - Prisma transaction client (or regular client)
   * @param productId - The product ID to validate against
   * @param defaultVariantId - The variant ID to validate
   */
  private async validateDefaultVariant(
    tx: any, // Prisma transaction client or regular client
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
   * Smart fallback: Selects the best default variant when current default is invalid.
   * Priority: 1) in-stock variant with image, 2) any variant with image, 3) first variant
   * @param variants - Array of product variants
   * @returns Variant ID or null if no variants exist
   */
  private selectDefaultVariantFallback(
    variants: Array<{
      id: string;
      stock: number;
      image?: string | null;
      images?: string[] | null;
    }>,
  ): string | null {
    if (!variants || variants.length === 0) {
      return null;
    }

    // Helper: Check if variant has at least one image
    const hasImage = (variant: {
      image?: string | null;
      images?: string[] | null;
    }): boolean => {
      if (variant.image && variant.image.trim().length > 0) {
        return true;
      }
      if (
        variant.images &&
        Array.isArray(variant.images) &&
        variant.images.length > 0 &&
        variant.images.some((img) => img && img.trim().length > 0)
      ) {
        return true;
      }
      return false;
    };

    // Priority 1: in-stock variant with image
    const inStockWithImage = variants.find((v) => v.stock > 0 && hasImage(v));
    if (inStockWithImage) {
      return inStockWithImage.id;
    }

    // Priority 2: any variant with image
    const withImage = variants.find((v) => hasImage(v));
    if (withImage) {
      return withImage.id;
    }

    // Priority 3: first variant
    return variants[0].id;
  }

  /**
   * Find all products with filtering, pagination, and sorting support.
   *
   * FILTERING LOGIC:
   * - categoryId: Filters by exact category ID match
   * - minPrice/maxPrice: Filters products within price range (uses Prisma DecimalFilter)
   * - search: Case-insensitive search in product name and description fields
   * - inStockOnly: When true, returns only products with effectiveStock > 0
   * - isActive: Non-admin users only see active products (isActive = true)
   *
   * PAGINATION:
   * - Default: page 1, limit 20 items per page
   * - Calculates skip offset: (page - 1) * limit
   * - All filters are applied BEFORE pagination for correctness
   *
   * SORTING:
   * - Default: createdAt descending (newest first)
   * - Supported fields: 'price' | 'name' | 'createdAt'
   * - Supported orders: 'asc' | 'desc'
   *
   * PERFORMANCE:
   * - Uses Promise.all for parallel execution of data fetch and count query
   * - Includes related data (category, variants, variant options) in single query
   *
   * @param filters - Filter parameters (categoryId, minPrice, maxPrice, search, inStockOnly, page, limit, sortBy, sortOrder)
   * @param isAdmin - If true, includes inactive products in results
   * @returns Paginated product list with metadata (data, total, page, limit)
   */
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
    const {
      categoryId,
      minPrice,
      maxPrice,
      search,
      inStockOnly,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build Prisma where clause dynamically based on provided filters
    const where: Prisma.ProductWhereInput = {};

    // Non-admin users only see active products
    if (!isAdmin) {
      where.isActive = true;
    }

    // Filter by category ID (exact match)
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filter by price range using range overlap logic with minPrice/maxPrice
    // A product matches if ANY variant price falls within the filter range
    // This means: product.minPrice <= maxPriceFilter AND product.maxPrice >= minPriceFilter
    if (minPrice !== undefined || maxPrice !== undefined) {
      if (minPrice !== undefined && maxPrice !== undefined) {
        // Both min and max: product price range must overlap with filter range
        where.AND = [
          { minPrice: { lte: maxPrice } }, // Product's min price <= filter max
          { maxPrice: { gte: minPrice } }, // Product's max price >= filter min
        ];
      } else if (minPrice !== undefined) {
        // Only min: product's max price must be >= filter min
        where.maxPrice = { gte: minPrice };
      } else if (maxPrice !== undefined) {
        // Only max: product's min price must be <= filter max
        where.minPrice = { lte: maxPrice };
      }
    }

    // Search filter: case-insensitive search in name and description
    // Uses PostgreSQL ILIKE operator via Prisma's 'insensitive' mode
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by stock availability: only products with effectiveStock > 0
    // This must be applied BEFORE pagination to ensure correct totals and page counts
    if (inStockOnly === true) {
      where.effectiveStock = { gt: 0 };
    }

    // Calculate pagination offset
    const skip = (page - 1) * limit;

    // Build dynamic sort order
    // When sorting by price:
    // - ASC (low to high): sort by minPrice (lowest variant price first)
    // - DESC (high to low): sort by maxPrice (highest variant price first)
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    if (sortBy === 'price') {
      orderBy =
        sortOrder === 'asc' ? { minPrice: 'asc' } : { maxPrice: 'desc' };
    } else {
      orderBy = {
        [sortBy]: sortOrder,
      } as Prisma.ProductOrderByWithRelationInput;
    }

    // Execute queries in parallel for better performance
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: this.productInclude,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    // Transform products to response DTOs
    const data: ProductResponseDto[] = products.map((product) =>
      this.toProductResponse(product),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
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

    return this.toProductResponse(product);
  }

  async findFeatured(limit = 8): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: this.productInclude,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => this.toProductResponse(product));
  }

  async findLatest(limit = 8): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: this.productInclude,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => this.toProductResponse(product));
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
    const existingProducts = await this.prisma.product.findMany({
      select: { slug: true },
    });
    const existingSlugs = existingProducts.map((p) => p.slug);
    const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);

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
      options: this.buildVariantOptions(variant.options),
    }));

    // Calculate derived fields from variants
    const effectiveStock = variants.reduce(
      (sum, variant) => sum + variant.stock,
      0,
    );
    const minPrice = Math.min(...variants.map((v) => v.price));
    const maxPrice = Math.max(...variants.map((v) => v.price));

    const product = await this.prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: createProductDto.name,
          slug: uniqueSlug,
          description: createProductDto.description,
          price: minPrice, // Starting from price = MIN(variant.price)
          minPrice: minPrice,
          maxPrice: maxPrice,
          effectiveStock: effectiveStock, // Denormalized sum of variant stocks
          currency: (createProductDto.currency ?? 'USD').toUpperCase(),
          categoryId: createProductDto.categoryId,
          isActive: createProductDto.isActive ?? true,
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
      });

      // Set defaultVariantId using smart fallback (prefers variant with image)
      if (created.variants && created.variants.length > 0) {
        const fallbackVariantId = this.selectDefaultVariantFallback(
          created.variants.map((v) => ({
            id: v.id,
            stock: v.stock,
            image: v.image,
            images: v.images,
          })),
        );
        if (fallbackVariantId) {
          // Validate that the variant belongs to this product (should always pass here, but for safety)
          await this.validateDefaultVariant(tx, created.id, fallbackVariantId);
          await tx.product.update({
            where: { id: created.id },
            data: { defaultVariantId: fallbackVariantId } as any,
          });
        }
      }

      // Recompute derived fields to ensure consistency
      await this.recomputeDerivedFields(tx, created.id);

      return tx.product.findUnique({
        where: { id: created.id },
        include: this.productInclude,
      });
    });

    if (!product) {
      throw new ProductNotFoundException();
    }

    this.logger.log(`Product created: ${product.id} - ${product.name}`);
    return this.toProductResponse(product);
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
          const existingProducts = await this.prisma.product.findMany({
            select: { slug: true },
            where: { id: { not: id } },
          });
          const existingSlugs = existingProducts.map((p) => p.slug);
          data.slug = ensureUniqueSlug(baseSlug, existingSlugs);
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
        (data as any).currency = updateProductDto.currency.toUpperCase();
      }
    }

    if (updateProductDto.isOnSale !== undefined) {
      if (updateProductDto.isOnSale !== undefined) {
        (data as any).isOnSale = updateProductDto.isOnSale;
      }
    }

    if (updateProductDto.discountType !== undefined) {
      if (updateProductDto.discountType !== undefined) {
        (data as any).discountType = updateProductDto.discountType;
      }
    }

    if (updateProductDto.discountValue !== undefined) {
      if (updateProductDto.discountValue !== undefined) {
        (data as any).discountValue = updateProductDto.discountValue;
      }
    }

    if (updateProductDto.saleStartsAt !== undefined) {
      if (updateProductDto.saleStartsAt !== undefined) {
        (data as any).saleStartsAt = updateProductDto.saleStartsAt
          ? new Date(updateProductDto.saleStartsAt)
          : null;
      }
    }

    if (updateProductDto.saleEndsAt !== undefined) {
      if (updateProductDto.saleEndsAt !== undefined) {
        (data as any).saleEndsAt = updateProductDto.saleEndsAt
          ? new Date(updateProductDto.saleEndsAt)
          : null;
      }
    }

    if (updateProductDto.categoryId !== undefined) {
      data.category = {
        connect: { id: updateProductDto.categoryId },
      };
    }

    if (updateProductDto.isActive !== undefined) {
      data.isActive = updateProductDto.isActive;
    }

    // Validate defaultVariantId if provided (validate before transaction)
    if (updateProductDto.defaultVariantId !== undefined) {
      // If null is explicitly provided but product has variants, we'll set fallback in transaction
      if (updateProductDto.defaultVariantId === null) {
        // Will be handled in transaction after syncVariants
      } else {
        await this.validateDefaultVariant(
          this.prisma,
          id,
          updateProductDto.defaultVariantId,
        );
        (data as any).defaultVariantId = updateProductDto.defaultVariantId;
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

      return this.toProductResponse(unchanged);
    }

    try {
      const product = await this.prisma.$transaction(async (tx) => {
        if (hasVariantPayload) {
          // Sync variants and recompute derived fields (effectiveStock, minPrice, maxPrice, price)
          await this.syncVariants(tx, id, variantsPayload ?? []);
          await this.recomputeDerivedFields(tx, id);
          // Price and stock are automatically calculated from variants

          // Update defaultVariantId if needed
          const updatedProduct = await tx.product.findUnique({
            where: { id },
            include: { variants: true },
          });

          if (updatedProduct && updatedProduct.variants.length > 0) {
            const currentDefaultVariantId = (updatedProduct as any)
              .defaultVariantId;
            const currentDefaultVariant = updatedProduct.variants.find(
              (v) => v.id === currentDefaultVariantId,
            );

            // Helper: Check if variant has at least one image
            const hasImage = (variant: {
              image?: string | null;
              images?: string[] | null;
            }): boolean => {
              if (variant.image && variant.image.trim().length > 0) {
                return true;
              }
              if (
                variant.images &&
                Array.isArray(variant.images) &&
                variant.images.length > 0 &&
                variant.images.some((img) => img && img.trim().length > 0)
              ) {
                return true;
              }
              return false;
            };

            // Check if default variant is missing, deleted, or has no images
            const needsFallback =
              !currentDefaultVariant ||
              !hasImage({
                image: currentDefaultVariant.image,
                images: currentDefaultVariant.images,
              });

            if (needsFallback) {
              const fallbackVariantId = this.selectDefaultVariantFallback(
                updatedProduct.variants.map((v) => ({
                  id: v.id,
                  stock: v.stock,
                  image: v.image,
                  images: v.images,
                })),
              );
              if (fallbackVariantId) {
                // Validate (should always pass, but for safety)
                await this.validateDefaultVariant(tx, id, fallbackVariantId);
                (data as any).defaultVariantId = fallbackVariantId;
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
      return this.toProductResponse(product);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(`Unique constraint violation updating product ${id}`);
        const target = error.meta?.target;
        if (Array.isArray(target) && target.includes('sku')) {
          throw new BadRequestException(
            'A variant with this SKU already exists. Each SKU must be unique.',
          );
        }
        throw new BadRequestException(
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

  private async syncVariants(
    tx: any, // Prisma transaction client - will be properly typed after Prisma client regeneration
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
      existingVariants.map((variant: any) => [variant.id, variant]),
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
            (ev: any) => ev.sku === variant.sku && ev.id !== variant.id,
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
      (variant: any) => !incomingIds.has(variant.id),
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
        const updateData: any = {}; // Will be properly typed after Prisma client regeneration
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

  private buildVariantOptions(options?: Record<string, string>) {
    const entries = options
      ? Object.entries(options).filter(
          ([key, value]) =>
            Boolean(key) && value !== undefined && value !== null,
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
   * Recomputes derived fields from variant aggregates and updates Product.
   * Computes: effectiveStock (sum of variant stocks), minPrice, maxPrice, and price (set to minPrice).
   * Used after variant creates/updates/deletes and default variant stock updates.
   */
  private async recomputeDerivedFields(
    tx: any, // Prisma transaction client
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
    const price = minPrice; // Keep price = minPrice for backwards compatibility

    await tx.product.update({
      where: { id: productId },
      data: {
        effectiveStock,
        minPrice,
        maxPrice,
        price, // Set price = minPrice for backwards compatibility
      },
    });

    return { effectiveStock, minPrice, maxPrice, price };
  }

  private toProductResponse(product: ProductWithRelations): ProductResponseDto {
    const minPrice = this.toNumber(product.minPrice);
    const maxPrice = this.toNumber(product.maxPrice);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? null,
      price: this.toNumber(product.price),
      currency: product.currency,
      stock: product.effectiveStock, // Use effectiveStock (sum of variant stocks) instead of product.stock
      isActive: product.isActive,
      defaultVariantId: product.defaultVariantId ?? null,
      defaultVariant: product.defaultVariant
        ? {
            id: product.defaultVariant.id,
            image: product.defaultVariant.image,
            images: product.defaultVariant.images ?? [],
          }
        : null,
      isOnSale: product.isOnSale ?? undefined,
      discountType: product.discountType ?? undefined,
      discountValue:
        product.discountValue !== undefined && product.discountValue !== null
          ? this.toNumber(product.discountValue)
          : null,
      saleStartsAt: product.saleStartsAt ?? null,
      saleEndsAt: product.saleEndsAt ?? null,
      categoryId: product.categoryId,
      category: product.category
        ? ({
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
            description: product.category.description ?? null,
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
          } as any)
        : null,
      variants: product.variants?.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        price: this.toNumber(variant.price),
        stock: variant.stock,
        image: variant.image,
        images: variant.images ?? [],
        options:
          variant.options && variant.options.length > 0
            ? variant.options.reduce<Record<string, string>>((acc, option) => {
                acc[option.name] = option.value;
                return acc;
              }, {})
            : undefined,
      })),
      // Include minPrice and maxPrice for products with multiple variant prices
      // Only include if maxPrice > minPrice (indicating a price range)
      minPrice: maxPrice > minPrice ? minPrice : undefined,
      maxPrice: maxPrice > minPrice ? maxPrice : undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private toNumber(value?: Prisma.Decimal | number | null): number {
    if (value === null || value === undefined) {
      return 0;
    }
    return Number(value);
  }
}
