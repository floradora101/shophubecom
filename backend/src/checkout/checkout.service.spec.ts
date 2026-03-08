import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CheckoutService } from './checkout.service';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { CouponsService } from '../coupons/coupons.service';
import { PromotionsService } from '../promotions/promotions.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { PlaceOrderDto, ShippingOption } from './dto';
import * as orderUtil from '../common/utils/order.util';

jest.mock('../common/utils/order.util', () => ({
  generateOrderNumber: jest.fn().mockResolvedValue('ORD-10001'),
}));

const baseShippingAddress = {
  firstName: 'John',
  lastName: 'Doe',
  phone: '+9611234567',
  email: 'john@example.com',
  country: 'Lebanon',
  city: 'Beirut',
  street1: '123 Main St',
};

describe('CheckoutService', () => {
  let checkoutService: CheckoutService;
  let cartService: jest.Mocked<CartService>;
  let prismaService: jest.Mocked<PrismaService>;
  let promotionsService: jest.Mocked<PromotionsService>;
  let couponsService: jest.Mocked<CouponsService>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const mockCartService = {
      getCart: jest.fn(),
    };

    const mockPromotionsService = {
      getApplicableDiscount: jest.fn().mockResolvedValue(0),
    };

    const mockCouponsService = {
      validateForCheckoutWithTx: jest.fn(),
    };

    const mockEmailService = {
      sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
    };

    const mockPrisma = {
      $transaction: jest.fn(),
      order: {
        findUnique: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: CartService, useValue: mockCartService },
        { provide: ProductsService, useValue: {} },
        { provide: CouponsService, useValue: mockCouponsService },
        { provide: PromotionsService, useValue: mockPromotionsService },
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'NODE_ENV' ? 'test' : undefined,
            ),
          },
        },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    checkoutService = module.get(CheckoutService);
    cartService = module.get(CartService) as jest.Mocked<CartService>;
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    promotionsService = module.get(PromotionsService) as jest.Mocked<PromotionsService>;
    couponsService = module.get(CouponsService) as jest.Mocked<CouponsService>;
    emailService = module.get(EmailService) as jest.Mocked<EmailService>;

    jest.clearAllMocks();
  });

  describe('placeOrder', () => {
    it('throws when cart is empty', async () => {
      cartService.getCart.mockResolvedValue({
        id: 'cart-1',
        items: [],
        subtotal: 0,
        totalQuantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const dto: PlaceOrderDto = {
        shippingOption: ShippingOption.BEIRUT,
        shippingAddress: baseShippingAddress,
      };

      await expect(
        checkoutService.placeOrder('user-1', dto),
      ).rejects.toThrow(BadRequestException);

      await expect(
        checkoutService.placeOrder('user-1', dto),
      ).rejects.toThrow('Cart is empty');
    });

    it('throws when guest checkout has no phone', async () => {
      cartService.getCart.mockResolvedValue({
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            cartId: 'cart-1',
            productId: 'prod-1',
            variantId: 'var-1',
            quantity: 1,
            unitPrice: 10,
          },
        ],
        subtotal: 10,
        totalQuantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const dto: PlaceOrderDto = {
        shippingOption: ShippingOption.BEIRUT,
        shippingAddress: {
          ...baseShippingAddress,
          phone: '',
        },
      };

      await expect(
        checkoutService.placeOrder(undefined, dto),
      ).rejects.toThrow(BadRequestException);

      await expect(
        checkoutService.placeOrder(undefined, dto),
      ).rejects.toThrow('Phone is required for guest checkout');
    });

    it('calls generateOrderNumber when placing order', async () => {
      cartService.getCart.mockResolvedValue({
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            cartId: 'cart-1',
            productId: 'prod-1',
            variantId: 'var-1',
            quantity: 1,
            unitPrice: 10,
          },
        ],
        subtotal: 10,
        totalQuantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockTx = {
        cartItem: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: 'ci-1',
              cartId: 'cart-1',
              productId: 'prod-1',
              variantId: 'var-1',
              quantity: 1,
              unitPrice: 10,
              product: { categoryId: 'cat-1', name: 'Product' },
              variant: { sku: 'SKU-1', options: [] },
            },
          ]),
          deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        productVariant: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        order: {
          create: jest.fn().mockResolvedValue({
            id: 'order-1',
            orderNumber: 'ORD-10001',
            items: [{ id: 'oi-1', productId: 'prod-1', variantId: 'var-1', quantity: 1, unitPrice: 10, total: 10, title: 'Product', attributes: null }],
          }),
        },
      };

      (prismaService.$transaction as jest.Mock).mockImplementation(
        (cb: (tx: unknown) => Promise<unknown>) => cb(mockTx),
      );

      const dto: PlaceOrderDto = {
        shippingOption: ShippingOption.BEIRUT,
        shippingAddress: baseShippingAddress,
      };

      const result = await checkoutService.placeOrder('user-1', dto);

      expect(orderUtil.generateOrderNumber).toHaveBeenCalledWith(prismaService);
      expect(result.orderNumber).toBe('ORD-10001');
      expect(result.total).toBe(10);
    });

    it('throws when coupon is invalid', async () => {
      cartService.getCart.mockResolvedValue({
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            cartId: 'cart-1',
            productId: 'prod-1',
            variantId: 'var-1',
            quantity: 1,
            unitPrice: 10,
          },
        ],
        subtotal: 10,
        totalQuantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      couponsService.validateForCheckoutWithTx = jest.fn().mockResolvedValue({
        valid: false,
        message: 'Coupon expired',
      });

      const mockTx = {
        cartItem: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: 'ci-1',
              cartId: 'cart-1',
              productId: 'prod-1',
              variantId: 'var-1',
              quantity: 1,
              unitPrice: 10,
              product: { categoryId: 'cat-1', name: 'Product' },
              variant: { sku: 'SKU-1', options: [] },
            },
          ]),
          deleteMany: jest.fn(),
        },
        productVariant: { updateMany: jest.fn() },
        order: { create: jest.fn() },
      };

      (prismaService.$transaction as jest.Mock).mockImplementation(
        (cb: (tx: unknown) => Promise<unknown>) => cb(mockTx),
      );

      const dto: PlaceOrderDto = {
        shippingOption: ShippingOption.BEIRUT,
        shippingAddress: baseShippingAddress,
        couponCode: 'EXPIRED',
      };

      await expect(
        checkoutService.placeOrder('user-1', dto),
      ).rejects.toThrow(BadRequestException);

      await expect(
        checkoutService.placeOrder('user-1', dto),
      ).rejects.toThrow('Coupon expired');
    });
  });
});
