import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { PlaceOrderDto, PlaceOrderResponseDto, ShippingOption } from './dto';
import { Request, Response } from 'express';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
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

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)
      .toUpperCase()}`;

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

      // Compute subtotal from DB values using ProductVariant.price (not cartResponse.subtotal)
      const subtotal = cartItems.reduce((sum, cartItem) => {
        const variantPrice = this.toNumber(cartItem.variant.price);
        return sum + variantPrice * cartItem.quantity;
      }, 0);

      const total = subtotal + shippingCost;

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

      // Create Order + OrderItems (attributes from variant options)
      // Use variant.price from DB, not cartItem.unitPrice
      const orderItems = cartItems.map((cartItem) => {
        const variant = cartItem.variant;
        const product = cartItem.product;
        const attributes =
          variant.options?.reduce<Record<string, string>>((acc, option) => {
            acc[option.name] = option.value;
            return acc;
          }, {}) ?? {};

        // Use variant.price from DB, not cartItem.unitPrice
        const unitPrice = this.toNumber(variant.price);

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
        discount: 0,
        total,
        currency: 'USD',
        shippingAddress: dto.shippingAddress as unknown as Prisma.JsonObject,
        // Fix billingAddress bug: do not set billingAddress = shippingAddress
        // Omit billingAddress (will be null in DB by default)
        items: {
          create: orderItems,
        },
      };

      // Add guest fields if guest checkout
      const orderData = !reqUserId
        ? {
            ...baseOrderData,
            guestPhone: dto.shippingAddress.phone,
            guestEmail: dto.shippingAddress.email || null,
            accessTokenHash,
          }
        : baseOrderData;

      const createdOrder = await tx.order.create({
        data: orderData as Prisma.OrderCreateInput,
        include: {
          items: true,
        },
      });

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
    // Max-Age: 900 seconds (15 minutes)
    if (!reqUserId && res) {
      const cookieName = `order_token_${result.order.id}`;
      const isProduction = process.env.NODE_ENV === 'production';

      // maxAge expects milliseconds; use 15 minutes
      res.cookie(cookieName, orderAccessToken, {
        httpOnly: true, // Prevent XSS attacks
        secure: isProduction, // HTTPS only in production
        sameSite: 'lax', // CSRF protection
        maxAge: 15 * 60 * 1000, // 15 minutes in ms
        path: '/', // Available on all routes
        // Don't set domain for localhost - let browser handle it
      });
    }

    const response = new PlaceOrderResponseDto();
    response.orderId = result.order.id;
    response.orderNumber = orderNumber;
    // Don't return token in response body for guest orders (it's in httpOnly cookie)
    response.orderAccessToken = undefined; // Never return token in response
    response.total = result.total;
    response.shipping = shippingCost;
    response.subtotal = result.subtotal;
    response.items = result.order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: this.toNumber(item.unitPrice),
      total: this.toNumber(item.total),
      title: item.title,
      attributes:
        (item.attributes as Record<string, string> | null) ?? undefined,
    }));

    return response;
  }

  private calculateShipping(option: ShippingOption): number {
    switch (option) {
      case ShippingOption.PICKUP:
        return 0;
      case ShippingOption.BEIRUT:
        return 3;
      case ShippingOption.OUTSIDE:
        return 5;
      default:
        return 0;
    }
  }

  private toNumber(value?: Prisma.Decimal | number | null): number {
    if (value === null || value === undefined) {
      return 0;
    }
    return Number(value);
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
