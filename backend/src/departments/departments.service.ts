import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDepartmentDto,
  DepartmentResponseDto,
  FilterDepartmentsDto,
  UpdateDepartmentDto,
} from './dto';
import { DepartmentNotFoundException } from '../common/exceptions';

/** Department with relations for toResponse */
type DepartmentWithRelations = Prisma.DepartmentGetPayload<{
  include: {
    parentCategory: { select: { id: true; name: true; slug: true; parentId: true } };
    highlightedSubcategories: {
      orderBy: { sortOrder: 'asc' };
      include: {
        category: { select: { id: true; name: true; slug: true; parentId: true } };
      };
    };
  };
}>;

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private toResponse(dto: DepartmentWithRelations): DepartmentResponseDto {
    return {
      id: dto.id,
      name: dto.name,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      parentCategory: dto.parentCategory,
      highlightedSubcategories: dto.highlightedSubcategories
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((h) => h.category),
    };
  }

  private async assertValidParentCategory(parentCategoryId: string): Promise<void> {
    const parent = await this.prisma.category.findUnique({
      where: { id: parentCategoryId },
      select: { id: true, parentId: true },
    });

    if (!parent) {
      throw new BadRequestException(
        `Parent category with id ${parentCategoryId} not found`,
      );
    }

    // Keep admin UX consistent: parent must be a root category
    if (parent.parentId) {
      throw new BadRequestException('Parent category must be a root category');
    }
  }

  private normalizeIds(ids?: string[]): string[] {
    if (!ids) return [];
    const out: string[] = [];
    const seen = new Set<string>();
    for (const id of ids) {
      if (!id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
    return out;
  }

  private async assertHighlightedBelongToParent(
    parentCategoryId: string,
    highlightedIds: string[],
  ): Promise<void> {
    if (highlightedIds.length === 0) return;

    const valid = await this.prisma.category.findMany({
      where: {
        id: { in: highlightedIds },
        parentId: parentCategoryId,
      },
      select: { id: true },
    });

    if (valid.length !== highlightedIds.length) {
      throw new BadRequestException(
        'All highlighted subcategories must be direct children of the selected parent category',
      );
    }
  }

  /**
   * Public endpoint: active department spotlights for the storefront.
   */
  async findActive(): Promise<DepartmentResponseDto[]> {
    const depts = await this.prisma.department.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        parentCategory: { select: { id: true, name: true, slug: true, parentId: true } },
        highlightedSubcategories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            category: { select: { id: true, name: true, slug: true, parentId: true } },
          },
        },
      },
    });

    return depts.map((d) =>
      this.toResponse({
        ...d,
        highlightedSubcategories: d.highlightedSubcategories,
      }),
    );
  }

  /**
   * Admin endpoint: list with search/pagination/sort.
   */
  async findAll(filters: FilterDepartmentsDto): Promise<{
    data: DepartmentResponseDto[];
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
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: Prisma.DepartmentWhereInput = {};
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { parentCategory: { name: { contains: search, mode: 'insensitive' } } },
        { parentCategory: { slug: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const skip = (page - 1) * limit;
    const orderBy: Prisma.DepartmentOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [items, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          parentCategory: { select: { id: true, name: true, slug: true, parentId: true } },
          highlightedSubcategories: {
            orderBy: { sortOrder: 'asc' },
            include: {
              category: { select: { id: true, name: true, slug: true, parentId: true } },
            },
          },
        },
      }),
      this.prisma.department.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: items.map((d) => this.toResponse(d)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<DepartmentResponseDto> {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        parentCategory: { select: { id: true, name: true, slug: true, parentId: true } },
        highlightedSubcategories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            category: { select: { id: true, name: true, slug: true, parentId: true } },
          },
        },
      },
    });

    if (!dept) throw new DepartmentNotFoundException();
    return this.toResponse(dept);
  }

  async create(dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    await this.assertValidParentCategory(dto.parentCategoryId);
    const highlightedIds = this.normalizeIds(dto.highlightedSubCategoryIds);
    await this.assertHighlightedBelongToParent(dto.parentCategoryId, highlightedIds);

    const created = await this.prisma.department.create({
      data: {
        name: dto.name,
        isActive: dto.isActive ?? true,
        parentCategoryId: dto.parentCategoryId,
        highlightedSubcategories: {
          create: highlightedIds.map((categoryId, idx) => ({
            categoryId,
            sortOrder: idx,
          })),
        },
      },
      include: {
        parentCategory: { select: { id: true, name: true, slug: true, parentId: true } },
        highlightedSubcategories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            category: { select: { id: true, name: true, slug: true, parentId: true } },
          },
        },
      },
    });

    this.logger.log(`Department created: ${created.id} - ${created.name}`);
    return this.toResponse(created);
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    const existing = await this.prisma.department.findUnique({
      where: { id },
      select: { id: true, name: true, parentCategoryId: true },
    });
    if (!existing) throw new DepartmentNotFoundException();

    const data: Prisma.DepartmentUpdateInput = {};
    let nextParentCategoryId: string | null = null;

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    if (dto.parentCategoryId !== undefined) {
      if (!dto.parentCategoryId) {
        throw new BadRequestException('parentCategoryId is required');
      }
      await this.assertValidParentCategory(dto.parentCategoryId);
      nextParentCategoryId = dto.parentCategoryId;
      data.parentCategory = { connect: { id: dto.parentCategoryId } };
    }

    const highlightedIds =
      dto.highlightedSubCategoryIds !== undefined
        ? this.normalizeIds(dto.highlightedSubCategoryIds)
        : undefined;

    const effectiveParentId = nextParentCategoryId ?? existing.parentCategoryId;

    // If parent changes but highlight list isn't provided, clear highlights to avoid invalid configuration.
    const shouldReplaceHighlights =
      highlightedIds !== undefined || nextParentCategoryId !== null;

    const replacementHighlights = highlightedIds ?? [];

    await this.assertHighlightedBelongToParent(effectiveParentId, replacementHighlights);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (shouldReplaceHighlights) {
        await tx.departmentHighlightedSubcategory.deleteMany({
          where: { departmentId: id },
        });
      }

      const dept = await tx.department.update({
        where: { id },
        data,
      });

      if (shouldReplaceHighlights && replacementHighlights.length > 0) {
        await tx.departmentHighlightedSubcategory.createMany({
          data: replacementHighlights.map((categoryId, idx) => ({
            departmentId: id,
            categoryId,
            sortOrder: idx,
          })),
        });
      }

      return dept;
    });

    this.logger.log(`Department updated: ${updated.id} - ${updated.name}`);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.department.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!existing) throw new DepartmentNotFoundException();

    await this.prisma.department.delete({ where: { id } });
    this.logger.log(`Department deleted: ${id} - ${existing.name}`);
  }
}

