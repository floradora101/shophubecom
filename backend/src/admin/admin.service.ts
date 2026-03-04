import { Injectable, Logger } from '@nestjs/common';
import { Prisma, OrderStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/decimal.util';
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
      // Count low stock products via SQL aggregation (avoids loading all products into memory)
      (async () => {
        const result = await this.prisma.$queryRaw<{ count: number }[]>`
          SELECT COUNT(*)::int as count FROM (
            SELECT p.id
            FROM "Product" p
            JOIN (
              SELECT "productId", SUM(stock) as total_stock
              FROM "ProductVariant"
              GROUP BY "productId"
            ) v ON v."productId" = p.id
            WHERE p."isActive" = true AND v.total_stock <= ${lowStockThreshold}
          ) sub
        `;
        return result[0]?.count ?? 0;
      })(),
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
      totalSales: Number(toNumber(salesAggregate._sum.total).toFixed(2)),
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
        totalAmount: Number(toNumber(order.total).toFixed(2)),
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

    // Fetch all active products with variants and category
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: { select: { name: true } },
        variants: {
          select: { stock: true, image: true, images: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Compute effectiveStock and filter/sort in memory
    const productsWithStock = products
      .map((product) => {
        const effectiveStock = product.variants.reduce(
          (sum, v) => sum + v.stock,
          0,
        );
        return {
          ...product,
          effectiveStock,
        };
      })
      .filter((p) => p.effectiveStock <= threshold)
      .sort((a, b) => {
        if (a.effectiveStock !== b.effectiveStock) {
          return a.effectiveStock - b.effectiveStock;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit);

    return productsWithStock.map((product) => ({
      id: product.id,
      name: product.name,
      stock: Number(product.effectiveStock),
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

    // Group order items by productId, only from confirmed orders
    // Use subquery instead of loading all order IDs into memory
    const orderBy =
      sortBy === 'sales'
        ? { _sum: { quantity: 'desc' as const } }
        : { _sum: { total: 'desc' as const } };

    const grouped = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: { in: confirmedStatuses },
        },
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
        revenue: Number(toNumber(group._sum.total).toFixed(2)),
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
      const orderTotal = toNumber(order.total);
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

}
