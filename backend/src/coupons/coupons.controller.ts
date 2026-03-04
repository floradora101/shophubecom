import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CouponsService } from './coupons.service';
import {
  CreateCouponDto,
  UpdateCouponDto,
  FilterCouponsDto,
  CouponResponseDto,
  ValidateCouponDto,
  ValidateCouponResponseDto,
} from './dto';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

/**
 * Coupons Controller
 *
 * Handles coupon management endpoints.
 * All routes require ADMIN role except GET endpoints which are public for validation.
 *
 * Route Structure:
 * - GET /api/coupons - Get all coupons (with filters)
 * - GET /api/coupons/:id - Get single coupon by ID
 * - POST /api/coupons - Create new coupon (admin only)
 * - PUT /api/coupons/:id - Update coupon (admin only)
 * - DELETE /api/coupons/:id - Delete coupon (admin only)
 */
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  /**
   * Validate a coupon for checkout (public endpoint).
   * Must be declared before :id route.
   * Uses optional auth for perUserLimit check when user is logged in.
   */
  @Post('validate')
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  validate(
    @Body() dto: ValidateCouponDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ValidateCouponResponseDto> {
    return this.couponsService.validateForCheckout(
      dto.code,
      dto.subtotal,
      user?.id,
      dto.guestEmail,
    );
  }

  @Get()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  findAll(@Query() filters: FilterCouponsDto): Promise<{
    data: CouponResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.couponsService.findAll(filters);
  }

  @Get(':id')
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  findOne(@Param('id') id: string): Promise<CouponResponseDto> {
    return this.couponsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createCouponDto: CreateCouponDto,
  ): Promise<CouponResponseDto> {
    return this.couponsService.create(createCouponDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<CouponResponseDto> {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.couponsService.remove(id);
  }
}
