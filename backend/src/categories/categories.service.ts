import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ensureUniqueSlug, generateSlug } from '../common/utils/slug.util';
import { CategoryNotFoundException } from '../common/exceptions/category-not-found.exception';
import {
  FilterCategoriesDto,
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all categories with filtering, pagination, and sorting support.
   *
   * FILTERING LOGIC:
   * - search: Case-insensitive search in category name, slug, and description fields
   *
   * PAGINATION:
   * - Default: page 1, limit 20 items per page
   * - Calculates skip offset: (page - 1) * limit
   * - All filters are applied BEFORE pagination for correctness
   *
   * SORTING:
   * - Default: name ascending (alphabetically)
   * - Supported fields: 'name' | 'createdAt'
   * - Supported orders: 'asc' | 'desc'
   *
   * PERFORMANCE:
   * - Uses Promise.all for parallel execution of data fetch and count query
   * - Includes product count using Prisma _count relation
   *
   * @param filters - Filter parameters (search, page, limit, sortBy, sortOrder)
   * @returns Paginated category list with metadata (data, total, page, limit, totalPages)
   */
  async findAll(filters: FilterCategoriesDto): Promise<{
    data: CategoryResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    // Build Prisma where clause dynamically based on provided filters
    const where: Prisma.CategoryWhereInput = {};

    // Search filter: case-insensitive search in name, slug, and description
    // Uses PostgreSQL ILIKE operator via Prisma's 'insensitive' mode
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination offset
    const skip = (page - 1) * limit;

    // Build dynamic sort order
    const orderBy: Prisma.CategoryOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute queries in parallel for better performance
    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.category.count({ where }),
    ]);

    // Transform categories to response DTOs with productCount
    const data: CategoryResponseDto[] = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      productCount: category._count.products,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find a single category by ID or slug.
   * Includes product count in the response.
   *
   * @param idOrSlug - Category ID or slug
   * @returns CategoryResponseDto with productCount
   * @throws CategoryNotFoundException if category not found
   */
  async findOne(idOrSlug: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new CategoryNotFoundException();
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      productCount: category._count.products,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Create a new category.
   * Auto-generates slug from name and ensures uniqueness.
   * Validates parentId if provided.
   *
   * @param createCategoryDto - Category creation data
   * @returns Created CategoryResponseDto with productCount
   * @throws BadRequestException if parentId is invalid
   */
  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    // Validate parentId if provided
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });
      if (!parent) {
        throw new BadRequestException(
          `Parent category with id ${createCategoryDto.parentId} not found`,
        );
      }
    }

    // Generate unique slug from name
    const baseSlug = generateSlug(createCategoryDto.name);
    const existingCategories = await this.prisma.category.findMany({
      select: { slug: true },
    });
    const existingSlugs = existingCategories.map((c) => c.slug);
    const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);

    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug: uniqueSlug,
        description: createCategoryDto.description ?? null,
        parentId: createCategoryDto.parentId ?? null,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    this.logger.log(`Category created: ${category.id} - ${category.name}`);
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      productCount: category._count.products,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Update an existing category.
   * Auto-updates slug if name changes.
   * Validates parentId and prevents circular references.
   *
   * @param id - Category ID
   * @param updateCategoryDto - Category update data
   * @returns Updated CategoryResponseDto with productCount
   * @throws CategoryNotFoundException if category not found
   * @throws BadRequestException if parentId is invalid or creates circular reference
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const existing = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new CategoryNotFoundException();
    }

    // Prevent circular references: category cannot be its own parent
    if (updateCategoryDto.parentId === id) {
      throw new BadRequestException('A category cannot be its own parent');
    }

    // Validate parentId if provided
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId) {
        const parent = await this.prisma.category.findUnique({
          where: { id: updateCategoryDto.parentId },
        });
        if (!parent) {
          throw new BadRequestException(
            `Parent category with id ${updateCategoryDto.parentId} not found`,
          );
        }
        // Prevent setting a descendant as parent (circular reference check)
        const isDescendant = await this.isDescendant(
          updateCategoryDto.parentId,
          id,
        );
        if (isDescendant) {
          throw new BadRequestException(
            'Cannot set a descendant category as parent (would create circular reference)',
          );
        }
      }
    }

    const data: Prisma.CategoryUpdateInput = {};

    // Update name and slug if name changed
    if (updateCategoryDto.name !== undefined) {
      if (updateCategoryDto.name !== existing.name) {
        data.name = updateCategoryDto.name;

        const baseSlug = generateSlug(updateCategoryDto.name);
        const existingCategory = await this.prisma.category.findFirst({
          where: {
            slug: baseSlug,
            id: { not: id },
          },
          select: { slug: true },
        });

        if (existingCategory) {
          const existingCategories = await this.prisma.category.findMany({
            select: { slug: true },
            where: { id: { not: id } },
          });
          const existingSlugs = existingCategories.map((c) => c.slug);
          data.slug = ensureUniqueSlug(baseSlug, existingSlugs);
        } else {
          data.slug = baseSlug;
        }
      }
    }

    // Update description
    if (updateCategoryDto.description !== undefined) {
      data.description = updateCategoryDto.description ?? null;
    }

    // Update parent
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId) {
        data.parent = {
          connect: { id: updateCategoryDto.parentId },
        };
      } else {
        data.parent = {
          disconnect: true,
        };
      }
    }

    // If no changes, return existing category
    if (Object.keys(data).length === 0) {
      const existingWithCount = await this.prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });
      if (!existingWithCount) {
        throw new CategoryNotFoundException();
      }
      return {
        id: existingWithCount.id,
        name: existingWithCount.name,
        slug: existingWithCount.slug,
        description: existingWithCount.description,
        parentId: existingWithCount.parentId,
        productCount: existingWithCount._count.products,
        createdAt: existingWithCount.createdAt,
        updatedAt: existingWithCount.updatedAt,
      };
    }

    try {
      const category = await this.prisma.category.update({
        where: { id },
        data,
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });
      this.logger.log(`Category updated: ${category.id} - ${category.name}`);
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        productCount: category._count.products,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(`Unique constraint violation updating category ${id}`);
        throw new BadRequestException(
          'Category with this name or slug already exists',
        );
      }

      if (error instanceof Error) {
        this.logger.error(
          `Failed to update category ${id}: ${error.message}`,
          error.stack,
        );
      }

      throw error;
    }
  }

  /**
   * Check if a category is a descendant of another category.
   * Used to prevent circular references in category hierarchy.
   *
   * @param potentialParentId - The potential parent category ID
   * @param categoryId - The category ID to check
   * @returns true if potentialParentId is a descendant of categoryId
   */
  private async isDescendant(
    potentialParentId: string,
    categoryId: string,
  ): Promise<boolean> {
    let currentId: string | null = potentialParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) {
        // Circular reference detected in the tree itself
        break;
      }
      visited.add(currentId);

      if (currentId === categoryId) {
        return true; // Found the category in the parent chain
      }

      const category: { parentId: string | null } | null =
        await this.prisma.category.findUnique({
          where: { id: currentId },
          select: { parentId: true },
        });

      currentId = category?.parentId ?? null;
    }

    return false;
  }

  /**
   * Delete a category.
   * Prevents deletion if category has products.
   *
   * @param id - Category ID
   * @throws CategoryNotFoundException if category not found
   * @throws BadRequestException if category has products
   */
  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new CategoryNotFoundException();
    }

    if (category.products.length > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${category.products.length} products. Remove or reassign products first.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    this.logger.log(`Category deleted: ${id} - ${category.name}`);
  }
}

