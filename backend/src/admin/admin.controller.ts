import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
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

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats(@Query() query: AdminStatsQueryDto): Promise<AdminStatsResponseDto> {
    return this.adminService.getStats(query);
  }

  @Get('orders/recent')
  getRecentOrders(
    @Query() query: RecentOrdersQueryDto,
  ): Promise<AdminOrderSummaryDto[]> {
    return this.adminService.getRecentOrders(query);
  }

  @Get('products/low-stock')
  getLowStockProducts(
    @Query() query: LowStockQueryDto,
  ): Promise<LowStockResponseDto[]> {
    return this.adminService.getLowStockProducts(query);
  }

  @Get('products/top')
  getTopProducts(
    @Query() query: TopProductsQueryDto,
  ): Promise<TopProductResponseDto[]> {
    return this.adminService.getTopProducts(query);
  }

  @Get('sales-data')
  getSalesData(
    @Query() query: SalesDataQueryDto,
  ): Promise<SalesDataResponseDto[]> {
    return this.adminService.getSalesData(query);
  }
}
