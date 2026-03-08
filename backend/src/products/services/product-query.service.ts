import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryNotFoundException } from '../../common/exceptions';
import { FilterProductsDto, ProductResponseDto } from '../dto';
import { ProductMapperService } from './product-mapper.service';
import { ProductPromotionService } from './product-promotion.service';
import { CategoriesService } from '../../categories/categories.service';

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
export class ProductQueryService {
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
    private readonly categoriesService: CategoriesService,
    private readonly productPromotionService: ProductPromotionService,
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

    const where: Prisma.ProductWhereInput = {};
    let promoProductIds: string[] = [];
    let promoCategoryIds: string[] = [];

    if (!isAdmin) {
      where.isActive = true;
    }

    if (categoryId) {
      try {
        const categoryIds = await this.categoriesService.getDescendantCategoryIds(
          categoryId,
        );
        where.categoryId = { in: categoryIds };
      } catch (error) {
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
        some:
          variantConditions.length > 1
            ? { AND: variantConditions }
            : variantConditions[0],
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

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

    const skip = (page - 1) * limit;
    const usePriceSort = sortBy === 'price';

    let products: ProductWithRelations[];
    let total: number;

    if (usePriceSort) {
      const categoryIdsForSql = (where.categoryId as { in?: string[] } | undefined)
        ?.in;
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

    const categoryIds = [...new Set(products.map((p) => p.categoryId))];
    const categoryPromotionsMap =
      await this.productPromotionService.getCategoryPromotionsForCategories(
        categoryIds,
      );

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

  private async findProductIdsByPriceSort(
    filters: {
      isActive?: boolean;
      categoryIds?: string[];
      minPrice?: number;
      maxPrice?: number;
      inStockOnly?: boolean;
      search?: string;
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
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;
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
}
