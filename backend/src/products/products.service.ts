import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TtlCache } from '../common/utils/ttl-cache.util';
import {
  CategoryNotFoundException,
  ProductNotFoundException,
} from '../common/exceptions';
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
import { ProductDerivedFieldsService } from './services/product-derived-fields.service';
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

/** TTL for promotions cache (seconds) - promotions change infrequently */
const PROMOTIONS_CACHE_TTL = 120;

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
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
    private readonly derivedFieldsService: ProductDerivedFieldsService,
    private readonly categoriesService: CategoriesService,
  ) {}


  /**
   * Find all products with filtering, pagination, and sorting support.
   *
   * FILTERING LOGIC:
   * - categoryId: Filters by category ID, including products from the category and all its subcategories (recursively)
   * - minPrice/maxPrice: Filters products by variant prices (checks if any variant price falls within range)
   * - search: Case-insensitive search in product name and description fields
   * - inStockOnly: When true, returns only products with at least one variant in stock
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
      promotionId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build Prisma where clause dynamically based on provided filters
    const where: Prisma.ProductWhereInput = {};

    // Resolved promotion scope (product IDs + category IDs) when filtering by promotionId
    let promoProductIds: string[] = [];
    let promoCategoryIds: string[] = [];

    // Non-admin users only see active products
    if (!isAdmin) {
      where.isActive = true;
    }

    // Filter by category ID - includes products from the category and all its subcategories
    if (categoryId) {
      try {
        // Get all descendant category IDs (includes the category itself and all children)
        const categoryIds = await this.categoriesService.getDescendantCategoryIds(
          categoryId,
        );
        // Use 'in' operator to match any of the category IDs
        where.categoryId = { in: categoryIds };
      } catch (error) {
        // If category not found, return empty results immediately (no unsafe type coercion)
        if (error instanceof CategoryNotFoundException) {
          return {
            data: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
          };
        }
        throw error;
      }
    }

    // Filter by price range and stock - combine into single variants filter
    // to avoid overwriting (when both minPrice and inStockOnly are set)
    const variantConditions: Prisma.ProductVariantWhereInput[] = [];
    if (minPrice !== undefined || maxPrice !== undefined) {
      variantConditions.push(
        ...[
          minPrice !== undefined ? { price: { gte: minPrice } } : {},
          maxPrice !== undefined ? { price: { lte: maxPrice } } : {},
        ].filter((c) => Object.keys(c).length > 0),
      );
    }
    if (inStockOnly === true) {
      variantConditions.push({ stock: { gt: 0 } });
    }
    if (variantConditions.length > 0) {
      where.variants = {
        some: variantConditions.length > 1 ? { AND: variantConditions } : variantConditions[0],
      };
    }

    // Search filter: case-insensitive search in name and description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by promotion: products explicitly linked (PromotionProduct) OR in a linked category (PromotionCategory, respecting applyToDescendants)
    if (promotionId) {
      const promotion = await this.prisma.promotion.findUnique({
        where: { id: promotionId },
        select: {
          promotionProducts: { select: { productId: true } },
          promotionCategories: {
            select: { categoryId: true, applyToDescendants: true },
          },
        },
      });

      if (!promotion) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      promoProductIds = promotion.promotionProducts.map((p) => p.productId);
      const categoryIdsSet = new Set<string>();

      for (const pc of promotion.promotionCategories) {
        if (pc.applyToDescendants) {
          try {
            const descendantIds =
              await this.categoriesService.getDescendantCategoryIds(
                pc.categoryId,
              );
            descendantIds.forEach((id) => categoryIdsSet.add(id));
          } catch (err) {
            if (err instanceof CategoryNotFoundException) {
              continue;
            }
            throw err;
          }
        } else {
          categoryIdsSet.add(pc.categoryId);
        }
      }

      const promoCategoryIdsArr = Array.from(categoryIdsSet);
      const promoOrConditions: Prisma.ProductWhereInput[] = [];
      if (promoProductIds.length > 0) {
        promoOrConditions.push({ id: { in: promoProductIds } });
      }
      if (promoCategoryIdsArr.length > 0) {
        promoOrConditions.push({ categoryId: { in: promoCategoryIdsArr } });
      }

      if (promoOrConditions.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      promoCategoryIds = promoCategoryIdsArr;

      const promoCondition: Prisma.ProductWhereInput = {
        OR: promoOrConditions,
      };

      if (search && where.OR) {
        where.AND = [{ OR: where.OR }, promoCondition];
        delete where.OR;
      } else {
        where.OR = promoOrConditions;
      }
    }

    // Calculate pagination offset
    const skip = (page - 1) * limit;

    // Price sort: Prisma cannot orderBy relation aggregate (_min). Use raw SQL for correct
    // ordering and pagination at any catalog size.
    const usePriceSort = sortBy === 'price';

    let products: ProductWithRelations[];
    let total: number;

    if (usePriceSort) {
      const categoryIdsForSql = (where.categoryId as { in?: string[] } | undefined)?.in;
      const productIds = await this.findProductIdsByPriceSort(
        {
          isActive: !isAdmin,
          categoryIds: categoryIdsForSql,
          minPrice,
          maxPrice,
          inStockOnly: inStockOnly === true,
          search: search ?? undefined,
          promotionProductIds:
            promoProductIds.length > 0 || promoCategoryIds.length > 0
              ? { productIds: promoProductIds, categoryIds: promoCategoryIds }
              : undefined,
        },
        sortOrder,
        skip,
        limit,
      );
      total = await this.prisma.product.count({ where });

      if (productIds.length === 0) {
        products = [];
      } else {
        const orderMap = new Map(productIds.map((id, i) => [id, i]));
        const fetched = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          include: this.productInclude,
        });
        products = fetched.sort(
          (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
        );
      }
    } else {
      const orderBy: Prisma.ProductOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      } as Prisma.ProductOrderByWithRelationInput;

      [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: this.productInclude,
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.product.count({ where }),
      ]);
    }

    // Fetch category promotions for all unique categories in this result set
    const categoryIds = [...new Set(products.map((p) => p.categoryId))];
    const categoryPromotionsMap =
      await this.getCategoryPromotionsForCategories(categoryIds);

    const data: ProductResponseDto[] = products.map((product) =>
      this.productMapper.toProductResponse(
        product,
        categoryPromotionsMap.get(product.categoryId),
      ),
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

    const categoryPromotionsMap =
      await this.getCategoryPromotionsForCategories([product.categoryId]);
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
      await this.getCategoryPromotionsForCategories(categoryIds);
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
      await this.getCategoryPromotionsForCategories(categoryIds);
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
      await this.getCategoryPromotionsForCategories([product.categoryId]);
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
      // If null is explicitly provided but product has variants, we'll set fallback in transaction
      if (updateProductDto.defaultVariantId === null) {
        // Will be handled in transaction after syncVariants
      } else {
        await this.variantService.validateDefaultVariant(
          this.prisma,
          id,
          updateProductDto.defaultVariantId,
        );
        if (updateProductDto.defaultVariantId === null) {
          data.defaultVariant = { disconnect: true };
        } else {
          data.defaultVariant = { connect: { id: updateProductDto.defaultVariantId } };
        }
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
        await this.getCategoryPromotionsForCategories([unchanged.categoryId]);
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
        await this.getCategoryPromotionsForCategories([product.categoryId]);
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
   * Raw SQL: get product IDs ordered by min variant price, with filters and pagination.
   * Used when sortBy=price for correct ordering at any catalog size.
   */
  private async findProductIdsByPriceSort(
    filters: {
      isActive?: boolean;
      categoryIds?: string[];
      minPrice?: number;
      maxPrice?: number;
      inStockOnly?: boolean;
      search?: string;
      /** When set, restrict to products in promotion (by product ID or category ID). */
      promotionProductIds?: { productIds: string[]; categoryIds: string[] };
    },
    sortOrder: 'asc' | 'desc',
    skip: number,
    limit: number,
  ): Promise<string[]> {
    const conditions: Prisma.Sql[] = [];

    if (filters.isActive === true) {
      conditions.push(Prisma.sql`p."isActive" = true`);
    }
    if (filters.categoryIds?.length) {
      conditions.push(
        Prisma.sql`p."categoryId" IN (${Prisma.join(
          filters.categoryIds.map((c) => Prisma.sql`${c}`),
          ', ',
        )})`,
      );
    }
    if (filters.minPrice !== undefined) {
      conditions.push(Prisma.sql`v.min_price >= ${filters.minPrice}`);
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(Prisma.sql`v.min_price <= ${filters.maxPrice}`);
    }
    if (filters.inStockOnly) {
      conditions.push(
        Prisma.sql`EXISTS (SELECT 1 FROM "ProductVariant" pv2 WHERE pv2."productId" = p.id AND pv2.stock > 0)`,
      );
    }
    if (filters.search) {
      const pattern = `%${filters.search}%`;
      conditions.push(
        Prisma.sql`(p.name ILIKE ${pattern} OR (p.description IS NOT NULL AND p.description ILIKE ${pattern}))`,
      );
    }
    if (
      filters.promotionProductIds &&
      (filters.promotionProductIds.productIds.length > 0 ||
        filters.promotionProductIds.categoryIds.length > 0)
    ) {
      const promo = filters.promotionProductIds;
      const promoParts: Prisma.Sql[] = [];
      if (promo.productIds.length > 0) {
        promoParts.push(
          Prisma.sql`p.id IN (${Prisma.join(
            promo.productIds.map((id) => Prisma.sql`${id}`),
            ', ',
          )})`,
        );
      }
      if (promo.categoryIds.length > 0) {
        promoParts.push(
          Prisma.sql`p."categoryId" IN (${Prisma.join(
            promo.categoryIds.map((c) => Prisma.sql`${c}`),
            ', ',
          )})`,
        );
      }
      conditions.push(Prisma.sql`(${Prisma.join(promoParts, ' OR ')})`);
    }

    const whereClause =
      conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
    const orderDir = sortOrder === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;

    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT p.id
      FROM "Product" p
      INNER JOIN (
        SELECT "productId", MIN(price)::float as min_price
        FROM "ProductVariant"
        GROUP BY "productId"
      ) v ON p.id = v."productId"
      ${whereClause}
      ORDER BY v.min_price ${orderDir}
      LIMIT ${limit} OFFSET ${skip}
    `;

    return rows.map((r) => r.id);
  }

  /**
   * Get promotions that apply to products in the given categories via PromotionCategory.
   * Respects applyToDescendants: when true, promotion applies to category and its descendants.
   *
   * @param categoryIds - Product category IDs to resolve
   * @returns Map of categoryId -> applicable promotions (for display in product response)
   */
  private async getCategoryPromotionsForCategories(
    categoryIds: string[],
  ): Promise<Map<string, Array<{ id: string; type: string; value: unknown; startsAt: Date | null; expiresAt: Date | null }>>> {
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

    const result = new Map<
      string,
      Array<{ id: string; type: string; value: unknown; startsAt: Date | null; expiresAt: Date | null }>
    >();

    for (const catId of categoryIds) {
      const ancestors = ancestorMap.get(catId) ?? [catId];
      const applicable: Array<{
        id: string;
        type: string;
        value: unknown;
        startsAt: Date | null;
        expiresAt: Date | null;
      }> = [];

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

  /**
   * Invalidate promotions cache. Call when promotions are created/updated/deleted.
   * Used by PromotionsService to ensure product listing shows fresh promotion data.
   */
  invalidatePromotionsCache(): void {
    this.promotionsCache.delete('promotions:active');
    this.logger.debug('Promotions cache invalidated');
  }

  /**
   * Public method to recompute derived fields for a product.
   * Used by other services (checkout, orders) after stock changes.
   */
  async recomputeProductDerivedFields(
    tx: PrismaTransactionClient,
    productId: string,
  ): Promise<void> {
    await this.derivedFieldsService.computeDerivedFields(tx, productId);
  }


}
