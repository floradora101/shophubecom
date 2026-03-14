import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { CouponsService } from '../coupons/coupons.service';
import { PromotionsService } from '../promotions/promotions.service';
import { PlaceOrderDto, PlaceOrderResponseDto, ShippingOption } from './dto';
import { Request, Response } from 'express';
import { randomBytes, createHash } from 'crypto';
import { toNumber } from '../common/utils/decimal.util';
import { generateOrderNumber } from '../common/utils/order.util';
import { transformVariantOptions } from '../common/utils/variant.util';
import { EmailService } from '../email/email.service';

/** Default: 7 days - guests can revisit order confirmation page */
const DEFAULT_GUEST_ORDER_COOKIE_MAX_AGE_DAYS = 7;

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly couponsService: CouponsService,
    private readonly promotionsService: PromotionsService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async placeOrder(
    reqUserId: string | undefined,
    dto: PlaceOrderDto,
    req?: Request,
    res?: Response,
  ): Promise<PlaceOrderResponseDto> {
    // Resolve cart using existing cart identity logic
    // We need to access the internal method to get the cart with relations
    const cartResponse = await this.cartService.getCart(reqUserId, req, res);

    if (!cartResponse.items || cartResponse.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Guest checkout validation
    if (!reqUserId) {
      if (!dto.shippingAddress.phone) {
        throw new BadRequestException('Phone is required for guest checkout');
      }
    }

    // Compute shipping cost based on shipping option
    const shippingCost = this.calculateShipping(dto.shippingOption);

    // Generate unique order number (sequential via PostgreSQL sequence)
    const orderNumber = await generateOrderNumber(this.prisma);

    // Generate order access token for guest checkout (32+ bytes base64url)
    const orderAccessToken = this.generateOrderAccessToken();
    const accessTokenHash = this.hashToken(orderAccessToken);

    // Transaction: decrement stock, create order, clear cart
    const result = await this.prisma.$transaction(async (tx) => {
      // Load all cart items with variants for stock validation and price calculation
      const cartItems = await tx.cartItem.findMany({
        where: { cartId: cartResponse.id },
        include: {
          variant: {
            include: { options: true },
          },
          product: true,
        },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // Use cart item unit prices (what the customer saw when adding to cart) so order
      // totals match the checkout page and cart display. Avoids mismatch with variant.price
      // if prices changed after add-to-cart.
      const subtotal = cartItems.reduce((sum, cartItem) => {
        const unitPrice = toNumber(cartItem.unitPrice);
        return sum + unitPrice * cartItem.quantity;
      }, 0);

      // Build cart items for promotion calculation (same price basis as subtotal)
      const cartItemsForPromo = cartItems.map((item) => ({
        productId: item.productId,
        categoryId: item.product.categoryId,
        lineTotal: toNumber(item.unitPrice) * item.quantity,
      }));

      // Apply automatic promotions (product/category-based)
      const promotionDiscount = await this.promotionsService.getApplicableDiscount(
        tx,
        cartItemsForPromo,
      );

      // Validate and apply coupon if provided
      let couponDiscount = 0;
      let couponForOrder: {
        couponId: string;
        code: string;
        type: 'PERCENTAGE' | 'FIXED_AMOUNT';
        value: number;
        discountAmount: number;
      } | null = null;

      if (dto.couponCode && dto.couponCode.trim()) {
        const guestEmail =
          !reqUserId && dto.shippingAddress?.email
            ? dto.shippingAddress.email.trim()
            : undefined;
        // Apply coupon to amount after promotions (off total), not raw subtotal
        const amountForDiscount = Math.max(0, subtotal - promotionDiscount);
        const validation = await this.couponsService.validateForCheckoutWithTx(
          tx,
          dto.couponCode,
          subtotal,
          reqUserId,
          guestEmail,
          amountForDiscount,
        );

        if (!validation.valid || !validation.couponId || !validation.code) {
          throw new BadRequestException(
            validation.message || 'Invalid or expired coupon code',
          );
        }

        couponDiscount = validation.discount;
        couponForOrder = {
          couponId: validation.couponId,
          code: validation.code,
          type: validation.type!,
          value: validation.value ?? 0,
          discountAmount: couponDiscount,
        };
      }

      const discount = promotionDiscount + couponDiscount;
      const total = Math.max(0, subtotal + shippingCost - discount);

      // For each cart item, decrement ProductVariant.stock atomically
      // with a conditional update (stock >= qty) or throw
      for (const cartItem of cartItems) {
        if (!cartItem.variantId) {
          throw new BadRequestException(
            'Cart item missing variantId. This should not happen.',
          );
        }

        const updated = await tx.productVariant.updateMany({
          where: {
            id: cartItem.variantId,
            stock: { gte: cartItem.quantity },
          },
          data: {
            stock: { decrement: cartItem.quantity },
          },
        });

        if (updated.count === 0) {
          throw new BadRequestException(
            `Insufficient stock for variant ${cartItem.variant.sku}`,
          );
        }
      }

      // Create Order + OrderItems (attributes from variant options).
      // Use cart item unit price so order line totals match cart/checkout display.
      const orderItems = cartItems.map((cartItem) => {
        const variant = cartItem.variant;
        const product = cartItem.product;
        const attributes = transformVariantOptions(variant.options);
        const unitPrice = toNumber(cartItem.unitPrice);

        return {
          productId: cartItem.productId,
          variantId: cartItem.variantId,
          quantity: cartItem.quantity,
          unitPrice,
          total: unitPrice * cartItem.quantity,
          title: product.name,
          attributes,
        };
      });

      // Prepare order data
      const baseOrderData = {
        userId: reqUserId ?? null,
        orderNumber,
        status: 'PENDING' as const,
        paymentStatus: 'PENDING' as const,
        fulfillmentStatus: 'UNFULFILLED' as const,
        subtotal,
        tax: 0,
        shipping: shippingCost,
        discount,
        total,
        currency: 'USD',
        shippingAddress: dto.shippingAddress as unknown as Prisma.JsonObject,
        items: {
          create: orderItems,
        },
        ...(couponForOrder && {
          coupons: {
            create: {
              couponId: couponForOrder.couponId,
              code: couponForOrder.code,
              type: couponForOrder.type,
              value: couponForOrder.value,
              discount: couponForOrder.discountAmount,
            },
          },
        }),
      };

      // Add guest fields if guest checkout
      const orderData = !reqUserId
        ? {
            ...baseOrderData,
            guestPhone: dto.shippingAddress.phone,
            guestEmail: dto.shippingAddress.email
              ? dto.shippingAddress.email.trim().toLowerCase()
              : null,
            accessTokenHash,
          }
        : baseOrderData;

      const createdOrder = await tx.order.create({
        data: orderData as Prisma.OrderCreateInput,
        include: {
          items: true,
        },
      });

      // Increment coupon usedCount when applied
      if (couponForOrder) {
        await tx.coupon.update({
          where: { id: couponForOrder.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cartResponse.id },
      });

      this.logger.log(
        `Order placed: ${orderNumber} by ${reqUserId ? `user ${reqUserId}` : 'guest'}`,
      );

      return {
        order: createdOrder,
        items: orderItems,
        subtotal,
        total,
      };
    });

    // For guest orders, set httpOnly cookie with order token
    // Cookie name: order_token_<orderId>
    if (!reqUserId && res) {
      const cookieName = `order_token_${result.order.id}`;
      const isProduction =
        this.configService.get<string>('NODE_ENV') === 'production';
      const rawDays = this.configService.get<string>(
        'GUEST_ORDER_COOKIE_MAX_AGE_DAYS',
      );
      const parsed = rawDays ? parseInt(rawDays, 10) : NaN;
      const maxAgeDays =
        !isNaN(parsed) && parsed > 0 ? parsed : DEFAULT_GUEST_ORDER_COOKIE_MAX_AGE_DAYS;
      const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

      res.cookie(cookieName, orderAccessToken, {
        httpOnly: true, // Prevent XSS attacks
        secure: isProduction, // HTTPS only in production
        sameSite: 'lax', // CSRF protection
        maxAge: maxAgeMs,
        path: '/', // Available on all routes
      });
    }

    const response = new PlaceOrderResponseDto();
    response.orderId = result.order.id;
    response.orderNumber = orderNumber;
    response.total = result.total;
    response.shipping = shippingCost;
    response.subtotal = result.subtotal;
    response.items = result.order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      total: toNumber(item.total),
      title: item.title,
      attributes:
        (item.attributes as Record<string, string> | null) ?? undefined,
    }));

    // Send confirmation email to the address from the form (single source of truth)
    // For logged-in users, the form is pre-filled with their account email from the frontend
    const userEmail = dto.shippingAddress?.email?.trim() || undefined;

    if (userEmail) {
      // Re-fetch order with items, variant+options, coupons, product for email (matches order-complete invoice)
      const fullOrder = await this.prisma.order.findUnique({
        where: { id: result.order.id },
        include: {
          items: {
            include: {
              product: { include: { defaultVariant: true } },
              variant: { include: { options: true } },
            },
          },
          coupons: true,
          user: true,
        },
      });
      
      if (fullOrder) {
        this.emailService.sendOrderConfirmation(userEmail, fullOrder).catch(err => {
          this.logger.error(`Error sending confirmation email for order ${orderNumber}:`, err.stack);
        });
      }
    }

    return response;
  }

  private calculateShipping(option: ShippingOption): number {
    switch (option) {
      case ShippingOption.PICKUP:
        return 0;
      case ShippingOption.BEIRUT:
        return 0;
      case ShippingOption.OUTSIDE:
        return 5;
      default:
        return 0;
    }
  }


  /**
   * Generate a secure random token for guest order access (32+ bytes base64url)
   */
  private generateOrderAccessToken(): string {
    // Generate 32 random bytes and encode as base64url
    return randomBytes(32)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Hash a token using SHA-256
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
