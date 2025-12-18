import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CheckoutService } from './checkout.service';
import { PlaceOrderDto, PlaceOrderResponseDto } from './dto';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@Controller('checkout')
@UseGuards(OptionalJwtAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('place-order')
  @HttpCode(HttpStatus.CREATED)
  async placeOrder(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: PlaceOrderDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PlaceOrderResponseDto> {
    return this.checkoutService.placeOrder(user?.id, dto, req, res);
  }
}
