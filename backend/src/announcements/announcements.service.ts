import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  FilterAnnouncementsDto,
  AnnouncementResponseDto,
} from './dto';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Transform Prisma Announcement to response DTO
   */
  private toResponseDto(announcement: any): AnnouncementResponseDto {
    return {
      id: announcement.id,
      text: announcement.text,
      highlight: announcement.highlight,
      icon: announcement.icon,
      isActive: announcement.isActive,
      priority: announcement.priority,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
    };
  }

  /**
   * Find all announcements with filtering, pagination, and sorting
   */
  async findAll(filters: FilterAnnouncementsDto): Promise<{
    data: AnnouncementResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'priority',
      sortOrder = 'desc',
    } = filters;

    const where: Prisma.AnnouncementWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { text: { contains: search, mode: 'insensitive' } },
        { highlight: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Active filter
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Prisma.AnnouncementOrderByWithRelationInput = {};
    if (sortBy === 'priority') {
      orderBy.priority = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder;
    }

    // Execute query
    const [data, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.announcement.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((announcement) => this.toResponseDto(announcement)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find active announcements (public endpoint)
   * Returns only active announcements sorted by priority
   */
  async findActive(): Promise<AnnouncementResponseDto[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        priority: 'desc',
      },
    });

    return announcements.map((announcement) =>
      this.toResponseDto(announcement),
    );
  }

  /**
   * Find a single announcement by ID
   */
  async findOne(id: string): Promise<AnnouncementResponseDto> {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return this.toResponseDto(announcement);
  }

  /**
   * Create a new announcement
   */
  async create(
    createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<AnnouncementResponseDto> {
    const data: Prisma.AnnouncementCreateInput = {
      text: createAnnouncementDto.text,
      highlight: createAnnouncementDto.highlight,
      icon: createAnnouncementDto.icon,
      isActive: createAnnouncementDto.isActive ?? true,
      priority: createAnnouncementDto.priority ?? 0,
    };

    const announcement = await this.prisma.announcement.create({ data });
    return this.toResponseDto(announcement);
  }

  /**
   * Update an announcement
   */
  async update(
    id: string,
    updateAnnouncementDto: UpdateAnnouncementDto,
  ): Promise<AnnouncementResponseDto> {
    // Check if announcement exists
    const existing = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    const data: Prisma.AnnouncementUpdateInput = {};

    if (updateAnnouncementDto.text !== undefined) {
      data.text = updateAnnouncementDto.text;
    }
    if (updateAnnouncementDto.highlight !== undefined) {
      data.highlight = updateAnnouncementDto.highlight;
    }
    if (updateAnnouncementDto.icon !== undefined) {
      data.icon = updateAnnouncementDto.icon;
    }
    if (updateAnnouncementDto.isActive !== undefined) {
      data.isActive = updateAnnouncementDto.isActive;
    }
    if (updateAnnouncementDto.priority !== undefined) {
      data.priority = updateAnnouncementDto.priority;
    }

    const announcement = await this.prisma.announcement.update({
      where: { id },
      data,
    });

    return this.toResponseDto(announcement);
  }

  /**
   * Delete an announcement
   */
  async remove(id: string): Promise<void> {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    await this.prisma.announcement.delete({
      where: { id },
    });
  }
}
