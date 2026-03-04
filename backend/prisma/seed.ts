import { PrismaClient, DiscountType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Type definitions for mock data
interface MockCategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  parentId?: string | null;
}

interface MockProductVariant {
  sku: string;
  price: number;
  stock?: number;
  image?: string | null;
  images?: string[];
  options?: Record<string, unknown>;
}

interface MockProduct {
  id?: string;
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  stock?: number;
  images?: string[];
  image?: string | null;
  categorySlug?: string;
  isActive?: boolean;
  isOnSale?: boolean;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  saleStartsAt?: Date | string | null;
  saleEndsAt?: Date | string | null;
  specs?: Array<{ label: string; value: string }> | Record<string, unknown>;
  variants?: MockProductVariant[];
  rating?: number;
  reviewCount?: number;
}

interface MockCoupon {
  id: string;
  code: string;
  description?: string | null;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderTotal?: number | null;
  startsAt?: Date | string | null;
  expiresAt?: Date | string | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  usedCount?: number;
  isActive?: boolean;
}

interface MockPromotion {
  id: string;
  name: string;
  description?: string | null;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  startsAt?: Date | string | null;
  expiresAt?: Date | string | null;
  isActive?: boolean;
  productIds?: string[];
  categoryIds?: string[];
}

const prisma = new PrismaClient();

// Delete from a table; no-op if the table doesn't exist (e.g. schema has model but no migration yet)
async function deleteManySafe<T>(name: string, fn: () => Promise<T>): Promise<T | void> {
  try {
    return await fn();
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2021') return; // table does not exist
    throw e;
  }
}

// Load mock data from backend-local file (no frontend path aliases needed)
function loadMockData() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mockData = require('./mock-data');
  return {
    mockProducts: (mockData.mockProducts || []) as MockProduct[],
    mockCategories: (mockData.mockCategories || []) as MockCategory[],
    mockCoupons: (mockData.mockCoupons || []) as MockCoupon[],
    mockPromotions: (mockData.mockPromotions || []) as MockPromotion[],
  };
}

