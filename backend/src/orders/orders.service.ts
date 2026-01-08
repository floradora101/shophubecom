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
import {
  AdminFilterOrdersDto,
  CreateOrderDto,
  FilterOrdersDto,
  OrderResponseDto,
  OrderStatsDto,
  PaginatedOrderResponseDto,
  UpdateOrderStatusDto,
} from './dto';
import {
  OrderNotFoundException,
  ProductVariantNotFoundException,
} from '../common/exceptions';

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
}>;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const aggregatedItems = createOrderDto.items.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.variantId] = (acc[item.variantId] ?? 0) + item.quantity;
        return acc;
      },
      {},
    );

    const variantIds = Object.keys(aggregatedItems);

    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true, options: true },
    });

    if (variants.length !== variantIds.length) {
      throw new ProductVariantNotFoundException();
    }

    const orderItems = variants.map((variant) => {
      const quantity = aggregatedItems[variant.id] ?? 0;
      if (quantity <= 0) {
        throw new BadRequestException('Invalid quantity for variant');
      }
      if (variant.stock < quantity) {
        throw new BadRequestException(
          `Insufficient stock for variant ${variant.sku}`,
        );
      }

      const unitPrice = this.toNumber(variant.price);
      const total = unitPrice * quantity;
      const attributes =
        variant.options?.reduce<Record<string, string>>((acc, option) => {
          acc[option.name] = option.value;
          return acc;
        }, {}) ?? {};

      return {
        productId: variant.productId,
        variantId: variant.id,
        quantity,
        unitPrice,
        total,
        title: variant.product.name,
        attributes,
        variant,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const shipping = createOrderDto.shipping ?? 0;
    const tax = createOrderDto.tax ?? 0;
    const discount = createOrderDto.discount ?? 0;
    const total = subtotal + tax + shipping - discount;

    if (total < 0) {
      throw new BadRequestException('Order total cannot be negative');
    }

    const currency = createOrderDto.currency ?? 'USD';

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const createdOrder = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          orderNumber,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
          subtotal,
          tax,
          shipping,
          discount,
          total,
          currency,
          shippingAddress:
            createOrderDto.shippingAddress as unknown as Prisma.JsonObject,
          billingAddress:
            (createOrderDto.billingAddress as unknown as
              | Prisma.JsonObject
              | undefined) ??
            (createOrderDto.shippingAddress as unknown as Prisma.JsonObject),
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              title: item.title,
              attributes: item.attributes,
            })),
          },
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
        },
      });

      for (const item of orderItems) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          this.logger.warn(
            `Stock update failed for variant ${item.variantId} during order creation`,
          );
          throw new BadRequestException(
            `Insufficient stock for variant ${item.variantId}`,
          );
        }
      }

      this.logger.log(`Order created: ${order.id} by user ${userId}`);
      return order;
    });

    return this.toOrderResponse(createdOrder);
  }

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
      },
    });

    this.logger.log(`Order ${id} status updated`);
    return this.toOrderResponse(order);
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
      },
    });
  }

  private toOrderResponse(order: OrderWithRelations): OrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      subtotal: this.toNumber(order.subtotal),
      tax: this.toNumber(order.tax),
      shipping: this.toNumber(order.shipping),
      discount: this.toNumber(order.discount),
      total: this.toNumber(order.total),
      currency: order.currency,
      shippingAddress: order.shippingAddress as any,
      billingAddress: (order.billingAddress as any) ?? null,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: this.toNumber(item.unitPrice),
        total: this.toNumber(item.total),
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
      totalSpent: this.toNumber(totalSpentResult._sum.total),
      pendingOrders,
      completedOrders,
    };
  }

  private toNumber(value?: Prisma.Decimal | number | null): number {
    if (value === null || value === undefined) {
      return 0;
    }
    return Number(value);
  }
}
