import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateHeroSlideDto,
  UpdateHeroSlideDto,
  FilterHeroSlidesDto,
  HeroSlideResponseDto,
} from './dto';
import { HeroSlideNotFoundException } from '../common/exceptions/hero-slide-not-found.exception';

@Injectable()
export class HeroSlidesService {
  private readonly logger = new Logger(HeroSlidesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private isPlaceholderHref(href?: string | null): boolean {
    const v = (href || '').trim();
    return !v || v === '#';
  }

  /**
   * Derive a sane CTA href when admin UI sends a placeholder ("#") or empty href.
   * We prefer linking to the slide's primary target (product/category) when available.
   */
  private deriveCtaHrefFromDto(
    dto: CreateHeroSlideDto | UpdateHeroSlideDto,
  ): string {
    // Keep explicit, non-placeholder href if provided.
    const raw = (dto as any)?.ctaPrimary?.href;
    if (!this.isPlaceholderHref(raw)) {
      return String(raw).trim();
    }

    // Product-first: if the slide references a product in media, link to it.
    const media: any = (dto as any).media;
    const kind = media?.kind;
    const productSlug = media?.productSlug;
    if (kind === 'PRODUCT' && productSlug && String(productSlug).trim()) {
      return `/products/${String(productSlug).trim()}`;
    }

    const type = (dto as any).type;
    switch (type) {
      case 'CATEGORY_SPOTLIGHT': {
        const slug = (dto as any)?.categorySpotlightData?.categorySlug;
        if (slug && String(slug).trim()) {
          return `/products/category/${String(slug).trim()}`;
        }
        break;
      }
      case 'EDITORS_PICK': {
        const slugs = (dto as any)?.editorsPickData?.productSlugs;
        const first = Array.isArray(slugs) ? slugs[0] : undefined;
        if (first && String(first).trim()) {
          return `/products/${String(first).trim()}`;
        }
        break;
      }
      case 'COMPARISON_BATTLE': {
        const left = (dto as any)?.comparisonBattleData?.leftProductSlug;
        const right = (dto as any)?.comparisonBattleData?.rightProductSlug;
        if (left && String(left).trim()) {
          return `/products/${String(left).trim()}`;
        }
        if (right && String(right).trim()) {
          return `/products/${String(right).trim()}`;
        }
        break;
      }
      case 'PRODUCT_SPOTLIGHT':
      case 'OFFER':
      case 'TESTIMONIAL':
      case 'PROMOTION':
      case 'LANDSCAPE_IMAGE':
      default:
        break;
    }

    return '/products';
  }

  /**
   * Transform Prisma HeroSlide to response DTO
   */
  private toResponseDto(slide: any): HeroSlideResponseDto {
    return {
      id: slide.id,
      type: slide.type,
      priority: slide.priority,
      isActive: slide.isActive,
      startsAt: slide.startsAt,
      endsAt: slide.endsAt,
      badgeText: slide.badgeText,
      headline: slide.headline,
      highlight: slide.highlight,
      description: slide.description,
      ctaPrimary: {
        label: slide.ctaLabel,
        href: slide.ctaHref,
      },
      media: {
        kind: slide.mediaKind,
        productSlug: slide.productSlug,
        imageUrl: slide.imageUrl,
        videoUrl: slide.videoUrl,
        alt: slide.mediaAlt,
        position: slide.mediaPosition,
        aspect: slide.mediaAspect,
      },
      promotionId: slide.promotionId,
      typeSpecificData: slide.typeSpecificData,
      createdAt: slide.createdAt,
      updatedAt: slide.updatedAt,
    };
  }

  /**
   * Transform CreateHeroSlideDto to Prisma create data
   */
  private toPrismaCreateData(
    dto: CreateHeroSlideDto,
  ): Prisma.HeroSlideCreateInput {
    const data: any = {
      type: dto.type,
      priority: dto.priority,
      isActive: dto.isActive ?? true,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      badgeText: dto.badgeText,
      headline: dto.headline,
      highlight: dto.highlight,
      description: dto.description,
      ctaLabel: dto.ctaPrimary.label,
      ctaHref: this.deriveCtaHrefFromDto(dto),
      mediaKind: dto.media.kind,
      productSlug: dto.media.productSlug,
      imageUrl: dto.media.imageUrl,
      videoUrl: dto.media.videoUrl,
      mediaAlt: dto.media.alt,
      mediaPosition: dto.media.position,
      mediaAspect: dto.media.aspect,
      promotionId: dto.promotionId,
    };

    // Build type-specific data based on slide type
    let typeSpecificData: any = {};

    switch (dto.type) {
      case 'PRODUCT_SPOTLIGHT':
        if (dto.productSpotlightData) {
          typeSpecificData = dto.productSpotlightData;
        }
        break;
      case 'OFFER':
        if (dto.offerData) {
          typeSpecificData = dto.offerData;
        }
        break;
      case 'TESTIMONIAL':
        if (dto.testimonialData) {
          typeSpecificData = dto.testimonialData;
        }
        break;
      case 'LANDSCAPE_IMAGE':
        if (dto.landscapeImageData) {
          typeSpecificData = dto.landscapeImageData;
        }
        break;
      case 'CATEGORY_SPOTLIGHT':
        if (dto.categorySpotlightData) {
          typeSpecificData = dto.categorySpotlightData;
        }
        break;
      case 'EDITORS_PICK':
        if (dto.editorsPickData) {
          typeSpecificData = dto.editorsPickData;
        }
        break;
      case 'COMPARISON_BATTLE':
        if (dto.comparisonBattleData) {
          typeSpecificData = dto.comparisonBattleData;
        }
        break;
      case 'PROMOTION':
        if (dto.promotionData) {
          typeSpecificData = dto.promotionData;
        }
        break;
    }

    data.typeSpecificData = typeSpecificData;

    return data;
  }

  /**
   * Transform UpdateHeroSlideDto to Prisma update data
   * Only includes fields that are actually provided
   */
  private toPrismaUpdateData(
    dto: UpdateHeroSlideDto,
  ): Prisma.HeroSlideUpdateInput {
    const data: any = {};

    // Only include fields that are provided
    if (dto.type !== undefined) {
      data.type = dto.type;
    }
    if (dto.priority !== undefined) {
      data.priority = dto.priority;
    }
    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }
    if (dto.startsAt !== undefined) {
      data.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    }
    if (dto.endsAt !== undefined) {
      data.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    }
    if (dto.badgeText !== undefined) {
      data.badgeText = dto.badgeText;
    }
    if (dto.headline !== undefined) {
      data.headline = dto.headline;
    }
    if (dto.highlight !== undefined) {
      data.highlight = dto.highlight;
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }
    if (dto.ctaPrimary !== undefined) {
      data.ctaLabel = dto.ctaPrimary.label;
      data.ctaHref = this.deriveCtaHrefFromDto(dto);
    }
    if (dto.media !== undefined) {
      data.mediaKind = dto.media.kind;
      data.productSlug = dto.media.productSlug;
      data.imageUrl = dto.media.imageUrl;
      data.videoUrl = dto.media.videoUrl;
      data.mediaAlt = dto.media.alt;
      data.mediaPosition = dto.media.position;
      data.mediaAspect = dto.media.aspect;
    }
    if (dto.promotionId !== undefined) {
      data.promotionId = dto.promotionId;
    }

    // Build type-specific data based on slide type (if type is provided or changed)
    if (dto.type !== undefined) {
      let typeSpecificData: any = {};

      switch (dto.type) {
        case 'PRODUCT_SPOTLIGHT':
          if (dto.productSpotlightData) {
            typeSpecificData = dto.productSpotlightData;
          }
          break;
        case 'OFFER':
          if (dto.offerData) {
            typeSpecificData = dto.offerData;
          }
          break;
        case 'TESTIMONIAL':
          if (dto.testimonialData) {
            typeSpecificData = dto.testimonialData;
          }
          break;
        case 'LANDSCAPE_IMAGE':
          if (dto.landscapeImageData) {
            typeSpecificData = dto.landscapeImageData;
          }
          break;
        case 'CATEGORY_SPOTLIGHT':
          if (dto.categorySpotlightData) {
            typeSpecificData = dto.categorySpotlightData;
          }
          break;
        case 'EDITORS_PICK':
          if (dto.editorsPickData) {
            typeSpecificData = dto.editorsPickData;
          }
          break;
        case 'COMPARISON_BATTLE':
          if (dto.comparisonBattleData) {
            typeSpecificData = dto.comparisonBattleData;
          }
          break;
        case 'PROMOTION':
          if (dto.promotionData) {
            typeSpecificData = dto.promotionData;
          }
          break;
      }

      data.typeSpecificData = typeSpecificData;
    } else if (
      dto.productSpotlightData !== undefined ||
      dto.offerData !== undefined ||
      dto.testimonialData !== undefined ||
      dto.landscapeImageData !== undefined ||
      dto.categorySpotlightData !== undefined ||
      dto.editorsPickData !== undefined ||
      dto.comparisonBattleData !== undefined ||
      dto.promotionData !== undefined
    ) {
      // If type-specific data is provided but type isn't, we need the existing type
      // This will be handled in the update method
      const typeSpecificData: any = {};
      if (dto.productSpotlightData !== undefined) {
        typeSpecificData.productSpotlightData = dto.productSpotlightData;
      }
      if (dto.offerData !== undefined) {
        typeSpecificData.offerData = dto.offerData;
      }
      if (dto.testimonialData !== undefined) {
        typeSpecificData.testimonialData = dto.testimonialData;
      }
      if (dto.landscapeImageData !== undefined) {
        typeSpecificData.landscapeImageData = dto.landscapeImageData;
      }
      if (dto.categorySpotlightData !== undefined) {
        typeSpecificData.categorySpotlightData = dto.categorySpotlightData;
      }
      if (dto.editorsPickData !== undefined) {
        typeSpecificData.editorsPickData = dto.editorsPickData;
      }
      if (dto.comparisonBattleData !== undefined) {
        typeSpecificData.comparisonBattleData = dto.comparisonBattleData;
      }
      if (dto.promotionData !== undefined) {
        typeSpecificData.promotionData = dto.promotionData;
      }
      // Note: We'll merge this with existing typeSpecificData in the update method
      data.typeSpecificData = typeSpecificData;
    }

    return data;
  }

