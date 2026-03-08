import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, FilterReviewsDto, ReviewResponseDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  findAll(
    @Param('productId') productId: string,
    @Query() filters: FilterReviewsDto,
  ): Promise<{
    data: ReviewResponseDto[];
    stats: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
      verifiedReviews: number;
    };
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    return this.reviewsService.findAll(productId, filters);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  create(
    @Param('productId') productId: string,
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.create(productId, user.id, createReviewDto);
  }
}
