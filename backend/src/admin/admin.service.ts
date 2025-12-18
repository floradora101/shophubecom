import { Injectable, Logger } from '@nestjs/common';
import { Prisma, OrderStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminStatsQueryDto,
  AdminStatsResponseDto,
  RecentOrdersQueryDto,
  AdminOrderSummaryDto,
  LowStockQueryDto,
  LowStockResponseDto,
  TopProductsQueryDto,
  TopProductResponseDto,
  SalesDataQueryDto,
  SalesDataResponseDto,
} from './dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStats(query: AdminStatsQueryDto): Promise<AdminStatsResponseDto> {
    const lowStockThreshold = query.lowStockThreshold ?? 5;

    // Count sales only for confirmed/completed orders (exclude PENDING and CANCELLED)
    const confirmedStatuses = [
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];

    // Count all orders (including PENDING) for total orders count
    // But only confirmed orders for sales revenue
    const [
      allOrdersCount,
      salesAggregate,
      statusGroups,
      totalCustomers,
      lowStockCount,
    ] = await Promise.all([
      this.prisma.order.count({
        where: { status: { not: OrderStatus.CANCELLED } },
      }),
      this.prisma.order.aggregate({
        where: {
          status: { in: confirmedStatuses },
        },
        _sum: { total: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.user.count({
        where: { role: UserRole.CUSTOMER },
      }),
      this.prisma.product.count({
        where: {
          effectiveStock: { lte: lowStockThreshold },
          isActive: true,
        },
      }),
    ]);

    const statusCounts: Record<OrderStatus, number> = {
      PENDING: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    statusGroups.forEach((group) => {
      statusCounts[group.status] = group._count._all;
    });

    return {
      totalSales: Number(this.toNumber(salesAggregate._sum.total).toFixed(2)),
      totalOrders: Number(allOrdersCount),
      totalCustomers: Number(totalCustomers),
      lowStockItems: Number(lowStockCount),
      pendingOrders: Number(statusCounts.PENDING),
      processingOrders: Number(statusCounts.PROCESSING),
      shippedOrders: Number(statusCounts.SHIPPED),
      deliveredOrders: Number(statusCounts.DELIVERED),
    };
  }

  async getRecentOrders(
    query: RecentOrdersQueryDto,
  ): Promise<AdminOrderSummaryDto[]> {
    const limit = query.limit ?? 10;

    const orders = await this.prisma.order.findMany({
      orderBy: { placedAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: {
          select: {
            quantity: true,
          },
        },
      },
    });

    return orders.map((order) => {
      const itemCount = order.items.reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0,
      );
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: Number(this.toNumber(order.total).toFixed(2)),
        createdAt: order.placedAt,
        updatedAt: order.updatedAt,
        itemCount: Number(itemCount),
        customer: {
          id: order.user?.id ?? '',
          name: order.user
            ? `${order.user.firstName} ${order.user.lastName}`
            : 'Unknown',
          email: order.user?.email ?? '',
        },
      };
    });
  }

  async getLowStockProducts(
    query: LowStockQueryDto,
  ): Promise<LowStockResponseDto[]> {
    const limit = query.limit ?? 20;
    const threshold = query.threshold ?? 5;

    const products = await this.prisma.product.findMany({
      where: {
        effectiveStock: { lte: threshold },
        isActive: true,
      },
      orderBy: [{ effectiveStock: 'asc' }, { name: 'asc' }],
      take: limit,
      include: {
        category: { select: { name: true } },
        variants: {
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      stock: Number(product.effectiveStock ?? 0), // Use effectiveStock (sum of variant stocks)
      category: product.category?.name ?? 'Unassigned',
      image:
        product.variants?.[0]?.image ??
        product.variants?.[0]?.images?.[0] ??
        null,
    }));
  }

  async getTopProducts(
    query: TopProductsQueryDto,
  ): Promise<TopProductResponseDto[]> {
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? 'revenue';

    // Only count order items from confirmed orders (consistent with sales logic)
    const confirmedStatuses = [
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];

    // First, get order IDs for confirmed orders
    const confirmedOrderIds = await this.prisma.order.findMany({
      where: {
        status: { in: confirmedStatuses },
      },
      select: { id: true },
    });
    const orderIds = confirmedOrderIds.map((o) => o.id);

    // If no confirmed orders, return empty array
    if (orderIds.length === 0) {
      return [];
    }

    // Group order items by productId, only from confirmed orders
    const orderBy =
      sortBy === 'sales'
        ? { _sum: { quantity: 'desc' as const } }
        : { _sum: { total: 'desc' as const } };

    const grouped = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        orderId: { in: orderIds },
      },
      _sum: { total: true, quantity: true },
      orderBy,
      take: limit,
    });

    const productIds = grouped.map((g) => g.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        variants: {
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    const productMap = products.reduce<
      Record<string, { name: string; image?: string }>
    >((acc, product) => {
      acc[product.id] = {
        name: product.name,
        image:
          product.variants?.[0]?.image ??
          product.variants?.[0]?.images?.[0] ??
          undefined,
      };
      return acc;
    }, {});

    return grouped.map((group) => {
      const product = productMap[group.productId] ?? {
        name: 'Unknown product',
        image: undefined,
      };
      return {
        id: group.productId,
        name: product.name,
        sales: Number(group._sum.quantity ?? 0),
        revenue: Number(this.toNumber(group._sum.total).toFixed(2)),
        image: product.image,
      };
    });
  }

  async getSalesData(
    query: SalesDataQueryDto,
  ): Promise<SalesDataResponseDto[]> {
    const days = query.days ?? 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all orders in the date range
    // Only count sales for orders that are confirmed/processed (exclude PENDING and CANCELLED)
    const orders = await this.prisma.order.findMany({
      where: {
        placedAt: { gte: startDate },
        status: {
          in: [
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ],
        },
      },
      select: {
        placedAt: true,
        total: true,
      },
    });

    // Group orders by date
    const salesByDate = new Map<string, { sales: number; orders: number }>();

    // Initialize all dates in range with zero values
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      salesByDate.set(dateKey, { sales: 0, orders: 0 });
    }

    // Aggregate orders by date - ensure all numbers are properly converted
    orders.forEach((order) => {
      const dateKey = new Date(order.placedAt).toISOString().split('T')[0];
      const existing = salesByDate.get(dateKey) ?? { sales: 0, orders: 0 };
      const orderTotal = this.toNumber(order.total);
      salesByDate.set(dateKey, {
        sales: Number((existing.sales + orderTotal).toFixed(2)),
        orders: existing.orders + 1,
      });
    });

    // Convert to array and sort by date - ensure all numbers are JavaScript numbers
    return Array.from(salesByDate.entries())
      .map(([date, data]) => ({
        date,
        sales: Number(data.sales),
        orders: Number(data.orders),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private toNumber(value?: Prisma.Decimal | number | null): number {
    if (value === null || value === undefined) {
      return 0;
    }
    return Number(value);
  }
}
