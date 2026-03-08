import { Test } from '@nestjs/testing';
import { ProductQueryService } from './product-query.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductMapperService } from './product-mapper.service';
import { ProductPromotionService } from './product-promotion.service';
import { CategoriesService } from '../../categories/categories.service';
import { CategoryNotFoundException } from '../../common/exceptions';
import { FilterProductsDto } from '../dto';

describe('ProductQueryService', () => {
  let productQueryService: ProductQueryService;
  let prismaService: jest.Mocked<PrismaService>;
  let categoriesService: jest.Mocked<CategoriesService>;

  beforeEach(async () => {
    const mockPrisma = {
      product: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      promotion: {
        findUnique: jest.fn(),
      },
    };

    const mockProductMapper = {
      toProductResponse: jest.fn((p: unknown) => ({ id: (p as { id: string }).id })),
    };

    const mockProductPromotionService = {
      getCategoryPromotionsForCategories: jest.fn().mockResolvedValue(new Map()),
    };

    const mockCategoriesService = {
      getDescendantCategoryIds: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ProductQueryService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ProductMapperService, useValue: mockProductMapper },
        { provide: ProductPromotionService, useValue: mockProductPromotionService },
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    productQueryService = module.get(ProductQueryService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    categoriesService = module.get(CategoriesService) as jest.Mocked<CategoriesService>;

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns empty data when category is not found', async () => {
      categoriesService.getDescendantCategoryIds.mockRejectedValue(
        new CategoryNotFoundException('cat-nonexistent'),
      );

      const filters: FilterProductsDto = {
        categoryId: 'cat-nonexistent',
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const result = await productQueryService.findAll(filters, false);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(prismaService.product.findMany).not.toHaveBeenCalled();
    });

    it('returns empty data when promotion is not found', async () => {
      (prismaService.promotion as { findUnique: jest.Mock }).findUnique =
        jest.fn().mockResolvedValue(null);

      const filters: FilterProductsDto = {
        promotionId: 'promo-nonexistent',
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const result = await productQueryService.findAll(filters, false);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
    });

    it('includes isActive filter for non-admin', async () => {
      (prismaService.product.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.product.count as jest.Mock).mockResolvedValue(0);

      const filters: FilterProductsDto = {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      await productQueryService.findAll(filters, false);

      const findManyCall = (prismaService.product.findMany as jest.Mock).mock
        .calls[0][0];
      expect(findManyCall.where).toHaveProperty('isActive', true);
    });

    it('omits isActive filter for admin', async () => {
      (prismaService.product.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.product.count as jest.Mock).mockResolvedValue(0);

      const filters: FilterProductsDto = {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      await productQueryService.findAll(filters, true);

      const findManyCall = (prismaService.product.findMany as jest.Mock).mock
        .calls[0][0];
      expect(findManyCall.where).not.toHaveProperty('isActive');
    });
  });
});
