import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { OrdersService } from './orders.service';
import { AdminFilterOrdersDto, UpdateOrderStatusDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

/**
 * Admin Orders Controller
 *
 * Handles all admin-specific order management endpoints.
 * All routes in this controller are ADMIN-only.
 *
 * Route Structure:
 * - GET /api/admin/orders - Get all orders (admin dashboard)
 * - PATCH /api/admin/orders/:id/status - Update order status
 *
 * Guard Strategy:
 * - Controller-level: @UseGuards(JwtAuthGuard, RolesGuard) + @Roles(UserRole.ADMIN)
 * - All routes inherit ADMIN-only access from controller level
 */
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * @route GET /api/admin/orders
   * @description Get all orders across all users (ADMIN dashboard view)
   * @param filters - Admin query filters (status, userId, date range, pagination, etc.)
   * @returns Paginated list of all orders in the system
   * @security ADMIN-only endpoint
   * @example GET /api/admin/orders?status=SHIPPED&page=1&limit=20
   */
  @Get()
  findAllAdmin(@Query() filters: AdminFilterOrdersDto) {
    return this.ordersService.findForAdmin(filters);
  }

  /**
   * @route PATCH /api/admin/orders/:id/status
   * @description Update the status of an order (ADMIN only)
   * @param id - Order ID to update
   * @param updateOrderStatusDto - New status and optional notes
   * @returns Updated order with new status
   * @security ADMIN-only endpoint
   * @example PATCH /api/admin/orders/clx1234567890/status { status: "SHIPPED", notes: "Shipped via FedEx" }
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
