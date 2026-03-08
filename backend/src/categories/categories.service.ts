import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ensureUniqueSlugInDb,
  generateSlug,
} from '../common/utils/slug.util';
import { TtlCache } from '../common/utils/ttl-cache.util';
import { CategoryNotFoundException } from '../common/exceptions/category-not-found.exception';
import {
  FilterCategoriesDto,
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto';

const CACHE_KEY_TREE = 'tree';
const CACHE_TTL_SECONDS = 120; // 2 min - categories change rarely

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  private readonly treeCache = new TtlCache<string, { id: string; parentId: string | null }[]>(
    CACHE_TTL_SECONDS,
  );

  constructor(private readonly prisma: PrismaService) {}

  /** Invalidate category tree cache (call on create/update/delete) */
  private invalidateTreeCache(): void {
    this.treeCache.delete(CACHE_KEY_TREE);
  }

  private async getCachedTreeData(): Promise<{ id: string; parentId: string | null }[]> {
    const cached = this.treeCache.get(CACHE_KEY_TREE);
    if (cached) return cached;

    const allCategories = await this.prisma.category.findMany({
      select: { id: true, parentId: true },
    });
    this.treeCache.set(CACHE_KEY_TREE, allCategories);
    return allCategories;
  }

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
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    // Fetch all categories to build descendant maps (needed for product count calculation)
    const allCategoriesForTree = await this.prisma.category.findMany({
      select: {
        id: true,
        parentId: true,
      },
    });

    // Build a map of parent -> children for efficient descendant lookup
    const childrenMap = new Map<string, string[]>();
    allCategoriesForTree.forEach((cat) => {
      if (cat.parentId) {
        if (!childrenMap.has(cat.parentId)) {
          childrenMap.set(cat.parentId, []);
        }
        childrenMap.get(cat.parentId)!.push(cat.id);
      }
    });

    // Helper to get descendant IDs without fetching all categories again
    const getDescendantIds = (categoryId: string): string[] => {
      const descendantIds: string[] = [categoryId];
      const queue: string[] = [categoryId];

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const children = childrenMap.get(currentId) || [];
        for (const childId of children) {
          descendantIds.push(childId);
          queue.push(childId);
        }
      }

      return descendantIds;
    };

    // Single query: get product counts per categoryId for all descendant IDs
    const allDescendantIds = new Set<string>();
    categories.forEach((c) =>
      getDescendantIds(c.id).forEach((id) => allDescendantIds.add(id)),
    );

    const counts =
      allDescendantIds.size > 0
        ? await this.prisma.product.groupBy({
            by: ['categoryId'],
            where: { categoryId: { in: Array.from(allDescendantIds) } },
            _count: { id: true },
          })
        : [];

    const countByCategoryId = new Map(
      counts.map((c) => [c.categoryId, c._count.id]),
    );

    const data: CategoryResponseDto[] = categories.map((category) => {
      const descendantIds = getDescendantIds(category.id);
      const totalProductCount = descendantIds.reduce(
        (sum, id) => sum + (countByCategoryId.get(id) ?? 0),
        0,
      );

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        parentId: category.parentId,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        productCount: totalProductCount,
      };
    });

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
   * @returns CategoryResponseDto
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

    // Calculate total product count including subcategories
    const totalProductCount = await this.getTotalProductCount(category.id);

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productCount: totalProductCount,
    };
  }

  /**
   * Create a new category.
   * Auto-generates slug from name and ensures uniqueness.
   * Validates parentId if provided.
   *
   * @param createCategoryDto - Category creation data
   * @returns Created CategoryResponseDto
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
          'Parent category not found',
        );
      }
    }

    // Generate unique slug from name (O(1) DB query)
    const baseSlug = generateSlug(createCategoryDto.name);
    const uniqueSlug = await ensureUniqueSlugInDb(
      this.prisma,
      baseSlug,
      'category',
    );

    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug: uniqueSlug,
        description: createCategoryDto.description ?? null,
        image: createCategoryDto.image ?? null,
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

    this.invalidateTreeCache();
    this.logger.log(`Category created: ${category.id} - ${category.name}`);
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productCount: category._count.products,
    };
  }

  /**
   * Update an existing category.
   * Auto-updates slug if name changes.
   * Validates parentId and prevents circular references.
   *
   * @param id - Category ID
   * @param updateCategoryDto - Category update data
   * @returns Updated CategoryResponseDto
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
            'Parent category not found',
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

    // Update name and slug if name changed (O(1) DB query)
    if (updateCategoryDto.name !== undefined) {
      if (updateCategoryDto.name !== existing.name) {
        data.name = updateCategoryDto.name;
        const baseSlug = generateSlug(updateCategoryDto.name);
        data.slug = await ensureUniqueSlugInDb(
          this.prisma,
          baseSlug,
          'category',
          id,
        );
      }
    }

    // Update description
    if (updateCategoryDto.description !== undefined) {
      data.description = updateCategoryDto.description ?? null;
    }

    // Update image
    if (updateCategoryDto.image !== undefined) {
      data.image = updateCategoryDto.image ?? null;
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
        image: existingWithCount.image,
        parentId: existingWithCount.parentId,
        createdAt: existingWithCount.createdAt,
        updatedAt: existingWithCount.updatedAt,
        productCount: existingWithCount._count.products,
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
      this.invalidateTreeCache();
      this.logger.log(`Category updated: ${category.id} - ${category.name}`);
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        parentId: category.parentId,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        productCount: category._count.products,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(`Unique constraint violation updating category ${id}`);
        throw new ConflictException(
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
   * Calculate total product count for a category including all subcategories.
   * Counts products directly in the category plus all products in descendant categories.
   *
   * @param categoryId - The category ID
   * @returns Total product count including subcategories
   */
  private async getTotalProductCount(categoryId: string): Promise<number> {
    const categoryIds = await this.getDescendantCategoryIds(categoryId);
    return this.prisma.product.count({
      where: {
        categoryId: { in: categoryIds },
      },
    });
  }

  /**
   * Get all descendant category IDs for a given category (recursively).
   * Includes the category itself and all its children, grandchildren, etc.
   * Useful for filtering products by category including all subcategories.
   *
   * @param categoryId - The parent category ID
   * @returns Array of category IDs including the parent and all descendants
   */
  async getDescendantCategoryIds(categoryId: string): Promise<string[]> {
    const allCategories = await this.getCachedTreeData();
    const categoryIds = new Set(allCategories.map((c) => c.id));

    if (!categoryIds.has(categoryId)) {
      throw new CategoryNotFoundException();
    }

    const childrenMap = new Map<string, string[]>();
    allCategories.forEach((cat) => {
      if (cat.parentId) {
        if (!childrenMap.has(cat.parentId)) {
          childrenMap.set(cat.parentId, []);
        }
        childrenMap.get(cat.parentId)!.push(cat.id);
      }
    });

    const descendantIds: string[] = [categoryId];
    const queue: string[] = [categoryId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      for (const childId of childrenMap.get(currentId) ?? []) {
        descendantIds.push(childId);
        queue.push(childId);
      }
    }

    return descendantIds;
  }

  /**
   * Get all ancestor category IDs for a given category (walking up to root).
   * Includes the category itself. Used for category-based promotions (applyToDescendants).
   *
   * @param categoryId - The category ID
   * @returns Array of category IDs: [categoryId, parentId, grandparentId, ...]
   */
  async getAncestorCategoryIds(categoryId: string): Promise<string[]> {
    const allCategories = await this.getCachedTreeData();
    const idToParent = new Map(allCategories.map((c) => [c.id, c.parentId]));

    if (!idToParent.has(categoryId)) {
      throw new CategoryNotFoundException();
    }

    const ancestorIds: string[] = [categoryId];
    let currentId: string | null = idToParent.get(categoryId) ?? null;

    while (currentId) {
      ancestorIds.push(currentId);
      currentId = idToParent.get(currentId) ?? null;
    }

    return ancestorIds;
  }

  /**
   * Find all categories organized in a hierarchical tree structure.
   * Returns only root categories (categories without parentId) with their children populated.
   * Useful for navigation menus and category pickers.
   *
   * @returns Array of root categories with children populated recursively
   */
  async findTree(): Promise<CategoryResponseDto[]> {
    const allCategories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const childrenMap = new Map<string, string[]>();
    allCategories.forEach((cat) => {
      if (cat.parentId) {
        if (!childrenMap.has(cat.parentId)) {
          childrenMap.set(cat.parentId, []);
        }
        childrenMap.get(cat.parentId)!.push(cat.id);
      }
    });

    const getDescendantIds = (categoryId: string): string[] => {
      const ids: string[] = [categoryId];
      const queue: string[] = [categoryId];
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        for (const childId of childrenMap.get(currentId) ?? []) {
          ids.push(childId);
          queue.push(childId);
        }
      }
      return ids;
    };

    const allDescendantIds = new Set<string>();
    allCategories.forEach((c) =>
      getDescendantIds(c.id).forEach((id) => allDescendantIds.add(id)),
    );

    const counts =
      allDescendantIds.size > 0
        ? await this.prisma.product.groupBy({
            by: ['categoryId'],
            where: { categoryId: { in: Array.from(allDescendantIds) } },
            _count: { id: true },
          })
        : [];

    const countByCategoryId = new Map(
      counts.map((c) => [c.categoryId, c._count.id]),
    );

    const categoryMap = new Map<string, CategoryResponseDto>();
    for (const category of allCategories) {
      const descendantIds = getDescendantIds(category.id);
      const totalProductCount = descendantIds.reduce(
        (sum, id) => sum + (countByCategoryId.get(id) ?? 0),
        0,
      );
      categoryMap.set(category.id, {
        ...category,
        productCount: totalProductCount,
        children: [],
      });
    }

    const rootCategories: CategoryResponseDto[] = [];
    allCategories.forEach((category) => {
      const categoryDto = categoryMap.get(category.id)!;
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children!.push(categoryDto);
        }
      } else {
        rootCategories.push(categoryDto);
      }
    });

    return rootCategories;
  }

  /**
   * Delete a category.
   * Prevents deletion if category has products or child categories.
   *
   * @param id - Category ID
   * @throws CategoryNotFoundException if category not found
   * @throws BadRequestException if category has products or child categories
   */
  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
        children: { select: { id: true, name: true } },
      },
    });

    if (!category) {
      throw new CategoryNotFoundException();
    }

    if (category.products.length > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${category.products.length} products. Remove or reassign products first.`,
      );
    }

    if (category.children.length > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${category.children.length} subcategories. Delete or reassign subcategories first.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    this.invalidateTreeCache();
    this.logger.log(`Category deleted: ${id} - ${category.name}`);
  }
}
