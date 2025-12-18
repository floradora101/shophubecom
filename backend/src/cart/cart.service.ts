import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import {
  CartItemNotFoundException,
  ProductVariantNotFoundException,
} from '../common/exceptions';
import { AddCartItemDto, CartResponseDto, UpdateCartItemDto } from './dto';
import { CartIdentityService } from './cart-identity.service';

/**
 * Transaction client type for Prisma operations within transactions.
 * Omits methods that shouldn't be used within a transaction context.
 */
type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Type for cart with all necessary relations loaded (items, products, variants, variant options).
 * Used internally before transforming to CartResponseDto.
 */
type CartWithRelations = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
        variant: { include: { options: true } };
      };
    };
  };
}>;

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly cartInclude = {
    items: {
      include: {
        product: true,
        variant: { include: { options: true } },
      },
    },
  } as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartIdentityService: CartIdentityService,
  ) {}

  async getCart(
    reqUserId?: string,
    req?: Request,
    res?: Response,
  ): Promise<CartResponseDto> {
    const cart = await this.resolveOrCreateCart(reqUserId, req, res);
    return this.toCartResponse(cart);
  }

  /**
   * Add item to cart. All products must have at least one variant (SKU-first model).
   * variantId is always required.
   */
  async addItem(
    reqUserId: string | undefined,
    dto: AddCartItemDto,
    req?: Request,
    res?: Response,
  ): Promise<CartResponseDto> {
    const { variantId, quantity } = dto;

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const cart = await this.resolveOrCreateCart(reqUserId, req, res);

    // Always load variant by id (include product + options)
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true, options: true },
    });

    if (!variant) {
      throw new ProductVariantNotFoundException();
    }

    // Validate product isActive
    if (!variant.product?.isActive) {
      throw new BadRequestException('Product is not available');
    }

    const product = variant.product;
    const finalProductId = product.id;
    const finalVariantId = variant.id;

    const updatedCart = await this.prisma.$transaction(async (tx) => {
      // Fresh read of variant inside transaction for stock and price validation
      const freshVariant = await tx.productVariant.findUnique({
        where: { id: finalVariantId },
      });

      if (!freshVariant) {
        throw new ProductVariantNotFoundException();
      }

      // Validate stock using variant.stock
      const availableStock = freshVariant.stock;

      // Find existing cart item using composite unique key
      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId_variantId: {
            cartId: cart.id,
            productId: finalProductId,
            variantId: finalVariantId,
          },
        },
      });

      // Calculate total desired quantity (new quantity + existing quantity)
      const desiredQuantity = quantity + (existingItem?.quantity ?? 0);
      if (availableStock < desiredQuantity) {
        throw new BadRequestException('Insufficient stock');
      }

      // unitPrice = variant.price
      const unitPrice = this.toNumber(freshVariant.price);

      // Upsert cart item using @@unique([cartId, productId, variantId])
      if (existingItem) {
        // Update existing item with new total quantity
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: desiredQuantity, unitPrice },
        });
      } else {
        // Create new cart item
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: finalProductId,
            variantId: finalVariantId,
            quantity,
            unitPrice,
          },
        });
      }

      const reloaded = await tx.cart.findUnique({
        where: { id: cart.id },
        include: this.cartInclude,
      });

      if (!reloaded) {
        throw new BadRequestException('Failed to reload cart after update');
      }

      return reloaded;
    });

    this.logger.log(
      `Cart updated ${reqUserId ? `for user ${reqUserId}` : 'for guest'} (product ${finalProductId}, variant ${finalVariantId}, qty ${quantity})`,
    );
    return this.toCartResponse(updatedCart);
  }

  /**
   * Update cart item quantity. Validates stock availability and updates price to current price.
   * All items now have a variantId (SKU-first model).
   */
  async updateItem(
    reqUserId: string | undefined,
    itemId: string,
    dto: UpdateCartItemDto,
    req?: Request,
    res?: Response,
  ): Promise<CartResponseDto> {
    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const cart = await this.resolveOrCreateCart(reqUserId, req, res);

    const updatedCart = await this.prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findUnique({
        where: { id: itemId },
        include: { variant: true },
      });

      if (!item || item.cartId !== cart.id) {
        throw new CartItemNotFoundException();
      }

      if (!item.variantId) {
        throw new BadRequestException(
          'Cart item missing variantId. This should not happen in SKU-first model.',
        );
      }

      // All items have variants now (SKU-first model)
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (!variant) {
        throw new ProductVariantNotFoundException();
      }

      if (variant.stock < dto.quantity) {
        throw new BadRequestException('Insufficient stock for variant');
      }

      await tx.cartItem.update({
        where: { id: item.id },
        data: {
          quantity: dto.quantity,
          unitPrice: this.toNumber(variant.price),
        },
      });

      const reloaded = await tx.cart.findUnique({
        where: { id: cart.id },
        include: this.cartInclude,
      });

      if (!reloaded) {
        throw new BadRequestException('Failed to reload cart after update');
      }

      return reloaded;
    });

    this.logger.log(
      `Cart item ${itemId} updated ${reqUserId ? `for user ${reqUserId}` : 'for guest'}`,
    );
    return this.toCartResponse(updatedCart);
  }

  async removeItem(
    reqUserId: string | undefined,
    itemId: string,
    req?: Request,
    res?: Response,
  ): Promise<CartResponseDto> {
    const cart = await this.resolveOrCreateCart(reqUserId, req, res);

    const result = await this.prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    if (result.count === 0) {
      throw new CartItemNotFoundException();
    }

    const updatedCart = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: this.cartInclude,
    });

    if (!updatedCart) {
      throw new CartItemNotFoundException();
    }

    this.logger.log(
      `Cart item ${itemId} removed ${reqUserId ? `for user ${reqUserId}` : 'for guest'}`,
    );
    return this.toCartResponse(updatedCart);
  }

  async clearCart(
    reqUserId: string | undefined,
    req?: Request,
    res?: Response,
  ): Promise<CartResponseDto> {
    const cart = await this.resolveOrCreateCart(reqUserId, req, res);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    const updatedCart = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: this.cartInclude,
    });

    if (!updatedCart) {
      return {
        id: cart.id,
        userId: cart.userId,
        items: [],
        subtotal: 0,
        totalQuantity: 0,
        createdAt: cart.createdAt,
        updatedAt: new Date(),
      };
    }

    this.logger.log(
      `Cart cleared ${reqUserId ? `for user ${reqUserId}` : 'for guest'}`,
    );
    return this.toCartResponse(updatedCart);
  }

  /**
   * Resolve or create cart for authenticated user or guest.
   * For authenticated users: creates/gets user cart and merges guest cart if it exists.
   * For guests: retrieves existing guest cart from session or creates a new one.
   * Uses Serializable isolation level to prevent race conditions during cart merging.
   */
  async resolveOrCreateCart(
    reqUserId?: string,
    req?: Request,
    res?: Response,
  ): Promise<CartWithRelations> {
    const guestToken =
      req && this.cartIdentityService.getGuestTokenFromCookie(req);

    // Authenticated user path
    if (reqUserId) {
      return this.prisma.$transaction(
        async (tx) => {
          // Ensure user cart exists (create if doesn't exist)
          const userCart = await tx.cart.upsert({
            where: { userId: reqUserId },
            update: {},
            create: { userId: reqUserId },
            include: this.cartInclude,
          });

          // If user has a guest token (e.g., added items before logging in), merge carts
          if (guestToken) {
            const tokenHash = this.cartIdentityService.hashToken(guestToken);
            const guestSession = await tx.cartSession.findUnique({
              where: { tokenHash },
              include: { cart: { include: this.cartInclude } },
            });

            if (guestSession && guestSession.expiresAt > new Date()) {
              const guestCart = guestSession.cart;

              // Only merge if guest cart has items and is different from user cart
              if (guestCart.id !== userCart.id && guestCart.items.length > 0) {
                // Merge guest cart items into user cart (with stock validation)
                await this.mergeCarts(tx, guestCart.id, userCart.id);

                // Clean up guest cart and session after successful merge
                await tx.cartSession.delete({
                  where: { id: guestSession.id },
                });
                await tx.cart.delete({
                  where: { id: guestCart.id },
                });

                if (res) {
                  this.cartIdentityService.clearGuestTokenCookie(res);
                }

                this.logger.log(
                  `Merged guest cart ${guestCart.id} into user cart ${userCart.id} for user ${reqUserId}`,
                );
              } else {
                // Guest cart is empty or same as user cart - just clean up
                await tx.cartSession.delete({
                  where: { id: guestSession.id },
                });
                if (guestCart.id !== userCart.id) {
                  await tx.cart.delete({
                    where: { id: guestCart.id },
                  });
                }
                if (res) {
                  this.cartIdentityService.clearGuestTokenCookie(res);
                }
              }
            }
          }

          // Reload cart to get merged items
          const reloaded = await tx.cart.findUnique({
            where: { id: userCart.id },
            include: this.cartInclude,
          });

          if (!reloaded) {
            throw new BadRequestException('Failed to resolve cart');
          }

          return reloaded;
        },
        {
          // Serializable isolation prevents concurrent modifications during merge
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    }

    // Guest user path - try to retrieve existing cart from session
    if (guestToken) {
      try {
        const tokenHash = this.cartIdentityService.hashToken(guestToken);
        const session = await this.prisma.cartSession.findUnique({
          where: { tokenHash },
          include: { cart: { include: this.cartInclude } },
        });

        // Return existing cart if session is still valid
        if (session && session.expiresAt > new Date()) {
          return session.cart;
        }
      } catch (error) {
        this.logger.warn('Error looking up guest session', error);
      }
    }

    // Create new guest cart and session
    const plaintextToken = this.cartIdentityService.generateGuestToken();
    const tokenHash = this.cartIdentityService.hashToken(plaintextToken);
    const expiresAt = this.cartIdentityService.getSessionExpirationDate();

    const newCart = await this.prisma.$transaction(async (tx) => {
      // Create cart with userId: null for guest
      const cart = await tx.cart.create({
        data: {
          userId: null,
        },
        include: this.cartInclude,
      });

      // Create session to track this guest cart
      await tx.cartSession.create({
        data: {
          cartId: cart.id,
          tokenHash,
          expiresAt,
        },
      });

      const reloaded = await tx.cart.findUnique({
        where: { id: cart.id },
        include: this.cartInclude,
      });

      if (!reloaded) {
        throw new BadRequestException('Failed to create guest cart');
      }

      return reloaded;
    });

    // Set cookie with plaintext token (hash is stored in DB for security)
    if (res) {
      this.cartIdentityService.setGuestTokenCookie(res, plaintextToken);
    }

    this.logger.log(`Created new guest cart ${newCart.id}`);
    return newCart;
  }

  /**
   * Merge items from source cart into target cart.
   * Handles stock validation to ensure merged quantities don't exceed available stock.
   * Properly handles products with variants and products without variants.
   * Updates prices to current prices at merge time.
   */
  private async mergeCarts(
    tx: PrismaTransactionClient,
    fromCartId: string,
    toCartId: string,
  ): Promise<void> {
    // Load source cart with all product and variant relations
    const fromCart = await tx.cart.findUnique({
      where: { id: fromCartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: true,
              },
            },
            variant: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!fromCart) {
      return;
    }

    // Load target cart items and build a map for O(1) lookup
    // Key format: "productId:variantId" (variantId is always present now)
    const targetCartItems = await tx.cartItem.findMany({
      where: { cartId: toCartId },
    });

    const targetItemMap = new Map<
      string,
      { id: string; quantity: number; variantId: string }
    >();

    for (const targetItem of targetCartItems) {
      if (!targetItem.variantId) {
        // Skip items without variantId (invalid state in SKU-first model)
        continue;
      }
      const key = `${targetItem.productId}:${targetItem.variantId}`;
      targetItemMap.set(key, {
        id: targetItem.id,
        quantity: targetItem.quantity,
        variantId: targetItem.variantId,
      });
    }

    // Process each item from source cart
    for (const item of fromCart.items) {
      const product = item.product;
      // Skip inactive products
      if (!product || !product.isActive) {
        continue;
      }

      // Skip items without variantId (invalid state in SKU-first model)
      if (!item.variantId || !item.variant) {
        continue;
      }

      const finalVariantId = item.variantId;
      const mapKey = `${item.productId}:${finalVariantId}`;

      // Fresh read of variant inside transaction for stock and price validation
      const freshVariant = await tx.productVariant.findUnique({
        where: { id: finalVariantId },
      });

      if (!freshVariant) {
        // Variant no longer exists - skip this item
        continue;
      }

      // All items have variants now (SKU-first model) - use fresh read
      const availableStock = freshVariant.stock;
      const currentPrice = freshVariant.price;

      // Get existing quantity in target cart to calculate how much we can add
      const existingTargetItem = targetItemMap.get(mapKey);
      const existingQtyInTarget = existingTargetItem?.quantity ?? 0;

      // Calculate how much can be added without exceeding stock
      // remaining = available stock - what's already in target cart
      // toAdd = min(what we want to add, max(0, remaining))
      const remaining = availableStock - existingQtyInTarget;
      const toAdd = Math.min(item.quantity, Math.max(0, remaining));

      // Skip if nothing can be added (stock exhausted)
      if (toAdd === 0) {
        continue;
      }

      const unitPrice = this.toNumber(currentPrice);

      // All items have variants - use upsert with composite unique key
      await tx.cartItem.upsert({
        where: {
          cartId_productId_variantId: {
            cartId: toCartId,
            productId: item.productId,
            variantId: finalVariantId,
          },
        },
        create: {
          cartId: toCartId,
          productId: item.productId,
          variantId: finalVariantId,
          quantity: toAdd,
          unitPrice,
        },
        update: {
          quantity: { increment: toAdd },
          unitPrice,
        },
      });

      // Update map to reflect new quantity for subsequent iterations
      const newQuantity = (existingTargetItem?.quantity ?? 0) + toAdd;
      targetItemMap.set(mapKey, {
        id: existingTargetItem?.id ?? '',
        quantity: newQuantity,
        variantId: finalVariantId,
      });
    }

    // Clean up: delete all items from source cart (cart itself deleted by caller)
    await tx.cartItem.deleteMany({
      where: { cartId: fromCartId },
    });
  }

  /**
   * Transform Prisma cart model to CartResponseDto.
   * Calculates subtotal and total quantity, and maps variant options to key-value pairs.
   */
  private toCartResponse(cart: CartWithRelations): CartResponseDto {
    // Calculate cart subtotal: sum of (unitPrice * quantity) for all items
    const subtotal = cart.items.reduce(
      (sum, item) => sum + this.toNumber(item.unitPrice) * item.quantity,
      0,
    );
    // Calculate total quantity: sum of all item quantities
    const totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item) => ({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: this.toNumber(item.unitPrice),
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              price: this.toNumber(item.product.price),
              currency: item.product.currency,
            }
          : undefined,
        variant: item.variant
          ? {
              id: item.variant.id,
              sku: item.variant.sku,
              price: this.toNumber(item.variant.price),
              stock: item.variant.stock,
              image: item.variant.image,
              images: item.variant.images ?? [],
              // Transform variant options array to object: [{name: "Color", value: "Red"}] -> {Color: "Red"}
              options:
                item.variant.options?.reduce<Record<string, string>>(
                  (acc, option) => {
                    acc[option.name] = option.value;
                    return acc;
                  },
                  {},
                ) ?? undefined,
            }
          : undefined,
      })),
      subtotal,
      totalQuantity,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  private toNumber(value?: Prisma.Decimal | number | null): number {
    if (value === null || value === undefined) {
      return 0;
    }
    return Number(value);
  }
}
