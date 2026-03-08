import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import {
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import {
  AdminFilterOrdersDto,
  FilterOrdersDto,
  OrderResponseDto,
  OrderStatsDto,
  PaginatedOrderResponseDto,
  UpdateOrderStatusDto,
} from './dto';
import { OrderNotFoundException } from '../common/exceptions';
import { toNumber } from '../common/utils/decimal.util';

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        variant: { include: { options: true } };
        product: {
          include: {
            defaultVariant: true;
          };
        };
      };
    };
    user: {
      select: { id: true; firstName: true; lastName: true; email: true };
    };
  };
}> & {
  // Coupons are queried where available, but treated as optional on the type
  // so this mapper can work with orders that may not have coupons loaded.
  coupons?: { code?: string | null }[];
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async findForUser(
    userId: string,
    filters: FilterOrdersDto,
  ): Promise<PaginatedOrderResponseDto> {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      fulfillmentStatus,
    } = filters;

    const where: Prisma.OrderWhereInput = { userId };

    if (status) {
      where.status = status;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (fulfillmentStatus) {
      where.fulfillmentStatus = fulfillmentStatus;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { placedAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              variant: { include: { options: true } },
              product: {
                include: {
                  defaultVariant: true,
                },
              },
            },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          coupons: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders.map((order) => this.toOrderResponse(order)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findForAdmin(
    filters: AdminFilterOrdersDto,
  ): Promise<PaginatedOrderResponseDto> {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      fulfillmentStatus,
      userId,
      startDate,
      endDate,
      search,
    } = filters;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (fulfillmentStatus) {
      where.fulfillmentStatus = fulfillmentStatus;
    }
    if (userId) {
      where.userId = userId;
    }
    if (startDate || endDate) {
      where.placedAt = {};
      if (startDate) {
        where.placedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.placedAt.lte = new Date(endDate);
      }
    }
    if (search) {
      where.OR = [
        { id: search },
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { placedAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              variant: { include: { options: true } },
              product: {
                include: {
                  defaultVariant: true,
                },
              },
            },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          coupons: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders.map((order) => this.toOrderResponse(order)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(
    id: string,
    userId: string | undefined,
    isAdmin = false,
    guestToken?: string,
  ): Promise<OrderResponseDto> {
    const order = await this.findOrderById(id);

    if (!order) {
      throw new OrderNotFoundException();
    }

    // Authenticated user path
    if (userId) {
      if (!isAdmin && order.userId && order.userId !== userId) {
        throw new ForbiddenException('You do not have access to this order');
      }
      return this.toOrderResponse(order);
    }

    // Guest path: require token and verify with timing-safe comparison
    if (!guestToken) {
      throw new ForbiddenException('Token is required for guest order access');
    }

    if (!order.accessTokenHash) {
      throw new ForbiddenException('This order does not support guest access');
    }

    // Hash the provided token and compare with stored hash using timing-safe comparison
    const providedTokenHash = createHash('sha256')
      .update(guestToken)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    const storedHash = Buffer.from(order.accessTokenHash, 'hex');
    const providedHash = Buffer.from(providedTokenHash, 'hex');

    if (
      storedHash.length !== providedHash.length ||
      !timingSafeEqual(storedHash, providedHash)
    ) {
      throw new ForbiddenException('Invalid token for guest order access');
    }

    return this.toOrderResponse(order);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    if (!dto.status && !dto.paymentStatus && !dto.fulfillmentStatus) {
      throw new BadRequestException('No status changes provided');
    }

    // Pre-check order existence before update
    const existing = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new OrderNotFoundException();
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.paymentStatus ? { paymentStatus: dto.paymentStatus } : {}),
        ...(dto.fulfillmentStatus
          ? { fulfillmentStatus: dto.fulfillmentStatus }
          : {}),
      },
      include: {
        items: {
          include: {
            variant: { include: { options: true } },
            product: {
              include: {
                defaultVariant: true,
              },
            },
          },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        coupons: true,
      },
    });

    this.logger.log(`Order ${id} status updated`);
    return this.toOrderResponse(order);
  }

  /**
   * Normalize order address JSON to include fullName for frontend compatibility.
   * Checkout stores firstName/lastName; frontend expects fullName.
   */
  private normalizeOrderAddress(addr: Record<string, unknown>): OrderResponseDto['shippingAddress'] {
    const derived =
      [addr.firstName, addr.lastName].filter(Boolean).join(' ').trim();
    const fullName =
      (addr.fullName as string) ?? (derived || '—');
    return { ...addr, fullName } as OrderResponseDto['shippingAddress'];
  }

  private async findOrderById(id: string): Promise<OrderWithRelations | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: { include: { options: true } },
            product: {
              include: {
                defaultVariant: true,
              },
            },
          },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        coupons: true,
      },
    });
  }

  private toOrderResponse(order: OrderWithRelations): OrderResponseDto {
    const shippingAddr = order.shippingAddress as Record<string, unknown>;
    const billingAddr = (order.billingAddress as Record<string, unknown> | null) ?? null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      subtotal: toNumber(order.subtotal),
      tax: toNumber(order.tax),
      shipping: toNumber(order.shipping),
      discount: toNumber(order.discount),
      couponCode: order.coupons?.[0]?.code ?? null,
      total: toNumber(order.total),
      currency: order.currency,
      shippingAddress: this.normalizeOrderAddress(shippingAddr),
      billingAddress: billingAddr ? this.normalizeOrderAddress(billingAddr) : null,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
        total: toNumber(item.total),
        title: item.title,
        attributes: (item.attributes as Record<string, unknown> | null) ?? null,
        variant: item.variant
          ? {
              id: item.variant.id,
              sku: item.variant.sku,
              image: item.variant.image,
              options: item.variant.options?.map((option) => ({
                name: option.name,
                value: option.value,
              })),
            }
          : undefined,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              images: (() => {
                const defaultVariant = item.product.defaultVariant as
                  | { images: string[]; image: string | null }
                  | null
                  | undefined;
                if (
                  defaultVariant?.images &&
                  Array.isArray(defaultVariant.images) &&
                  defaultVariant.images.length > 0
                ) {
                  return defaultVariant.images;
                }
                if (defaultVariant?.image) {
                  return [defaultVariant.image] as string[];
                }
                return [];
              })(),
            }
          : undefined,
      })),
      placedAt: order.placedAt,
      updatedAt: order.updatedAt,
      user: order.user
        ? {
            id: order.user.id,
            fullName: `${order.user.firstName} ${order.user.lastName}`,
            email: order.user.email,
          }
        : null,
    };
  }

  async getStatsForUser(userId: string): Promise<OrderStatsDto> {
    const [totalOrders, totalSpentResult, pendingOrders, completedOrders] =
      await Promise.all([
        this.prisma.order.count({
          where: { userId },
        }),
        this.prisma.order.aggregate({
          where: { userId },
          _sum: { total: true },
        }),
        this.prisma.order.count({
          where: {
            userId,
            status: OrderStatus.PENDING,
          },
        }),
        this.prisma.order.count({
          where: {
            userId,
            status: OrderStatus.DELIVERED,
          },
        }),
      ]);

    return {
      totalOrders,
      totalSpent: toNumber(totalSpentResult._sum.total),
      pendingOrders,
      completedOrders,
    };
  }

}
