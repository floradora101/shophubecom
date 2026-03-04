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
import { HeroSlidesService } from './hero-slides.service';
import {
  CreateHeroSlideDto,
  UpdateHeroSlideDto,
  HeroSlideResponseDto,
  FilterHeroSlidesDto,
} from './dto';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('hero-slides')
export class HeroSlidesController {
  constructor(private readonly heroSlidesService: HeroSlidesService) {}

  /**
   * Public endpoint: Get active hero slides
   * Returns only active slides that are within their date range
   */
  @Get('active')
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  findActive(): Promise<HeroSlideResponseDto[]> {
    return this.heroSlidesService.findActive();
  }

  /**
   * Admin endpoint: Get all hero slides with filtering and pagination
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  findAll(@Query() filters: FilterHeroSlidesDto): Promise<{
    data: HeroSlideResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.heroSlidesService.findAll(filters);
  }

  /**
   * Admin endpoint: Get a single hero slide by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  findOne(@Param('id') id: string): Promise<HeroSlideResponseDto> {
    return this.heroSlidesService.findOne(id);
  }

  /**
   * Admin endpoint: Create a new hero slide
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createHeroSlideDto: CreateHeroSlideDto,
  ): Promise<HeroSlideResponseDto> {
    return this.heroSlidesService.create(createHeroSlideDto);
  }

  /**
   * Admin endpoint: Update a hero slide
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateHeroSlideDto: UpdateHeroSlideDto,
  ): Promise<HeroSlideResponseDto> {
    return this.heroSlidesService.update(id, updateHeroSlideDto);
  }

  /**
   * Admin endpoint: Delete a hero slide
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.heroSlidesService.remove(id);
  }
}
