import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { SyncFavoritesDto } from './dto/sync-favorites.dto';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<string[]> {
    return this.favoritesService.findAll(user.id);
  }

  /**
   * Sync favorites: replace user's backend favorites with given list.
   * Used on login to merge local favorites with backend.
   */
  @Post('sync')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  sync(
    @Body() syncFavoritesDto: SyncFavoritesDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string[]> {
    const ids = syncFavoritesDto.productIds ?? [];
    return this.favoritesService.sync(user.id, ids);
  }

  @Post(':productId')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  add(
    @Param('productId') productId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.favoritesService.add(user.id, productId);
  }

  @Delete(':productId')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  remove(
    @Param('productId') productId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.favoritesService.remove(user.id, productId);
  }
}
