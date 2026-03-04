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
import { AnnouncementsService } from './announcements.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementResponseDto,
  FilterAnnouncementsDto,
} from './dto';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly announcementsService: AnnouncementsService,
  ) {}

  /**
   * Public endpoint: Get active announcements
   * Returns only active announcements sorted by priority
   */
  @Get('active')
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  findActive(): Promise<AnnouncementResponseDto[]> {
    return this.announcementsService.findActive();
  }

  /**
   * Admin endpoint: Get all announcements with filtering and pagination
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  findAll(@Query() filters: FilterAnnouncementsDto): Promise<{
    data: AnnouncementResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.announcementsService.findAll(filters);
  }

  /**
   * Admin endpoint: Get a single announcement by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  findOne(@Param('id') id: string): Promise<AnnouncementResponseDto> {
    return this.announcementsService.findOne(id);
  }

  /**
   * Admin endpoint: Create a new announcement
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<AnnouncementResponseDto> {
    return this.announcementsService.create(createAnnouncementDto);
  }

  /**
   * Admin endpoint: Update an announcement
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ): Promise<AnnouncementResponseDto> {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  /**
   * Admin endpoint: Delete an announcement
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.announcementsService.remove(id);
  }
}
