import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PromotionNotFoundException } from '../common/exceptions';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Promotion with relations for toPromotionResponse */
type PromotionWithRelations = Prisma.PromotionGetPayload<{
  include: {
    promotionProducts: { select: { productId: true } };
    promotionCategories: { select: { categoryId: true } };
    heroSlides: true;
  };
}>;
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  PromotionResponseDto,
} from './dto';

/** Cart item shape for promotion discount calculation */
export interface CartItemForPromo {
  productId: string;
  categoryId: string;
  lineTotal: number;
}

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * Calculate the best applicable promotion discount for cart items.
   * Applies to products in PromotionProduct or categories in PromotionCategory.
   * Returns the highest discount from all qualifying promotions (one promotion per order).
   */
  async getApplicableDiscount(
    tx: Prisma.TransactionClient,
    cartItems: CartItemForPromo[],
  ): Promise<number> {
    const now = new Date();

    const promotions = await tx.promotion.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        ],
      },
      include: {
        promotionProducts: { select: { productId: true } },
        promotionCategories: {
          select: { categoryId: true, applyToDescendants: true },
        },
      },
    });

    if (promotions.length === 0) return 0;

    let bestDiscount = 0;

    for (const promotion of promotions) {
      const promoProductIds = new Set(
        promotion.promotionProducts.map((pp) => pp.productId),
      );
      const promoCategoryIds = new Set<string>();

      for (const pc of promotion.promotionCategories) {
        if (pc.applyToDescendants) {
          try {
            const descendantIds =
              await this.categoriesService.getDescendantCategoryIds(
                pc.categoryId,
              );
            descendantIds.forEach((id) => promoCategoryIds.add(id));
          } catch {
            promoCategoryIds.add(pc.categoryId);
          }
        } else {
          promoCategoryIds.add(pc.categoryId);
        }
      }

      const qualifyingTotal = cartItems.reduce((sum, item) => {
        const byProduct =
          promoProductIds.size > 0 && promoProductIds.has(item.productId);
        const byCategory =
          promoCategoryIds.size > 0 && promoCategoryIds.has(item.categoryId);
        if (byProduct || byCategory) {
          return sum + item.lineTotal;
        }
        return sum;
      }, 0);

      if (qualifyingTotal <= 0) continue;

      const value = Number(promotion.value);
      let discount = 0;
      if (promotion.type === 'PERCENTAGE') {
        discount = Math.min((qualifyingTotal * value) / 100, qualifyingTotal);
      } else {
        discount = Math.min(value, qualifyingTotal);
      }
      discount = Math.round(discount * 100) / 100;
      if (discount > bestDiscount) bestDiscount = discount;
    }

    return bestDiscount;
  }

  async findAll(filters?: { page?: number; limit?: number }): Promise<{
    data: PromotionResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const skip = (page - 1) * limit;

    const [promotions, total] = await Promise.all([
      this.prisma.promotion.findMany({
        skip,
        take: limit,
        include: {
          promotionProducts: { select: { productId: true } },
          promotionCategories: { select: { categoryId: true } },
          heroSlides: {
            where: { isActive: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.promotion.count(),
    ]);

    return {
      data: promotions.map((p) => this.toPromotionResponse(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<PromotionResponseDto> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        promotionProducts: { select: { productId: true } },
        promotionCategories: { select: { categoryId: true } },
        heroSlides: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!promotion) {
      throw new PromotionNotFoundException();
    }

    return this.toPromotionResponse(promotion);
  }

  async create(dto: CreatePromotionDto): Promise<PromotionResponseDto> {
    if (dto.type === 'PERCENTAGE' && dto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    if (dto.startsAt && dto.expiresAt) {
      if (new Date(dto.startsAt) >= new Date(dto.expiresAt)) {
        throw new BadRequestException('Start date must be before expiration date');
      }
    }

    const promotion = await this.prisma.promotion.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        value: dto.value,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: dto.isActive ?? true,
        promotionProducts: dto.productIds
          ? {
              create: dto.productIds.map((id) => ({ productId: id })),
            }
          : undefined,
        promotionCategories: dto.categoryIds
          ? {
              create: dto.categoryIds.map((id) => ({ categoryId: id })),
            }
          : undefined,
      },
      include: {
        promotionProducts: { select: { productId: true } },
        promotionCategories: { select: { categoryId: true } },
      },
    });

    // Optional hero slide: when heroImageUrl is present (URL or null), create a slide; headline/description from promotion.
    if (dto.heroImageUrl !== undefined) {
      const imageUrl = dto.heroImageUrl?.trim() || null;
      await this.prisma.heroSlide.create({
        data: {
          type: 'PROMOTION',
          promotionId: promotion.id,
          isActive: true,
          imageUrl,
          mediaKind: imageUrl ? 'IMAGE' : 'NONE',
          headline: promotion.name,
          description: promotion.description ?? '',
          badgeText: 'Promotion',
          ctaLabel: 'Shop Now',
          ctaHref: `/products?promotionId=${promotion.id}`,
          startsAt: promotion.startsAt,
          endsAt: promotion.expiresAt,
          priority: 10,
          typeSpecificData: { promotionId: promotion.id },
        },
      });
    }

    const finalPromotion = await this.prisma.promotion.findUnique({
      where: { id: promotion.id },
      include: {
        promotionProducts: { select: { productId: true } },
        promotionCategories: { select: { categoryId: true } },
        heroSlides: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    this.logger.log(`Promotion created: ${promotion.id} - ${promotion.name}`);
    this.productsService.invalidatePromotionsCache();
    if (!finalPromotion) throw new PromotionNotFoundException();
    return this.toPromotionResponse(finalPromotion);
  }

  async update(id: string, dto: UpdatePromotionDto): Promise<PromotionResponseDto> {
    const existing = await this.prisma.promotion.findUnique({
      where: { id },
      include: { heroSlides: true },
    });
    if (!existing) {
      throw new PromotionNotFoundException();
    }

    if (
      (dto.type === 'PERCENTAGE' || (!dto.type && existing.type === 'PERCENTAGE')) &&
      dto.value !== undefined &&
      dto.value > 100
    ) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : existing.startsAt;
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : existing.expiresAt;

    if (startsAt && expiresAt && startsAt >= expiresAt) {
      throw new BadRequestException('Start date must be before expiration date');
    }

    const promotion = await this.prisma.promotion.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        value: dto.value,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        isActive: dto.isActive,
        promotionProducts: dto.productIds
          ? {
              deleteMany: {},
              create: dto.productIds.map((pid) => ({ productId: pid })),
            }
          : undefined,
        promotionCategories: dto.categoryIds
          ? {
              deleteMany: {},
              create: dto.categoryIds.map((cid) => ({ categoryId: cid })),
            }
          : undefined,
      },
      include: {
        promotionProducts: { select: { productId: true } },
        promotionCategories: { select: { categoryId: true } },
      },
    });

    // Hero slide: when heroImageUrl is in payload, create or update slide (headline/description from promotion).
    const heroImageUrl = dto.heroImageUrl !== undefined ? (dto.heroImageUrl?.trim() || null) : undefined;
    const existingHeroSlide = await this.prisma.heroSlide.findFirst({
      where: { promotionId: id },
    });

    if (heroImageUrl !== undefined) {
      if (existingHeroSlide) {
        await this.prisma.heroSlide.update({
          where: { id: existingHeroSlide.id },
          data: {
            imageUrl: heroImageUrl,
            mediaKind: heroImageUrl ? 'IMAGE' : 'NONE',
            headline: promotion.name,
            description: promotion.description ?? '',
            badgeText: 'Promotion',
            startsAt: promotion.startsAt,
            endsAt: promotion.expiresAt,
            isActive: promotion.isActive,
          },
        });
      } else if (heroImageUrl) {
        await this.prisma.heroSlide.create({
          data: {
            type: 'PROMOTION',
            promotionId: promotion.id,
            isActive: true,
            imageUrl: heroImageUrl,
            mediaKind: 'IMAGE',
            headline: promotion.name,
            description: promotion.description ?? '',
            badgeText: 'Promotion',
            ctaLabel: 'Shop Now',
            ctaHref: `/products?promotionId=${promotion.id}`,
            startsAt: promotion.startsAt,
            endsAt: promotion.expiresAt,
            priority: 10,
            typeSpecificData: { promotionId: promotion.id },
          },
        });
      }
    } else if (existingHeroSlide) {
      // No heroImageUrl in payload: sync existing slide text from promotion.
      await this.prisma.heroSlide.update({
        where: { id: existingHeroSlide.id },
        data: {
          headline: promotion.name,
          description: promotion.description ?? '',
          startsAt: promotion.startsAt,
          endsAt: promotion.expiresAt,
          isActive: promotion.isActive,
        },
      });
    }

    const finalPromotion = await this.prisma.promotion.findUnique({
      where: { id: promotion.id },
      include: {
        promotionProducts: { select: { productId: true } },
        promotionCategories: { select: { categoryId: true } },
        heroSlides: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    this.logger.log(`Promotion updated: ${promotion.id} - ${promotion.name}`);
    this.productsService.invalidatePromotionsCache();
    if (!finalPromotion) throw new PromotionNotFoundException();
    return this.toPromotionResponse(finalPromotion);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promotion) {
      throw new PromotionNotFoundException();
    }

    await this.prisma.promotion.delete({ where: { id } });
    this.logger.log(`Promotion deleted: ${id}`);
    this.productsService.invalidatePromotionsCache();
  }

  private toPromotionResponse(promotion: PromotionWithRelations): PromotionResponseDto {
    const heroSlide = promotion.heroSlides?.[0];
    return {
      id: promotion.id,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: Number(promotion.value),
      startsAt: promotion.startsAt,
      expiresAt: promotion.expiresAt,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt,
      updatedAt: promotion.updatedAt,
      productIds: promotion.promotionProducts?.map((p) => p.productId),
      categoryIds: promotion.promotionCategories?.map((c) => c.categoryId),
      heroSlideId: heroSlide?.id ?? null,
      heroImageUrl: heroSlide?.imageUrl ?? null,
    };
  }
}