async function main() {
  // Load mock data
  console.log('📦 Loading mock data...');
  const { mockProducts, mockCategories, mockCoupons, mockPromotions } =
    loadMockData();
  console.log(`✅ Loaded ${mockProducts.length} products, ${mockCategories.length} categories, ${mockCoupons.length} coupons, ${mockPromotions.length} promotions`);
  console.log('🌱 Starting database seed...');

  // Clear existing data (reset database)
  // Order matters: delete child records before parent records to respect foreign key constraints
  console.log('🗑️  Clearing existing data...');
  await deleteManySafe('DepartmentHighlightedSubcategory', () => prisma.departmentHighlightedSubcategory.deleteMany());
  await deleteManySafe('Department', () => prisma.department.deleteMany());
  await deleteManySafe('OrderCoupon', () => prisma.orderCoupon.deleteMany());
  await deleteManySafe('OrderItem', () => prisma.orderItem.deleteMany());
  await deleteManySafe('Order', () => prisma.order.deleteMany());
  await deleteManySafe('CartItem', () => prisma.cartItem.deleteMany());
  await deleteManySafe('CartSession', () => prisma.cartSession.deleteMany());
  await deleteManySafe('Cart', () => prisma.cart.deleteMany());
  await deleteManySafe('PromotionProduct', () => prisma.promotionProduct.deleteMany());
  await deleteManySafe('PromotionCategory', () => prisma.promotionCategory.deleteMany());
  await deleteManySafe('Promotion', () => prisma.promotion.deleteMany());
  await deleteManySafe('Coupon', () => prisma.coupon.deleteMany());
  await deleteManySafe('ProductReview', () => prisma.productReview.deleteMany());
  await deleteManySafe('VariantOption', () => prisma.variantOption.deleteMany());
  // ProductVariant will be deleted via cascade when products are deleted
  await deleteManySafe('Product', () => prisma.product.deleteMany());
  await deleteManySafe('Category', () => prisma.category.deleteMany());
  await deleteManySafe('Address', () => prisma.address.deleteMany());
  await deleteManySafe('AuditLog', () => prisma.auditLog.deleteMany());
  // PasswordResetToken will be cleared when users are deleted (cascade)
  await deleteManySafe('User', () => prisma.user.deleteMany());
  console.log('✅ Existing data cleared');

  // Create Admin User
  console.log('👤 Creating admin user...');
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
  console.log('✅ Admin user created: admin@shophub.com / Admin123!@#');

  // Create Test Customer
  console.log('👤 Creating test customer...');
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
  console.log('✅ Test customer created: customer@shophub.com / Customer123!@#');

  // Create Categories from frontend mock data
  console.log('📁 Creating categories...');
  const categoryIdMap: Record<string, string> = {}; // Maps frontend ID to backend ID
  const categorySlugMap: Record<string, string> = {}; // Maps slug to backend ID

  // Helper function to calculate depth (number of parent levels)
  const getDepth = (
    categoryId: string,
    visited = new Set<string>(),
  ): number => {
    if (visited.has(categoryId)) return 0; // Prevent infinite loops
    visited.add(categoryId);

    const category = mockCategories.find((c: MockCategory) => c.id === categoryId);
    if (!category || !category.parentId) return 0;

    return 1 + getDepth(category.parentId, visited);
  };

  // Sort categories by depth (shallowest first) to ensure parents are created before children
  const sortedCategories = [...mockCategories].sort((a, b) => {
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
        image: mockCategory.image || null,
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
  console.log(`✅ Created ${sortedCategories.length} categories`);

  // Create Department Spotlights (Admin "Subcategories" section)
  console.log('🧩 Creating department spotlights...');
  const mockDepartments = [
    {
      name: 'Laptops Series',
      parentCategoryId: 'laptops',
      highlightedSubCategoryIds: ['macbook', 'gaming-laptops', 'business-laptops'],
      isActive: true,
    },
    {
      name: 'Mobile Hub',
      parentCategoryId: 'phones',
      highlightedSubCategoryIds: ['iphone', 'samsung-phones'],
      isActive: true,
    },
  ];

  let departmentsCreated = 0;
  for (const dept of mockDepartments) {
    const parentId = categoryIdMap[dept.parentCategoryId];
    if (!parentId) {
      console.warn(
        `⚠️  Skipping department "${dept.name}" - parent category "${dept.parentCategoryId}" not found`,
      );
      continue;
    }

    const highlightedIds = dept.highlightedSubCategoryIds
      .map((id) => categoryIdMap[id])
      .filter(Boolean) as string[];

    const created = await prisma.department.create({
      data: {
        name: dept.name,
        isActive: dept.isActive,
        parentCategoryId: parentId,
        highlightedSubcategories: {
          create: highlightedIds.map((categoryId, idx) => ({
            categoryId,
            sortOrder: idx,
          })),
        },
      },
    });

    departmentsCreated++;
    console.log(`  ✅ Department created: ${created.name}`);
  }
  console.log(`✅ Created ${departmentsCreated} department spotlights`);

  // Create Products from frontend mock data
  console.log('📦 Creating products...');
  const categoryMap = categorySlugMap;
  let productsCreated = 0;

  // Map missing categories to existing ones
  const categoryAliasMap: Record<string, string> = {
    'google-pixel': 'other-phones',
    'other-brands': 'other-phones',
    'other-brands-tablets': 'other-tablets',
  };

  for (let i = 0; i < mockProducts.length; i++) {
    const mockProduct = mockProducts[i];
    let categorySlug = mockProduct.categorySlug || '';
    // Try alias map if category not found
    if (!categoryMap[categorySlug] && categoryAliasMap[categorySlug]) {
      categorySlug = categoryAliasMap[categorySlug];
    }

    const categoryId = categoryMap[categorySlug];
    if (!categoryId) {
      console.warn(
        `⚠️  Skipping product "${mockProduct.name}" - category "${mockProduct.categorySlug}" not found`,
      );
      continue;
    }

    // Check if variants exist
    const hasVariants =
      mockProduct.variants && mockProduct.variants.length > 0;

    // Convert specs array to object if needed
    let specsObj: Record<string, unknown> | undefined = undefined;
    if (mockProduct.specs) {
      if (Array.isArray(mockProduct.specs)) {
        // Convert array of {label, value} to object
        specsObj = mockProduct.specs.reduce(
          (acc: Record<string, unknown>, spec: { label: string; value: string }) => {
            acc[spec.label] = spec.value;
            return acc;
          },
          {} as Record<string, unknown>,
        );
      } else if (typeof mockProduct.specs === 'object') {
        specsObj = mockProduct.specs;
      }
    }

    // Generate slug if not provided, ensure uniqueness
    let productSlug =
      mockProduct.slug ||
      mockProduct.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    // Ensure slug is unique by appending a counter if needed
    let uniqueSlug = productSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${productSlug}-${counter}`;
      counter++;
    }
    productSlug = uniqueSlug;

    // Create product with variants
    const createdProduct = await prisma.product.create({
      data: {
        name: mockProduct.name,
        slug: productSlug,
        description: mockProduct.description || null,
        currency: 'USD',
        isActive: mockProduct.isActive !== false,
        isFeatured: i < 6, // First 6 products featured for homepage sections
        isOnSale: mockProduct.isOnSale || false,
        discountType: mockProduct.discountType
          ? (mockProduct.discountType as DiscountType)
          : null,
        discountValue: mockProduct.discountValue
          ? mockProduct.discountValue
          : null,
        saleStartsAt: mockProduct.saleStartsAt || null,
        saleEndsAt: mockProduct.saleEndsAt || null,
        specs: specsObj ? (specsObj as object) : undefined,
        averageRating: mockProduct.rating
          ? mockProduct.rating
          : null,
        reviewCount: mockProduct.reviewCount || 0,
        categoryId: categoryId,
        // Always create at least one variant (SKU-first model)
        variants: {
          create:
            hasVariants && mockProduct.variants
              ? mockProduct.variants.map((variant: MockProductVariant) => ({
                  sku: variant.sku,
                  price: variant.price,
                  stock: variant.stock || 0,
                  image: variant.image || null,
                  images: variant.images || [],
                  options: {
                    create: variant.options
                      ? Object.entries(variant.options).map(
                          ([name, value]) => ({
                            name,
                            value: String(value),
                          }),
                        )
                      : [],
                  },
                }))
              : [
                  {
                    // Default variant for products without variants
                    sku: `${productSlug}-default`,
                    price: mockProduct.price,
                    stock: mockProduct.stock || 0,
                    // Use first image from product.images if available
                    image:
                      mockProduct.images && mockProduct.images.length > 0
                        ? mockProduct.images[0]
                        : mockProduct.image || null,
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
    if (createdProduct.variants && createdProduct.variants.length > 0) {
      const firstVariant = createdProduct.variants[0];
      if (firstVariant) {
        await prisma.product.update({
          where: { id: createdProduct.id },
          data: { defaultVariantId: firstVariant.id },
        });
      }
    }

    productsCreated++;
  }
  console.log(`✅ Created ${productsCreated} products`);

  // Create Coupons from frontend mock data
  console.log('🎫 Creating coupons...');
  let couponsCreated = 0;
  for (const mockCoupon of mockCoupons) {
    await prisma.coupon.create({
      data: {
        code: mockCoupon.code,
        description: mockCoupon.description || null,
        type: mockCoupon.type as DiscountType,
        value: mockCoupon.value,
        minOrderTotal: mockCoupon.minOrderTotal || null,
        startsAt: mockCoupon.startsAt
          ? new Date(mockCoupon.startsAt)
          : null,
        expiresAt: mockCoupon.expiresAt
          ? new Date(mockCoupon.expiresAt)
          : null,
        usageLimit: mockCoupon.usageLimit || null,
        perUserLimit: mockCoupon.perUserLimit || null,
        usedCount: mockCoupon.usedCount || 0,
        isActive: mockCoupon.isActive !== false,
      },
    });
    couponsCreated++;
  }
  console.log(`✅ Created ${couponsCreated} coupons`);

  // Create Promotions from frontend mock data
  console.log('🎉 Creating promotions...');
  let promotionsCreated = 0;
  for (const mockPromo of mockPromotions) {
    const createdPromo = await prisma.promotion.create({
      data: {
        name: mockPromo.name,
        description: mockPromo.description || null,
        type: mockPromo.type as DiscountType,
        value: mockPromo.value,
        startsAt: mockPromo.startsAt
          ? new Date(mockPromo.startsAt)
          : null,
        expiresAt: mockPromo.expiresAt
          ? new Date(mockPromo.expiresAt)
          : null,
        isActive: mockPromo.isActive !== false,
        promotionProducts: mockPromo.productIds
          ? {
              create: mockPromo.productIds.map((productId: string) => ({
                product: {
                  connect: {
                    slug: productId, // Assuming productIds are slugs
                  },
                },
              })),
            }
          : undefined,
        promotionCategories: mockPromo.categoryIds
          ? {
              create: mockPromo.categoryIds.map((categorySlug: string) => ({
                category: {
                  connect: {
                    slug: categorySlug,
                  },
                },
                applyToDescendants: true,
              })),
            }
          : undefined,
      },
    });
    promotionsCreated++;
  }
  console.log(`✅ Created ${promotionsCreated} promotions`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