  /**
   * Find all hero slides with filtering, pagination, and sorting
   */
  async findAll(filters: FilterHeroSlidesDto): Promise<{
    data: HeroSlideResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      type,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'priority',
      sortOrder = 'desc',
    } = filters;

    const where: Prisma.HeroSlideWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { headline: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { badgeText: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Type filter
    if (type) {
      where.type = type;
    }

    // Active status filter
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort order
    const orderBy: Prisma.HeroSlideOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute queries in parallel
    const [slides, total] = await Promise.all([
      this.prisma.heroSlide.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.heroSlide.count({ where }),
    ]);

    return {
      data: slides.map((slide) => this.toResponseDto(slide)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find active hero slides (for public API)
   * Returns slides that are active and within their date range
   * Logic:
   * - isActive must be true
   * - startsAt must be null or <= now (slide has started)
   * - endsAt must be null or >= now (slide hasn't ended)
   */
  async findActive(): Promise<HeroSlideResponseDto[]> {
    const now = new Date();

    const slides = await this.prisma.heroSlide.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { startsAt: null },
              { startsAt: { lte: now } },
            ],
          },
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: {
        priority: 'desc',
      },
    });

    return slides.map((slide) => this.toResponseDto(slide));
  }

  /**
   * Find one hero slide by ID
   */
  async findOne(id: string): Promise<HeroSlideResponseDto> {
    const slide = await this.prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!slide) {
      throw new HeroSlideNotFoundException(id);
    }

    return this.toResponseDto(slide);
  }

