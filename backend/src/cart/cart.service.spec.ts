import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { CartIdentityService } from './cart-identity.service';
import { ProductVariantNotFoundException } from '../common/exceptions';
import { AddCartItemDto } from './dto';

const mockCartWithRelations = {
  id: 'cart-1',
  userId: 'user-1',
  items: [] as unknown[],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CartService', () => {
  let cartService: CartService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      productVariant: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
      cart: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        create: jest.fn(),
      },
      cartItem: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockCartIdentityService = {
      getGuestTokenFromCookie: jest.fn().mockReturnValue(undefined),
      hashToken: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CartIdentityService, useValue: mockCartIdentityService },
      ],
    }).compile();

    cartService = module.get(CartService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;

    jest.clearAllMocks();
  });

  describe('addItem', () => {
    it('throws when quantity is zero or negative', async () => {
      const dto: AddCartItemDto = { variantId: 'var-1', quantity: 0 };

      await expect(
        cartService.addItem('user-1', dto),
      ).rejects.toThrow(BadRequestException);

      await expect(
        cartService.addItem('user-1', dto),
      ).rejects.toThrow('Quantity must be at least 1');
    });

    it('throws when variant is not found', async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            cart: {
              upsert: jest.fn().mockResolvedValue(mockCartWithRelations),
              findUnique: jest.fn().mockResolvedValue(mockCartWithRelations),
            },
            cartSession: { findUnique: jest.fn().mockResolvedValue(null) },
          };
          return cb(tx);
        },
      );

      (prismaService.productVariant.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      const dto: AddCartItemDto = { variantId: 'var-nonexistent', quantity: 1 };

      await expect(
        cartService.addItem('user-1', dto),
      ).rejects.toThrow(ProductVariantNotFoundException);
    });

    it('throws when product is not active', async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            cart: {
              upsert: jest.fn().mockResolvedValue(mockCartWithRelations),
              findUnique: jest.fn().mockResolvedValue(mockCartWithRelations),
            },
            cartSession: { findUnique: jest.fn().mockResolvedValue(null) },
          };
          return cb(tx);
        },
      );

      (prismaService.productVariant.findUnique as jest.Mock).mockResolvedValue({
        id: 'var-1',
        productId: 'prod-1',
        price: 10,
        stock: 5,
        product: { id: 'prod-1', isActive: false },
        options: [],
      });

      const dto: AddCartItemDto = { variantId: 'var-1', quantity: 1 };

      await expect(
        cartService.addItem('user-1', dto),
      ).rejects.toThrow(BadRequestException);

      await expect(
        cartService.addItem('user-1', dto),
      ).rejects.toThrow('Product is not available');
    });
  });
});
