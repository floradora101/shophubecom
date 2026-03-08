import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductNotFoundException } from '../common/exceptions/product-not-found.exception';
import { CreateReviewDto, FilterReviewsDto, ReviewResponseDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve product ID from slug or cuid
   */
  private async resolveProductId(productIdOrSlug: string): Promise<string> {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }],
        isActive: true,
      },
      select: { id: true },
    });
    if (!product) {
      throw new ProductNotFoundException();
    }
    return product.id;
  }

  /**
   * List reviews for a product with pagination and stats
   */
  async findAll(
    productIdOrSlug: string,
    filters: FilterReviewsDto,
  ): Promise<{
    data: ReviewResponseDto[];
    stats: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
      verifiedReviews: number;
    };
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const productId = await this.resolveProductId(productIdOrSlug);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const sortBy = filters.sortBy ?? 'newest';
    const skip = (page - 1) * limit;

    const orderBy =
      sortBy === 'newest'
        ? { createdAt: 'desc' as const }
        : sortBy === 'oldest'
          ? { createdAt: 'asc' as const }
          : sortBy === 'highest'
            ? { rating: 'desc' as const }
            : { rating: 'asc' as const };

    const [reviews, total, statsRows] = await Promise.all([
      this.prisma.productReview.findMany({
        where: { productId },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.productReview.count({ where: { productId } }),
      this.prisma.productReview.groupBy({
        by: ['rating'],
        where: { productId },
        _count: { id: true },
      }),
    ]);

    const verifiedCount = await this.prisma.productReview.count({
      where: { productId, isVerified: true },
    });

    const ratingDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number } = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    for (const row of statsRows) {
      if (row.rating >= 1 && row.rating <= 5) {
        ratingDistribution[row.rating as 1 | 2 | 3 | 4 | 5] = row._count.id;
      }
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { averageRating: true, reviewCount: true },
    });

    const averageRating = product?.averageRating
      ? Number(product.averageRating)
      : 0;
    const totalReviews = product?.reviewCount ?? total;

    const data: ReviewResponseDto[] = reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      userId: r.userId,
      userName: `${r.user.firstName} ${r.user.lastName}`.trim() || 'Anonymous',
      rating: r.rating,
      title: r.title,
      content: r.comment ?? '',
      verified: r.isVerified,
      helpful: r.helpfulCount,
      createdAt: r.createdAt,
    }));

    return {
      data,
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution,
        verifiedReviews: verifiedCount,
      },
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a review for a product (authenticated users only)
   */
  async create(
    productIdOrSlug: string,
    userId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const productId = await this.resolveProductId(productIdOrSlug);

    const existing = await this.prisma.productReview.findUnique({
      where: {
        productId_userId: { productId, userId },
      },
    });
    if (existing) {
      throw new ConflictException(
        'You have already reviewed this product. You can edit your existing review.',
      );
    }

    const review = await this.prisma.$transaction(async (tx) => {
      const created = await tx.productReview.create({
        data: {
          productId,
          userId,
          rating: dto.rating,
          title: dto.title ?? null,
          comment: dto.comment ?? null,
        },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      const allReviews = await tx.productReview.findMany({
        where: { productId },
        select: { rating: true },
      });
      const avg =
        allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      const avgRounded = Math.round(avg * 100) / 100;

      await tx.product.update({
        where: { id: productId },
        data: {
          averageRating: new Decimal(avgRounded),
          reviewCount: allReviews.length,
        },
      });

      return created;
    });

    return {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName:
        `${review.user.firstName} ${review.user.lastName}`.trim() || 'Anonymous',
      rating: review.rating,
      title: review.title,
      content: review.comment ?? '',
      verified: review.isVerified,
      helpful: review.helpfulCount,
      createdAt: review.createdAt,
    };
  }
}