  /**
   * Create a new hero slide
   */
  async create(createDto: CreateHeroSlideDto): Promise<HeroSlideResponseDto> {
    try {
      // Validate date ranges
      if (createDto.startsAt && createDto.endsAt) {
        const startsAt = new Date(createDto.startsAt);
        const endsAt = new Date(createDto.endsAt);
        if (startsAt >= endsAt) {
          throw new BadRequestException(
            'startsAt must be before endsAt',
          );
        }
      }

      const data = this.toPrismaCreateData(createDto);

      const slide = await this.prisma.heroSlide.create({
        data,
      });

      this.logger.log(`Created hero slide: ${slide.id} (${slide.type})`);

      return this.toResponseDto(slide);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(`Failed to create hero slide: ${error.message}`);
        throw new BadRequestException('Failed to create hero slide');
      }
      throw error;
    }
  }

  /**
   * Update a hero slide
   */
  async update(
    id: string,
    updateDto: UpdateHeroSlideDto,
  ): Promise<HeroSlideResponseDto> {
    // Check if slide exists
    const existing = await this.prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new HeroSlideNotFoundException(id);
    }

    try {
      // Validate date ranges if both are provided
      if (updateDto.startsAt && updateDto.endsAt) {
        const startsAt = new Date(updateDto.startsAt);
        const endsAt = new Date(updateDto.endsAt);
        if (startsAt >= endsAt) {
          throw new BadRequestException(
            'startsAt must be before endsAt',
          );
        }
      }

      // If type is being changed, ensure type-specific data is provided
      if (updateDto.type && updateDto.type !== existing.type) {
        // Type change requires all type-specific data
        const requiredFields = this.getRequiredTypeSpecificFields(
          updateDto.type,
        );
        const hasRequiredData = this.hasTypeSpecificData(
          updateDto.type,
          updateDto,
        );

        if (!hasRequiredData) {
          throw new BadRequestException(
            `Changing slide type requires providing ${requiredFields} data`,
          );
        }
      }

      // Get update data (only includes provided fields)
      const data = this.toPrismaUpdateData(updateDto);

      // Handle type-specific data merging for updates
      // If type is being changed, typeSpecificData is already set in toPrismaUpdateData
      // If type isn't changing but type-specific data is provided, merge with existing
      if (updateDto.type === undefined && data.typeSpecificData) {
        const existingTypeData = existing.typeSpecificData as Record<string, any> | null;
        if (existingTypeData && typeof existingTypeData === 'object' && !Array.isArray(existingTypeData)) {
          // Merge existing type-specific data with new data
          data.typeSpecificData = { ...existingTypeData, ...(data.typeSpecificData as Record<string, any>) };
        }
      }

      const slide = await this.prisma.heroSlide.update({
        where: { id },
        data,
      });

      this.logger.log(`Updated hero slide: ${id}`);

      return this.toResponseDto(slide);
    } catch (error) {
      if (error instanceof HeroSlideNotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(`Failed to update hero slide: ${error.message}`);
        throw new BadRequestException('Failed to update hero slide');
      }
      throw error;
    }
  }

  /**
   * Delete a hero slide
   */
  async remove(id: string): Promise<void> {
    const existing = await this.prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new HeroSlideNotFoundException(id);
    }

    await this.prisma.heroSlide.delete({
      where: { id },
    });

    this.logger.log(`Deleted hero slide: ${id}`);
  }

  /**
   * Helper: Get required type-specific field names
   */
  private getRequiredTypeSpecificFields(type: string): string {
    const fieldMap: Record<string, string> = {
      PRODUCT_SPOTLIGHT: 'productSpotlightData',
      OFFER: 'offerData',
      TESTIMONIAL: 'testimonialData',
      LANDSCAPE_IMAGE: 'landscapeImageData',
      CATEGORY_SPOTLIGHT: 'categorySpotlightData',
      EDITORS_PICK: 'editorsPickData',
      COMPARISON_BATTLE: 'comparisonBattleData',
      PROMOTION: 'promotionData',
    };
    return fieldMap[type] || 'typeSpecificData';
  }

  /**
   * Helper: Check if type-specific data is provided
   */
  private hasTypeSpecificData(
    type: string,
    dto: CreateHeroSlideDto | UpdateHeroSlideDto,
  ): boolean {
    switch (type) {
      case 'PRODUCT_SPOTLIGHT':
        return !!dto.productSpotlightData;
      case 'OFFER':
        return !!dto.offerData;
      case 'TESTIMONIAL':
        return !!dto.testimonialData;
      case 'LANDSCAPE_IMAGE':
        return !!dto.landscapeImageData;
      case 'CATEGORY_SPOTLIGHT':
        return !!dto.categorySpotlightData;
      case 'EDITORS_PICK':
        return !!dto.editorsPickData;
      case 'COMPARISON_BATTLE':
        return !!dto.comparisonBattleData;
      case 'PROMOTION':
        return !!dto.promotionData;
      default:
        return false;
    }
  }
}
