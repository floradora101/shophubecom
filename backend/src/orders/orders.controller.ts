import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto, FilterOrdersDto, OrderStatsDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import type { Request } from 'express';

/**
 * Orders Controller
 *
 * Handles customer-facing order endpoints (customer profile features).
 * All routes are accessible to any authenticated user (ADMIN or CUSTOMER).
 *
 * Route Structure:
 * - POST /api/orders - Create new order
 * - GET /api/orders - Get user's orders
 * - GET /api/orders/stats - Get user's order statistics
 * - GET /api/orders/:id - Get single order by ID (supports guest access with token)
 *
 * Guard Strategy:
 * - Method-level guards: Each route has its own guard
 * - findOne uses OptionalJwtAuthGuard to support guest access
 * - Other routes use JwtAuthGuard (require authentication)
 * - No role restrictions - accessible to any authenticated user
 *
 * Note: Admin endpoints are handled by AdminOrdersController at /api/admin/orders
 */
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * @route POST /api/orders
   * @description Create a new order for the current authenticated user
   * @param user - Current authenticated user (injected by JwtAuthGuard)
   * @param createOrderDto - Order creation data (items, shipping address, etc.)
   * @returns Created order with all details
   * @security Accessible to any authenticated user (ADMIN or CUSTOMER)
   * @example POST /api/orders { items: [...], shippingAddressId: "..." }
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.id, createOrderDto);
  }

  /**
   * @route GET /api/orders
   * @description Get all orders for the current authenticated user (customer profile feature)
   * @param user - Current authenticated user (injected by JwtAuthGuard)
   * @param filters - Query filters (status, page, limit, date range, etc.)
   * @returns Paginated list of user's orders
   * @security Accessible to any authenticated user (ADMIN or CUSTOMER)
   * @example GET /api/orders?status=PENDING&page=1&limit=10
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: FilterOrdersDto,
  ) {
    return this.ordersService.findForUser(user.id, filters);
  }

  /**
   * @route GET /api/orders/stats
   * @description Get order statistics for the current authenticated user
   * @param user - Current authenticated user (injected by JwtAuthGuard)
   * @returns Order statistics (total orders, total spent, pending orders, completed orders)
   * @security Accessible to any authenticated user (ADMIN or CUSTOMER)
   * @note This is a customer profile feature, NOT an admin endpoint
   * @example GET /api/orders/stats
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats(@CurrentUser() user: AuthenticatedUser): Promise<OrderStatsDto> {
    return this.ordersService.getStatsForUser(user.id);
  }

  /**
   * @route GET /api/orders/:id
   * @description Get a single order by ID
   * @param id - Order ID
   * @param user - Current authenticated user (optional, injected by OptionalJwtAuthGuard)
   * @param req - Request object (for cookies)
   * @returns Order details with items and shipping information
   * @security
   *   - Authenticated: owner/admin only
   *   - Unauthenticated: require httpOnly cookie `order_token_<orderId>`; timing-safe compare with accessTokenHash
   * @example GET /api/orders/clx1234567890 (authenticated)
   * @example GET /api/orders/clx1234567890 (guest with httpOnly cookie)
   */
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ) {
    // For guest access, read token from httpOnly cookie
    // Cookie name: order_token_<orderId>
    const cookieName = `order_token_${id}`;
    const token = req.cookies?.[cookieName] as string | undefined;

    const isAdmin = user?.role === UserRole.ADMIN;
    return this.ordersService.findOne(id, user?.id, isAdmin, token);
  }
}
