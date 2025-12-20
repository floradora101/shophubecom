import { PrismaClient, DiscountType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { mockProductsFromFrontend } from '../src/data/mock-products-from-frontend';
import { mockCategoriesFromFrontend } from '../src/data/mock-categories-from-frontend';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (optional - comment out if you want to keep data)
  // Order matters: delete child records before parent records to respect foreign key constraints
  await prisma.orderCoupon.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cartSession.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.promotionProduct.deleteMany();
  await prisma.promotionCategory.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.auditLog.deleteMany();
  // ProductVariant will be deleted via cascade when products are deleted
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  // PasswordResetToken will be cleared when users are deleted (cascade)
  await prisma.user.deleteMany();

  // Create Admin User
  const adminPassword = await bcrypt.hash('Admin123!@#', 10);
  await prisma.user.create({
    data: {
      email: 'admin@shophub.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create Test Customer
  const customerPassword = await bcrypt.hash('Customer123!@#', 10);
  await prisma.user.create({
    data: {
      email: 'customer@shophub.com',
      passwordHash: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
    },
  });

  // Create Categories from frontend mock data

  const categoryIdMap: Record<string, string> = {}; // Maps frontend ID to backend ID
  const categorySlugMap: Record<string, string> = {}; // Maps slug to backend ID

  // Helper function to calculate depth (number of parent levels)
  const getDepth = (
    categoryId: string,
    visited = new Set<string>(),
  ): number => {
    if (visited.has(categoryId)) return 0; // Prevent infinite loops
    visited.add(categoryId);

    const category = mockCategoriesFromFrontend.find(
      (c) => c.id === categoryId,
    );
    if (!category || !category.parentId) return 0;

    return 1 + getDepth(category.parentId, visited);
  };

  // Sort categories by depth (shallowest first) to ensure parents are created before children
  const sortedCategories = [...mockCategoriesFromFrontend].sort((a, b) => {
    const depthA = a.parentId ? getDepth(a.parentId) : 0;
    const depthB = b.parentId ? getDepth(b.parentId) : 0;
    return depthA - depthB;
  });

  for (const mockCategory of sortedCategories) {
    const category = await prisma.category.create({
      data: {
        name: mockCategory.name,
        slug: mockCategory.slug,
        description: mockCategory.description || null,
        parentId: mockCategory.parentId
          ? categoryIdMap[mockCategory.parentId] || null
          : null,
      },
    });

    // Map frontend ID to backend ID
    categoryIdMap[mockCategory.id] = category.id;
    // Map slug to backend ID (for product seeding)
    categorySlugMap[mockCategory.slug] = category.id;
  }

  // Create a mapping from category slugs to category IDs (for product seeding)
  const categoryMap = categorySlugMap;

  // Create Products from frontend mock data

  for (const mockProduct of mockProductsFromFrontend) {
    const categoryId = categoryMap[mockProduct.categorySlug];
    if (!categoryId) {
      continue;
    }

    // Check if variants exist
    const hasVariants = mockProduct.variants && mockProduct.variants.length > 0;

    // Convert specs array to object if needed
    let specsObj: Record<string, unknown> | undefined = undefined;
    if (mockProduct.specs) {
      if (Array.isArray(mockProduct.specs)) {
        // Convert array of {label, value} to object
        specsObj = mockProduct.specs.reduce(
          (acc, spec) => {
            acc[spec.label] = spec.value;
            return acc;
          },
          {} as Record<string, unknown>,
        );
      } else if (typeof mockProduct.specs === 'object') {
        specsObj = mockProduct.specs;
      }
    }

    // Calculate derived fields from variants (or use product price if no variants)
    let effectiveStock = 0;
    let minPrice = mockProduct.price;
    let maxPrice = mockProduct.price;

    if (hasVariants && mockProduct.variants) {
      effectiveStock = mockProduct.variants.reduce(
        (sum, v) => sum + v.stock,
        0,
      );
      const prices = mockProduct.variants.map((v) => v.price);
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);
    } else {
      // No variants - will create default variant with product stock
      effectiveStock = mockProduct.stock ?? 0;
    }

    const createdProduct = await prisma.product.create({
      data: {
        name: mockProduct.name,
        slug: mockProduct.slug,
        description: mockProduct.description,
        price: minPrice, // Starting from price = minPrice
        minPrice: minPrice,
        maxPrice: maxPrice,
        effectiveStock: effectiveStock,
        colors: mockProduct.colors || [],
        categoryId: categoryId,
        isActive: mockProduct.isActive ?? true,
        isOnSale: mockProduct.isOnSale ?? false,
        discountType: mockProduct.discountType
          ? (mockProduct.discountType as DiscountType)
          : null,
        discountValue: mockProduct.discountValue
          ? mockProduct.discountValue
          : null,
        saleStartsAt: mockProduct.saleStartsAt || null,
        saleEndsAt: mockProduct.saleEndsAt || null,
        specs: specsObj ? (specsObj as object) : undefined,
        // Always create at least one variant (SKU-first model)
        variants: {
          create:
            hasVariants && mockProduct.variants
              ? mockProduct.variants.map((variant) => ({
                  sku: variant.sku,
                  price: variant.price,
                  stock: variant.stock,
                  image: variant.image || null,
                  images: variant.images || [],
                  options: {
                    create: Object.entries(variant.options).map(
                      ([name, value]) => ({
                        name,
                        value,
                      }),
                    ),
                  },
                }))
              : [
                  {
                    // Default variant for products without variants
                    sku: `${mockProduct.slug}-default`,
                    price: mockProduct.price,
                    stock: mockProduct.stock ?? 0,
                    // Use first image from product.images if available, otherwise empty
                    image:
                      mockProduct.images && mockProduct.images.length > 0
                        ? mockProduct.images[0]
                        : null,
                    images:
                      mockProduct.images && mockProduct.images.length > 1
                        ? mockProduct.images.slice(1)
                        : [],
                  },
                ],
        },
      },
      include: {
        variants: true,
      },
    });

    // Set defaultVariantId to first variant
    const variants = createdProduct.variants as
      | Array<{ id: string }>
      | undefined;
    if (variants && variants.length > 0) {
      const firstVariant = variants[0];
      if (firstVariant) {
        await prisma.product.update({
          where: { id: createdProduct.id },
          data: { defaultVariantId: firstVariant.id },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
