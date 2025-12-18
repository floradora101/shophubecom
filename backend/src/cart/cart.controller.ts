import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CartService } from './cart.service';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { AddCartItemDto, CartResponseDto, UpdateCartItemDto } from './dto';

@Controller('cart')
@UseGuards(OptionalJwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<CartResponseDto> {
    return this.cartService.getCart(user?.id, req, res);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AddCartItemDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<CartResponseDto> {
    return this.cartService.addItem(user?.id, dto, req, res);
  }

  @Patch('items/:itemId')
  updateItem(
    @Param('itemId') itemId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<CartResponseDto> {
    return this.cartService.updateItem(user?.id, itemId, dto, req, res);
  }

  @Delete('items/:itemId')
  async removeItem(
    @Param('itemId') itemId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<CartResponseDto> {
    return this.cartService.removeItem(user?.id, itemId, req, res);
  }

  @Delete()
  async clearCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<CartResponseDto> {
    return this.cartService.clearCart(user?.id, req, res);
  }
}
