import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DiscountType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CouponNotFoundException } from '../common/exceptions';
import type { PrismaTransactionClient } from '../common/types/prisma-transaction.client';
import {
  CreateCouponDto,
  UpdateCouponDto,
  FilterCouponsDto,
  CouponResponseDto,
  ValidateCouponResponseDto,
} from './dto';

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all coupons with filtering, pagination, and sorting support.
   *
   * FILTERING LOGIC:
   * - search: Case-insensitive search in coupon code and description
   * - isActive: Filter by active status
   *
   * PAGINATION:
   * - Default: page 1, limit 20 items per page
   * - Calculates skip offset: (page - 1) * limit
   *
   * SORTING:
   * - Default: createdAt descending (newest first)
   *
   * @param filters - Filter parameters (search, isActive, page, limit)
   * @returns Paginated coupon list with metadata
   */
  async findAll(
    filters: FilterCouponsDto,
  ): Promise<{
    data: CouponResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      isActive,
      page = 1,
      limit = 20,
    } = filters;

    // Build Prisma where clause dynamically
    const where: Prisma.CouponWhereInput = {};

    // Filter by active status
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Search filter: case-insensitive search in code and description
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination offset
    const skip = (page - 1) * limit;

    // Execute queries in parallel for better performance
    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    // Transform to response DTOs
    const data: CouponResponseDto[] = coupons.map((coupon) =>
      this.toCouponResponse(coupon),
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

  /**
   * Find a single coupon by ID
   */
  async findOne(id: string): Promise<CouponResponseDto> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new CouponNotFoundException();
    }

    return this.toCouponResponse(coupon);
  }

  /**
   * Find a coupon by code (for validation during checkout)
   */
  async findByCode(code: string): Promise<CouponResponseDto | null> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return null;
    }

    return this.toCouponResponse(coupon);
  }

  /**
   * Validate a coupon for checkout (public API / pre-validation).
   * Uses global Prisma client. For atomic validation within a transaction, use validateForCheckoutWithTx.
   */
  async validateForCheckout(
    code: string,
    subtotal: number,
    userId?: string,
    guestEmail?: string,
  ): Promise<ValidateCouponResponseDto> {
    return this.validateForCheckoutWithClient(
      this.prisma,
      code,
      subtotal,
      userId,
      guestEmail,
    );
  }

  /**
   * Validate a coupon for checkout using a transaction client.
   * Use this inside $transaction to ensure atomic validation with order creation
   * (prevents race condition where two concurrent checkouts both pass validation).
   *
   * @param tx - Prisma transaction client from $transaction callback
   */
  async validateForCheckoutWithTx(
    tx: PrismaTransactionClient,
    code: string,
    subtotal: number,
    userId?: string,
    guestEmail?: string,
  ): Promise<ValidateCouponResponseDto> {
    return this.validateForCheckoutWithClient(
      tx,
      code,
      subtotal,
      userId,
      guestEmail,
    );
  }

  /**
   * Internal validation logic shared by validateForCheckout and validateForCheckoutWithTx.
   */
  private async validateForCheckoutWithClient(
    client: PrismaTransactionClient,
    code: string,
    subtotal: number,
    userId?: string,
    guestEmail?: string,
  ): Promise<ValidateCouponResponseDto> {
    const normalizedCode = code.trim().toUpperCase();
    const coupon = await client.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      return {
        valid: false,
        discount: 0,
        message: 'Invalid coupon code',
      };
    }

    if (!coupon.isActive) {
      return {
        valid: false,
        discount: 0,
        message: 'This coupon is no longer active',
      };
    }

    const now = new Date();

    if (coupon.startsAt && now < coupon.startsAt) {
      return {
        valid: false,
        discount: 0,
        message: 'This coupon is not yet valid',
      };
    }

    if (coupon.expiresAt && now > coupon.expiresAt) {
      return {
        valid: false,
        discount: 0,
        message: 'This coupon has expired',
      };
    }

    const minOrderTotal = coupon.minOrderTotal
      ? Number(coupon.minOrderTotal)
      : null;
    if (minOrderTotal !== null && subtotal < minOrderTotal) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order total of $${minOrderTotal.toFixed(2)} required`,
      };
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return {
        valid: false,
        discount: 0,
        message: 'This coupon has reached its usage limit',
      };
    }

    if (coupon.perUserLimit !== null) {
      if (userId) {
        const userUsageCount = await client.orderCoupon.count({
          where: {
            couponId: coupon.id,
            order: { userId },
          },
        });
        if (userUsageCount >= coupon.perUserLimit) {
          return {
            valid: false,
            discount: 0,
            message:
              'You have already used this coupon the maximum number of times',
          };
        }
      } else {
        // Guest: require email to enforce perUserLimit (prevents bypass by omitting email)
        if (!guestEmail || !guestEmail.trim()) {
          return {
            valid: false,
            discount: 0,
            message:
              'Email is required to use this coupon (limit per customer)',
          };
        }
        const guestUsageCount = await client.orderCoupon.count({
          where: {
            couponId: coupon.id,
            order: {
              userId: null,
              guestEmail: guestEmail.toLowerCase().trim(),
            },
          },
        });
        if (guestUsageCount >= coupon.perUserLimit) {
          return {
            valid: false,
            discount: 0,
            message:
              'You have already used this coupon the maximum number of times',
          };
        }
      }
    }

    // Calculate discount
    const value = Number(coupon.value);
    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = Math.min((subtotal * value) / 100, subtotal);
    } else {
      discount = Math.min(value, subtotal);
    }

    discount = Math.round(discount * 100) / 100;

    return {
      valid: true,
      discount,
      couponId: coupon.id,
      code: coupon.code,
      type: coupon.type as 'PERCENTAGE' | 'FIXED_AMOUNT',
      value,
      message: undefined,
    };
  }

  /**
   * Create a new coupon
   */
  async create(createCouponDto: CreateCouponDto): Promise<CouponResponseDto> {
    // Normalize code to uppercase
    const normalizedCode = createCouponDto.code.toUpperCase().trim();

    // Check if coupon code already exists
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (existingCoupon) {
      throw new ConflictException(
        `A coupon with code "${normalizedCode}" already exists`,
      );
    }

    // Validate percentage value
    if (
      createCouponDto.type === 'PERCENTAGE' &&
      createCouponDto.value > 100
    ) {
      throw new BadRequestException(
        'Percentage discount cannot exceed 100%',
      );
    }

    // Validate date range
    if (createCouponDto.startsAt && createCouponDto.expiresAt) {
      const startsAt = new Date(createCouponDto.startsAt);
      const expiresAt = new Date(createCouponDto.expiresAt);

      if (startsAt >= expiresAt) {
        throw new BadRequestException(
          'Start date must be before expiration date',
        );
      }
    }

    try {
      const coupon = await this.prisma.coupon.create({
        data: {
          code: normalizedCode,
          description: createCouponDto.description,
          type: createCouponDto.type,
          value: createCouponDto.value,
          minOrderTotal: createCouponDto.minOrderTotal ?? null,
          startsAt: createCouponDto.startsAt
            ? new Date(createCouponDto.startsAt)
            : null,
          expiresAt: createCouponDto.expiresAt
            ? new Date(createCouponDto.expiresAt)
            : null,
          usageLimit: createCouponDto.usageLimit ?? null,
          perUserLimit: createCouponDto.perUserLimit ?? null,
          isActive: createCouponDto.isActive ?? true,
          usedCount: 0,
        },
      });

      this.logger.log(`Coupon created: ${coupon.id} - ${coupon.code}`);
      return this.toCouponResponse(coupon);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Unique constraint violation creating coupon ${normalizedCode}`,
        );
        throw new ConflictException(
          `A coupon with code "${normalizedCode}" already exists`,
        );
      }

      if (error instanceof Error) {
        this.logger.error(
          `Failed to create coupon: ${error.message}`,
          error.stack,
        );
      }

      throw error;
    }
  }

  /**
   * Update an existing coupon
   */
  async update(
    id: string,
    updateCouponDto: UpdateCouponDto,
  ): Promise<CouponResponseDto> {
    const existing = await this.prisma.coupon.findUnique({ where: { id } });

    if (!existing) {
      throw new CouponNotFoundException();
    }

    // Normalize code to uppercase if provided
    let normalizedCode = existing.code;
    if (updateCouponDto.code) {
      normalizedCode = updateCouponDto.code.toUpperCase().trim();

      // Check if new code conflicts with existing coupon
      if (normalizedCode !== existing.code) {
        const conflictingCoupon = await this.prisma.coupon.findUnique({
          where: { code: normalizedCode },
        });

        if (conflictingCoupon) {
          throw new ConflictException(
            `A coupon with code "${normalizedCode}" already exists`,
          );
        }
      }
    }

    // Validate percentage value
    if (
      (updateCouponDto.type === 'PERCENTAGE' ||
        (updateCouponDto.type === undefined &&
          existing.type === 'PERCENTAGE')) &&
      updateCouponDto.value !== undefined &&
      updateCouponDto.value > 100
    ) {
      throw new BadRequestException(
        'Percentage discount cannot exceed 100%',
      );
    }

    // Validate date range
    const startsAt = updateCouponDto.startsAt
      ? new Date(updateCouponDto.startsAt)
      : existing.startsAt;
    const expiresAt = updateCouponDto.expiresAt
      ? new Date(updateCouponDto.expiresAt)
      : existing.expiresAt;

    if (startsAt && expiresAt && startsAt >= expiresAt) {
      throw new BadRequestException(
        'Start date must be before expiration date',
      );
    }

    try {
      const data: Prisma.CouponUpdateInput = {};

      if (updateCouponDto.code !== undefined) {
        data.code = normalizedCode;
      }

      if (updateCouponDto.description !== undefined) {
        data.description = updateCouponDto.description;
      }

      if (updateCouponDto.type !== undefined) {
        data.type = updateCouponDto.type;
      }

      if (updateCouponDto.value !== undefined) {
        data.value = updateCouponDto.value;
      }

      if (updateCouponDto.minOrderTotal !== undefined) {
        data.minOrderTotal =
          updateCouponDto.minOrderTotal === null
            ? null
            : updateCouponDto.minOrderTotal;
      }

      if (updateCouponDto.startsAt !== undefined) {
        data.startsAt = updateCouponDto.startsAt
          ? new Date(updateCouponDto.startsAt)
          : null;
      }

      if (updateCouponDto.expiresAt !== undefined) {
        data.expiresAt = updateCouponDto.expiresAt
          ? new Date(updateCouponDto.expiresAt)
          : null;
      }

      if (updateCouponDto.usageLimit !== undefined) {
        data.usageLimit =
          updateCouponDto.usageLimit === null
            ? null
            : updateCouponDto.usageLimit;
      }

      if (updateCouponDto.perUserLimit !== undefined) {
        data.perUserLimit =
          updateCouponDto.perUserLimit === null
            ? null
            : updateCouponDto.perUserLimit;
      }

      if (updateCouponDto.isActive !== undefined) {
        data.isActive = updateCouponDto.isActive;
      }

      const coupon = await this.prisma.coupon.update({
        where: { id },
        data,
      });

      this.logger.log(`Coupon updated: ${coupon.id} - ${coupon.code}`);
      return this.toCouponResponse(coupon);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(`Unique constraint violation updating coupon ${id}`);
        throw new ConflictException(
          `A coupon with this code already exists`,
        );
      }

      if (error instanceof Error) {
        this.logger.error(
          `Failed to update coupon ${id}: ${error.message}`,
          error.stack,
        );
      }

      throw error;
    }
  }

  /**
   * Delete a coupon
   */
  async remove(id: string): Promise<void> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: { orderCoupons: true },
    });

    if (!coupon) {
      throw new CouponNotFoundException();
    }

    // If coupon has been used in orders, we should not delete it
    // Instead, we can deactivate it for historical reference
    if (coupon.orderCoupons.length > 0) {
      await this.prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });
      this.logger.log(`Coupon deactivated: ${id} - ${coupon.code}`);
    } else {
      await this.prisma.coupon.delete({ where: { id } });
      this.logger.log(`Coupon deleted: ${id} - ${coupon.code}`);
    }
  }

  /**
   * Transform Prisma coupon to response DTO
   */
  private toCouponResponse(coupon: {
    id: string;
    code: string;
    description: string | null;
    type: string;
    value: Prisma.Decimal | number;
    minOrderTotal: Prisma.Decimal | number | null;
    startsAt: Date | null;
    expiresAt: Date | null;
    usageLimit: number | null;
    perUserLimit: number | null;
    usedCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): CouponResponseDto {
    return {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      type: coupon.type as DiscountType,
      value: Number(coupon.value),
      minOrderTotal: coupon.minOrderTotal
        ? Number(coupon.minOrderTotal)
        : null,
      startsAt: coupon.startsAt,
      expiresAt: coupon.expiresAt,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      usedCount: coupon.usedCount,
      isActive: coupon.isActive,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    };
  }
}
