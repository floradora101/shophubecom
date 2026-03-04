
# ShopHub — Deep Code Inspection Report

> **Performed by:** Senior Developer & Design Architect Review
> **Date:** March 4, 2026
> **Scope:** Full-stack — Backend, Frontend, Integration, Security, Performance, Architecture

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [CRITICAL Issues — Fix Immediately](#3-critical-issues--fix-immediately)
4. [HIGH Severity Issues](#4-high-severity-issues)
5. [MEDIUM Severity Issues](#5-medium-severity-issues)
6. [MINOR / LOW Issues](#6-minor--low-issues)
7. [Frontend-Specific Findings](#7-frontend-specific-findings)
8. [Backend-Specific Findings](#8-backend-specific-findings)
9. [Integration & Data Flow Issues](#9-integration--data-flow-issues)
10. [Security Audit](#10-security-audit)
11. [Performance Audit](#11-performance-audit)
12. [Accessibility Issues](#12-accessibility-issues)
13. [Deployment & DevOps](#13-deployment--devops)
14. [What's Done Right (Positive Findings)](#14-whats-done-right)
15. [Remediation Priority Matrix](#15-remediation-priority-matrix)

---

## 1. Executive Summary

ShopHub is a well-structured e-commerce application built with NestJS (backend) and Next.js (frontend). The overall architecture is sound — proper separation of concerns, server-owned cart, httpOnly JWT cookies, Prisma ORM with transactions — but the codebase contains **several critical bugs, security vulnerabilities, and performance anti-patterns** that need immediate attention.

### At a Glance

| Severity | Count | Examples |
|----------|-------|---------|
| **CRITICAL** | 8 | Variable shadowing bug, bcrypt DoS, checkout TDZ crash, missing module import |
| **HIGH** | 10 | N+1 query storms, enableImplicitConversion, memory leaks, mock data in prod |
| **MEDIUM** | 14 | Missing validation, stale coupons, duplicate logic, type mismatches |
| **LOW/MINOR** | 18 | Code style, dead code, naming inconsistencies, accessibility gaps |

**Top 3 most impactful problems:**
1. The `promoProductIds` variable shadowing silently breaks promotion filtering
2. N+1 queries in categories/products will bring the app down at scale
3. No `@MaxLength` on password fields enables bcrypt CPU denial-of-service

---

## 2. Architecture Overview

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, Prisma 6, PostgreSQL 15, JWT (httpOnly cookies), Nodemailer |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, TanStack React Query v5 |
| Forms | React Hook Form + Yup |
| UI Library | Radix UI primitives |
| File Uploads | UploadThing |
| Deployment | Docker multi-stage builds, docker-compose (PostgreSQL only) |

### Module Structure (Backend — 14 modules)

```
AppModule
├── AuthModule (JWT, refresh tokens, password reset)
├── UsersModule
├── ProductsModule (variants, derived fields, mapper, variant service)
├── CategoriesModule (tree structure, slugs)
├── OrdersModule
├── CartModule (guest sessions, merge on login, cron cleanup)
├── CheckoutModule (stock decrement, coupon application)
├── CouponsModule (validation, per-user limits)
├── PromotionsModule (product/category promotions, hero slide links)
├── HeroSlidesModule
├── AnnouncementsModule
├── DepartmentsModule
├── EmailModule (order confirmation, password reset)
└── AdminModule (stats, low-stock, top products)
```

### Frontend Structure

```
frontend/
├── app/
│   ├── (auth)/          — Login, Register
│   ├── (shop)/          — Products, Cart, Checkout, Profile, Search
│   ├── admin/           — Full admin panel (CRUD for all entities)
│   └── api/uploadthing/ — File upload route
├── features/            — Domain-specific logic (auth, cart, products, etc.)
├── components/          — Reusable UI (Header, Footer, Layout)
├── lib/                 — API client, types, utils
└── store/               — Zustand stores (auth, cart UI, favorites, sidebar)
```

### State Management Pattern

- **Server state:** React Query (products, categories, orders, etc.)
- **Client UI state:** Zustand (cart drawer, auth, favorites, sidebar)
- **URL state:** Search params for product filters (good pattern)
- **Form state:** React Hook Form

---

## 3. CRITICAL Issues — Fix Immediately

### CRIT-1: Variable Shadowing Bug — Promotion Filtering Broken for Price Sort

**File:** `backend/src/products/products.service.ts`

The outer `let promoProductIds: string[] = []` (line ~154) is **shadowed** by a `const promoProductIds` inside the `if (promotionId)` block (line ~236). Later, the outer (still-empty) variable is used for the raw SQL price sort path (line ~312).

**Impact:** When `promotionId` is set AND `sortBy === 'price'`, the product-level promotion filter is **silently ignored**, returning wrong results. Users see products that shouldn't be in the promotion.

**Fix:** Rename the inner `const` or remove the outer `let` and ensure the same scoped variable is used throughout.

---

### CRIT-2: `isEmpty` Used Before Declaration — Checkout Page Crash

**File:** `frontend/app/(shop)/checkout/page.tsx`

```
Line ~91:  enabled: !isEmpty,     // isEmpty is NOT YET DECLARED
Line ~115: const isEmpty = ...;   // Declared here
```

`isEmpty` is referenced at line 91 in the `useFormDraft` hook call, but it's declared at line 115. Due to the temporal dead zone with `const`, this will either cause a `ReferenceError` at runtime or silently evaluate to `undefined` (making `!isEmpty` always `true`).

**Fix:** Move the `isEmpty` declaration before `useFormDraft`, or restructure the hook dependency.

---

### CRIT-3: No Maximum Length on Password Fields — Bcrypt DoS

**Files:** `backend/src/auth/dto/register.dto.ts`, `backend/src/auth/dto/reset-password.dto.ts`

```typescript
@MinLength(8)
@IsStrongPassword(/* ... */)
password!: string;
// NO @MaxLength — attacker can send 1MB+ password
```

Bcrypt internally truncates at 72 bytes but still processes the full input before truncation. An attacker sending 1MB passwords can exhaust server CPU. Even with rate limiting (5 req/min for login), 5 bcrypt hashes of 1MB strings cause significant CPU starvation.

**Fix:** Add `@MaxLength(128)` to all password fields.

---

### CRIT-4: CheckoutModule Missing EmailModule Import

**File:** `backend/src/checkout/checkout.module.ts`

```typescript
@Module({
  imports: [PrismaModule, CartModule, ProductsModule, CouponsModule, PromotionsModule],
  // EmailModule NOT imported!
})
```

`CheckoutService` injects `EmailService`, but `CheckoutModule` doesn't import `EmailModule`. This only works if `EmailModule` is globally registered. If it isn't, the app crashes at runtime with "unresolvable dependency."

**Fix:** Add `EmailModule` to the imports array.

---

### CRIT-5: Health Endpoint Returns HTTP 200 When Database Is Down

**File:** `backend/src/app.service.ts`

```typescript
async getHealth() {
  try {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  } catch {
    return { status: 'degraded', database: 'disconnected' }; // Still returns 200!
  }
}
```

Load balancers, Kubernetes probes, and monitoring systems will consider the service healthy when the database is unreachable.

**Fix:** Throw an `HttpException(503)` or use `@HttpCode` conditionally to return 503 on degraded state.

---

### CRIT-6: Frontend Packages Installed in Backend

**File:** `backend/package.json`

```json
"@hookform/resolvers": "^5.2.2",
"next-cloudinary": "^6.17.5",
"react-hook-form": "^7.68.0",
"yup": "^1.7.1",
"zustand": "^5.0.9"
```

Five frontend libraries are in the backend's `dependencies`. This bloats the Docker image by ~50MB+, increases supply-chain attack surface, and makes `npm audit` noisy.

**Fix:** Remove all frontend packages from `backend/package.json`.

---

### CRIT-7: No Rate Limiting on Password Reset Endpoint

**File:** `backend/src/auth/auth.controller.ts`

`POST /api/auth/reset-password` has no `@Throttle` decorator, inheriting only the global 100 req/60s limit. An attacker who intercepts a reset token can brute-force it rapidly.

**Fix:** Add `@Throttle({ default: { limit: 5, ttl: 60000 } })` to the reset-password endpoint.

---

### CRIT-8: JWT Secret Validation Not Strict Enough

**File:** `backend/src/config/env.validation.ts`

```typescript
@IsString()
JWT_ACCESS_SECRET!: string;  // Could be "abc" — no min length!
```

A developer could set trivial JWT secrets in production without any validation warning.

**Fix:** Add `@MinLength(32)` to both `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

---

## 4. HIGH Severity Issues

### HIGH-1: N+1 Query Storm in CategoriesService.findAll

**File:** `backend/src/categories/categories.service.ts`

For each category in a paginated list, a separate `product.count()` query fires. For 20 categories per page, that's **20+ database queries** for one API call.

```typescript
categories.map(async (category) => {
  const descendantIds = getDescendantIds(category.id);
  const totalProductCount = await this.prisma.product.count({
    where: { categoryId: { in: descendantIds } },
  });
});
```

**Fix:** Use a single `groupBy` query or raw SQL with `COUNT(*)` grouped by category to get all counts at once.

---

### HIGH-2: N+1 Query Storm in CategoriesService.findTree

**File:** `backend/src/categories/categories.service.ts`

`findTree` calls `getTotalProductCount` for **every category in the entire database**. Each call internally calls `getDescendantCategoryIds`, which fetches ALL categories again. For N categories: O(N) count queries + O(N) "fetch all categories" queries.

**Fix:** Fetch all product counts in one `groupBy` query, build the tree in memory.

---

### HIGH-3: AdminService Loads ALL Products Into Memory

**File:** `backend/src/admin/admin.service.ts`

```typescript
const products = await this.prisma.product.findMany({
  where: { isActive: true },
  include: { variants: { select: { stock: true } } },
});
return products.filter(p => {
  const stock = p.variants.reduce((sum, v) => sum + v.stock, 0);
  return stock <= threshold;
}).length;
```

With 10,000 products, this loads hundreds of MB into Node.js memory just to count low-stock items.

**Fix:** Use raw SQL: `SELECT COUNT(*) ... GROUP BY "productId" HAVING SUM(stock) <= $threshold`.

---

### HIGH-4: `enableImplicitConversion: true` in Global Validation Pipe

**File:** `backend/src/main.ts`

```typescript
app.useGlobalPipes(new ValidationPipe({
  transformOptions: { enableImplicitConversion: true }, // DANGEROUS
}));
```

This causes class-transformer to perform type coercion automatically, which can bypass validation decorators. Known NestJS security anti-pattern.

**Fix:** Remove `enableImplicitConversion: true` and use explicit `@Type(() => Number)` decorators where needed.

---

### HIGH-5: Mock Data Imported Unconditionally in Production Frontend

**Files:** `frontend/app/(shop)/products/hooks/useFilterHelpers.ts`, `useCategoryTree.ts`, `useProductDetail.ts`

```typescript
import { mockProducts, mockProductToProduct } from "@/lib/mock-data/mock-data";
```

Even though code guards execution with `USE_MOCKS`, the static imports include all mock data in the production bundle. This adds unnecessary KB to the bundle.

**Fix:** Use dynamic `import()` behind the flag check, or exclude mock data from production builds entirely.

---

### HIGH-6: `useFilterHelpers` Always Uses Mock Data for Brands

**File:** `frontend/app/(shop)/products/hooks/useFilterHelpers.ts`

```typescript
const availableBrands = useMemo(() => {
  if (!hasInteracted) return [];
  const brandSet = new Set<string>();
  mockProducts.forEach((product: any) => { // Always reads mock data!
    const normalized = mockProductToProduct(product);
    if (normalized.brand) brandSet.add(normalized.brand);
  });
  return Array.from(brandSet).sort();
}, [hasInteracted]);
```

Brand suggestions always come from mock data instead of the actual backend, regardless of the `USE_MOCKS` flag.

**Fix:** Fetch brands from the API when `USE_MOCKS` is false, or derive them from the current product query results.

---

### HIGH-7: `getDescendantCategoryIds` Fetches ALL Categories On Every Call

**File:** `backend/src/categories/categories.service.ts`

Called from `ProductsService.findAll` (category filtering), `getCategoryPromotionsForCategories`, and nearly every product listing. The entire categories table is fetched on every product query.

**Fix:** Cache the category tree in-memory with a short TTL (categories change rarely). Invalidate on create/update/delete.

---

### HIGH-8: In-Memory User Cache Never Fully Purged (Memory Leak)

**File:** `backend/src/auth/strategies/jwt.strategy.ts`

```typescript
if (this.userCache.size > 1000) {
  this.cleanExpiredCacheEntries();
}
```

Cache only cleans when > 1000 entries. Active users whose entries are refreshed before expiry never expire. The cache grows unbounded.

**Fix:** Use a bounded LRU cache (e.g., `lru-cache` package) with max size, or run periodic cleanup with `setInterval`.

---

### HIGH-9: Refresh Token Uses Bcrypt (Performance Concern)

**File:** `backend/src/auth/auth.service.ts`

Each token refresh requires one `bcrypt.compare()` + one `bcrypt.hash()`. Both are CPU-intensive. For 30 refreshes/minute (rate limit), this creates significant CPU load.

**Fix:** Use SHA-256 for refresh tokens instead of bcrypt. Refresh tokens are high-entropy random values that don't benefit from bcrypt's slow hashing.

---

### HIGH-10: Unvalidated Image URL Fields

**Files:** `backend/src/products/dto/create-product.dto.ts`, `update-product.dto.ts`

```typescript
@IsOptional()
@IsString()
image?: string;  // No @IsUrl(), no @MaxLength()
```

Arbitrary strings including `javascript:` URIs or multi-MB strings pass validation.

**Fix:** Add `@IsUrl()` and `@MaxLength(2048)` to all image/URL fields. Add `@ArrayMaxSize(20)` to image arrays.

---

## 5. MEDIUM Severity Issues

### MED-1: Promotion `applyToDescendants` Ignored at Checkout

**File:** `backend/src/promotions/promotions.service.ts`

`getApplicableDiscount` only checks direct category membership, ignoring the `applyToDescendants` flag. Products in child categories don't receive the discount at checkout, even though the product listing page shows them as discounted. This creates a price discrepancy between browsing and checkout.

---

### MED-2: Product Discount Percentage Not Capped at 100

**File:** `backend/src/products/dto/create-product.dto.ts`

```typescript
@IsNumber()
@IsPositive()
@IsOptional()
discountValue?: number | null;  // Can be 500% when type is PERCENTAGE
```

Unlike `CouponsService` and `PromotionsService` (which validate `value > 100`), product-level percentage discounts have no cap.

---

### MED-3: Category Deletion Doesn't Check for Children

**File:** `backend/src/categories/categories.service.ts`

Only checks for direct products before deleting. If a category has child categories, the deletion either fails with a cryptic FK constraint error or orphans subcategories.

---

### MED-4: Checkout Uses Raw `apiClient` Instead of Standardized Wrappers

**File:** `frontend/app/(shop)/checkout/hooks/useCheckoutOrder.ts`

```typescript
const response = await apiClient.post("/checkout/place-order", { ... });
const orderData = response.data?.data || response.data; // Fragile fallback
```

The most critical API call in the app bypasses the type-safe `apiPost` wrapper, using fragile manual response extraction.

---

### MED-5: `useCheckoutCoupon` Doesn't Re-validate on Subtotal Change

When users change quantities or remove items after applying a coupon, the `couponDiscount` stays stale. The coupon may no longer meet `minOrderTotal` requirements but the discount persists.

---

### MED-6: Checkout Form Has No Validation Schema

**File:** `frontend/app/(shop)/checkout/page.tsx`

```typescript
const form = useForm<CheckoutFormData>({
  defaultValues: { firstName: "", ... },
  // NO resolver! No Yup/Zod schema!
});
```

The most critical form in the app relies solely on HTML `required` attributes. No email format validation, no phone format validation, no proper error messages.

---

### MED-7: Dummy Bcrypt Hash Is Invalid

**File:** `backend/src/auth/auth.service.ts`

```typescript
const dummyHash = '$2b$10$dummyhashvalueforsecuritytimingattackprevention';
```

Not a valid bcrypt hash. `bcrypt.compare` with an invalid hash returns immediately, partially defeating the timing-attack mitigation.

**Fix:** Pre-compute a real bcrypt hash at startup: `this.DUMMY_HASH = await hash('dummy', 10);`

---

### MED-8: Guest Coupon Per-User Limit Bypass

**File:** `backend/src/coupons/coupons.service.ts`

Guest usage is tracked by `guestEmail`. Guests can bypass `perUserLimit` by using different email addresses or no email at all (email is optional for guests). When no email is provided, the per-user check is skipped entirely.

---

### MED-9: Password Reset Tokens Never Cleaned Up

**File:** `backend/src/auth/auth.service.ts`

Used and expired `PasswordResetToken` records are never deleted. The table grows unboundedly over time.

**Fix:** Add a daily cron job to delete used/expired tokens.

---

### MED-10: Cart Page Duplicates Subtotal Calculation

**File:** `frontend/app/(shop)/cart/page.tsx`

```typescript
const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
```

The server already provides `subtotal` in the cart response, and `useCart()` exposes it. The cart page ignores the server value and recomputes it client-side. Floating-point differences between backend `Decimal` math and JavaScript `number` math could cause the displayed subtotal to differ from the checkout subtotal.

---

### MED-11: `useCheckoutAddress` Missing `state` in Reset

**File:** `frontend/app/(shop)/checkout/hooks/useCheckoutAddress.ts`

The `handleUseForm` function resets all address fields except `state`. When switching from a saved address to "new address," the state field retains its previous value.

---

### MED-12: Pagination Response Type Mismatch

**File:** `frontend/lib/types/shared.ts`

`ProductsResponse` type uses `meta: { total, page, ... }` but the backend returns `{ data: [...], total, page, ... }` at the same level. The type is misleading and unused.

---

### MED-13: Duplicate Error Extraction Logic (x4)

Error message extraction exists in 4 separate places with slightly different implementations:
- `lib/api/error-handler.ts` → `extractErrorInfo`
- `lib/api/request.ts` → `extractApiErrorMessage`
- `lib/api/transformers.ts` → `extractApiErrorMessage` (duplicate!)
- `features/products/queries.ts` → inline (~40 lines per mutation)

---

### MED-14: `apiGet`/`apiPost` Wrappers Swallow Structured Errors

**File:** `frontend/lib/api/request.ts`

```typescript
} catch (error) {
  const message = extractApiErrorMessage(error);
  throw new Error(message); // Loses status code, validation errors, AxiosError
}
```

All standardized wrappers re-throw as plain `Error`, losing HTTP status code, error code, and validation error arrays.

---

## 6. MINOR / LOW Issues

### Code Quality

| # | Issue | Location |
|---|-------|----------|
| 1 | `any` type on 5+ service methods (`HeroSlidesService.toResponseDto`, `PromotionsService.toPromotionResponse`, `EmailService.sendOrderConfirmation`, etc.) | Backend services |
| 2 | Dead code: `effectiveStock`, `minPrice`, `maxPrice` computed but never used in `ProductsService.create` | `products.service.ts` |
| 3 | Duplicate condition: `value !== null && value !== null` (should be `!== undefined`) | `variant.service.ts` |
| 4 | Inconsistent exception classes: some services use domain exceptions, others use bare `NotFoundException` | Multiple services |
| 5 | Inconsistent slug generation: Categories use `ensureUniqueSlug` (O(N) memory), Products use `ensureUniqueSlugInDb` (O(1)) | Categories vs Products |
| 6 | `ensureUniqueSlugInDb` has `while(true)` with no upper bound | `slug.util.ts` |
| 7 | Order number format `ORD-{timestamp}-{random}` leaks server timestamp | `order.util.ts` |
| 8 | `console.error` used directly instead of project `logger` utility | `ProductDetailClient.tsx` |
| 9 | `next.config.ts` uses `require()` instead of ESM `import` for bundle analyzer | `next.config.ts` |
| 10 | `--radius-lg` and `--radius-xl` both set to `0.5rem` (meaningless distinction) | `globals.css` |
| 11 | Admin header hardcodes "AD" and "Admin / Super User" instead of using actual user data | `admin/layout.tsx` |
| 12 | `PlaceOrderResponseDto.orderAccessToken` is always set to `undefined` — field should be removed | `checkout.service.ts` |
| 13 | `@IsNotEmpty()` missing on `UpdateProductDto.defaultVariantId` — empty string `""` passes validation | `update-product.dto.ts` |
| 14 | `ProductForm` types `initialData` as `any` — loses all type safety | `ProductForm.tsx` |
| 15 | `globals.css` is ~1327 lines with ~500 lines of hero-specific CSS effects | `globals.css` |
| 16 | Keyframes (`fade-in`, `shimmer`, `marquee`) defined 3 times: `@theme inline`, standalone `@keyframes`, and `tailwind.config.ts` | CSS/config |
| 17 | `--color-primary-500` maps to `--primary-600` in `@theme inline` block (off-by-one mismatch) | `globals.css` line ~356 |
| 18 | Favorites store uses localStorage only — no backend sync across devices | `store/` |

### Database

| # | Issue | Impact |
|---|-------|--------|
| 1 | Missing `@@index([productVariantId])` on `VariantOption` | Product detail page perf |
| 2 | Missing `@@index([productId])` on `OrderItem` | Admin top products query |
| 3 | Missing `@@index([variantId])` on `OrderItem` | Checkout stock check |
| 4 | Missing `@@index([userId])` on `Address` | Address listing |
| 5 | Missing `@@index([cartId])` on `CartItem` | Cart operations |
| 6 | No `@MaxLength` on `search` query parameter in `FilterProductsDto` | DoS via expensive ILIKE |
| 7 | No `@MaxLength` on `description` field in `CreateProductDto` | Multi-MB descriptions |
| 8 | No schema validation on `specs` JSON field | Unlimited JSON payload |

---

## 7. Frontend-Specific Findings

### Component Architecture

- **Admin layout is entirely `"use client"`** — The admin shell, sidebar, and header cannot benefit from SSR. The layout structure could be a server component with auth guard as client child.
- **`ProductsContent` uses 8 hooks** creating a complex dependency chain where any URL change triggers multiple re-computations.
- **`useFilterUpdates`** wraps setters in `useMemo` with `[searchParams, router, basePath]` — since `searchParams` is a new object on every render, the memoization provides zero benefit.

### State Management

- **Mutation of `productData` inside `useMemo`** in `useProductDetail.ts` — the hook mutates the incoming reference instead of returning a new object. This violates React's immutability rules.
- **Auth state persisted in localStorage** creates a flash of authenticated content — users see admin UI for a split second before `bootstrap()` confirms the session expired.
- **Auth bootstrap race condition** — if `bootstrap()` is called concurrently from multiple components, both fire `getMe()` and overwrite each other.

### Data Flow

- **`useVariantSelection` hardcodes variant option keys** to `["color", "size", "storage", "style"]`. New option types from the backend are silently ignored.
- **`sortBy` value mismatch** — Frontend uses `"latest"`, `"price-low"`, `"price-high"` but backend expects `"price"`, `"name"`, `"createdAt"`. Translation must happen in `filtersToApiParams()`.

---

## 8. Backend-Specific Findings

### Business Logic Flaws

1. **Cart cleanup during guest cart creation** — Every new guest triggers expired session cleanup (2-3 extra queries) in the user-facing path. The daily cron already handles this.
2. **No pagination on `PromotionsService.findAll`** — Returns all promotions without pagination.
3. **`isDescendant` walks parent chain with N individual queries** — Should fetch all categories once and walk in memory.
4. **`CategoriesService.create` fetches ALL slugs** into memory for uniqueness check.

### Email Security

- **XSS/HTML injection in email templates** — Product names, order numbers, and user names are interpolated directly into HTML without escaping. An admin could inject `<img src=x onerror="...">` via product names.

### Authentication

- **Refresh token cookie path is `/`** — Only needed for `/api/auth/refresh` and `/api/auth/logout`. Broader path increases attack surface.
- **Logging PII** — Failed login attempts log full email addresses. Should mask: `joh***@email.com`.

---

## 9. Integration & Data Flow Issues

### API Contract Mismatches

| Frontend Expects | Backend Returns | Impact |
|-----------------|----------------|--------|
| `CartItemProduct.images: string[]` | No `images` field in cart response | Type mismatch (not used at runtime, but misleading) |
| `Product.createdAt: string` | `Date` object (serializes as string) | Semantic mismatch in DTO docs |
| `ProductsResponse.meta: { total, ... }` | `{ data, total, page, limit }` flat | Dead type, confuses developers |
| `AuthResponseData.expiresIn` | Returned by backend | Completely ignored by frontend — no proactive refresh |

### Registration Flow Gap

Frontend sends only `email` + `password` for registration. Backend generates `firstName` from email prefix (e.g., `john.doe@email.com` → `firstName: "John.doe"`, `lastName: ""`). This produces poor user profiles.

### Token Refresh — No Timeout

The refresh token queue in `client.ts` has no timeout. If `refreshRequest()` hangs (network partition), all queued requests wait indefinitely. The refresh call uses raw `axios.post` which doesn't inherit `apiClient`'s 30s timeout.

### Guest Checkout Email Gap

Guest checkout requires phone but email is optional. A guest without email gets:
- No order confirmation email
- No way to enforce `perUserLimit` on coupons
- No shipping update notifications

---

## 10. Security Audit

### What's Secure (Good Practices Found)

| Practice | Status |
|----------|--------|
| httpOnly cookies for JWT | ✅ XSS-safe token storage |
| Refresh token rotation | ✅ Each refresh invalidates old token |
| Email enumeration prevention | ✅ Generic messages on login/forgot-password |
| `whitelist: true` + `forbidNonWhitelisted: true` | ✅ Strips unexpected request fields |
| Helmet security headers | ✅ Applied globally |
| Prisma parameterized queries | ✅ No SQL injection |
| Raw SQL uses `Prisma.sql` tagged templates | ✅ Parameterized values |
| Serializable isolation on cart merge | ✅ Prevents race conditions |
| Atomic stock decrement with `stock >= qty` guard | ✅ Prevents overselling |
| `@Exclude()` on `passwordHash` and `refreshToken` | ✅ No accidental exposure |
| Guest order token uses SHA-256 + `timingSafeEqual` | ✅ Proper crypto comparison |
| UploadThing admin auth check | ✅ File uploads verify admin role |
| Strong password policy (`@IsStrongPassword`) | ✅ Uppercase, lowercase, number, symbol required |

### Security Vulnerabilities Found

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| S1 | CRITICAL | No `@MaxLength` on password (bcrypt DoS) | `register.dto.ts` |
| S2 | CRITICAL | No rate limit on password reset | `auth.controller.ts` |
| S3 | CRITICAL | Weak JWT secret validation | `env.validation.ts` |
| S4 | HIGH | `enableImplicitConversion: true` | `main.ts` |
| S5 | HIGH | Unvalidated image URLs | Product DTOs |
| S6 | HIGH | User cache memory leak | `jwt.strategy.ts` |
| S7 | HIGH | No CSRF tokens (if cross-origin) | `auth.controller.ts` |
| S8 | MEDIUM | Invalid dummy bcrypt hash | `auth.service.ts` |
| S9 | MEDIUM | Guest coupon limit bypass | `coupons.service.ts` |
| S10 | MEDIUM | HTML injection in emails | `email.service.ts` |
| S11 | LOW | Search param no max length | `filter-products.dto.ts` |
| S12 | LOW | Refresh token cookie path too broad | `auth.controller.ts` |
| S13 | LOW | PII in auth logs | `auth.service.ts` |
| S14 | LOW | Order search allows ID enumeration | `orders.service.ts` |

---

## 11. Performance Audit

### Database Query Performance

| Issue | Queries Per Request | Impact |
|-------|-------------------|--------|
| Categories `findAll` N+1 counts | ~23 queries/page | **Severe at scale** |
| Categories `findTree` counts all | O(N) queries total | **App-crushing at 100+ categories** |
| Admin stats loads all products | Full table scan + in-memory filter | **Memory bomb at 10K+ products** |
| `getDescendantCategoryIds` fetches all categories | 1 full scan per product listing | **Unnecessary repeated work** |
| `getCategoryPromotionsForCategories` per-category ancestor lookup | O(k) queries per product page | **Adds latency per unique category** |
| Price sort runs 3 sequential queries | Could be 1 with window functions | **Moderate** |
| Order list includes full product relations | Payload bloat | **Moderate** |

### Frontend Performance

| Issue | Impact |
|-------|--------|
| Mock data unconditionally bundled | Bundle size bloat |
| `useFilterUpdates` memoization broken (new `searchParams` object each render) | Unnecessary re-renders |
| `ProductsContent` 8-hook chain with coupled effects | Complex re-render cascade |
| `YouMayAlsoLike` fires separate API query per product detail | Extra network request |
| `globals.css` at 1327 lines with hero animations | CSS parsing overhead |

### Caching

| Current | Issue |
|---------|-------|
| In-memory `TtlCache` for promotions (120s TTL) | No max size, no cross-instance invalidation |
| In-memory user cache in JWT strategy | No LRU eviction, threshold-only cleanup |
| No caching for category tree | Fetched on every product query |

---

## 12. Accessibility Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | User account dropdown is hover-only (no keyboard/touch/screen reader) | `Header.tsx` | Users with motor/visual disabilities can't access account menu |
| 2 | Missing `aria-label` on variant option buttons | Product detail | Screen readers can't identify color/size selectors |
| 3 | Cart quantity display has no `aria-live` region | Cart page | Quantity changes not announced to screen readers |
| 4 | Mobile menu lacks focus trap | `Header.tsx` | Users can tab past menu into hidden content |

---

## 13. Deployment & DevOps

### Docker Issues

| # | Issue | Impact |
|---|-------|--------|
| 1 | `docker-compose.yml` only contains PostgreSQL — no backend/frontend services | No orchestration, no service discovery |
| 2 | Backend Dockerfile has dead `deps` stage (runs `npm ci` but is never referenced) | +30s build time wasted |
| 3 | Backend Dockerfile copies frontend mock data file (`COPY frontend/lib/mock-data/mock-data.ts`) | Tight coupling, which is authoritative? |
| 4 | Frontend Dockerfile assumes `output: 'standalone'` in Next.js config | Build fails if not configured |
| 5 | Neither Dockerfile documents required environment variables | Deployment confusion |

---

## 14. What's Done Right

Despite the issues, the codebase demonstrates several strong architectural decisions:

1. **Server-owned cart with guest sessions** — Proper e-commerce pattern with session merge on login
2. **httpOnly cookie-based auth** — Better security than localStorage JWT
3. **URL-based filter state** — Shareable, bookmarkable product filter URLs
4. **React Query + Zustand separation** — Server state vs client state properly divided
5. **Prisma transactions for checkout** — Stock decrement + order creation are atomic
6. **Global exception filter** — Consistent error response format
7. **Whitelist validation** — Unknown request fields are stripped
8. **Feature-based frontend architecture** — Domain logic organized by feature folder
9. **Refresh token rotation** — Each refresh invalidates the old token
10. **Atomic stock guard** — `updateMany where: { stock >= qty }` prevents overselling
11. **Timing-safe token comparison** — Guest order tokens use proper crypto
12. **Rate limiting on auth endpoints** — Login and registration have throttle decorators
13. **Strong password policy** — Enforced via `@IsStrongPassword`
14. **Soft-delete pattern for products** — Products with orders aren't hard-deleted

---

## 15. Remediation Priority Matrix

### P0 — Fix Immediately (< 1 day)

| Issue | Effort | Risk if Unfixed |
|-------|--------|----------------|
| CRIT-1: `promoProductIds` shadowing bug | 5 min | Wrong promotion results |
| CRIT-2: `isEmpty` TDZ crash in checkout | 10 min | Checkout page crashes |
| CRIT-3: Password `@MaxLength(128)` | 5 min | CPU denial-of-service |
| CRIT-6: Remove frontend packages from backend | 10 min | Supply-chain risk, bloat |
| CRIT-7: Rate limit password reset | 2 min | Token brute-force |
| CRIT-8: JWT secret `@MinLength(32)` | 5 min | Weak secrets in prod |
| MED-7: Fix dummy bcrypt hash | 15 min | Timing attack mitigation broken |

### P1 — Fix This Sprint (< 1 week)

| Issue | Effort |
|-------|--------|
| HIGH-1/2: N+1 category counts → batch query | 2-3 hours |
| HIGH-3: Admin stats → SQL aggregation | 2 hours |
| HIGH-4: Remove `enableImplicitConversion` | 2 hours |
| HIGH-7: Cache category tree | 1 hour |
| HIGH-8: Fix user cache memory leak (use LRU) | 1 hour |
| HIGH-9: Switch refresh token to SHA-256 | 2 hours |
| HIGH-10: Add URL validation to image fields | 1 hour |
| CRIT-4: Add EmailModule to CheckoutModule imports | 5 min |
| CRIT-5: Return 503 when DB is down | 10 min |
| MED-1: Fix `applyToDescendants` at checkout | 1 hour |
| MED-6: Add Yup schema to checkout form | 1 hour |
| MED-11: Add `state` to address reset | 5 min |

### P2 — Fix Next Sprint (< 2 weeks)

| Issue | Effort |
|-------|--------|
| MED-2: Cap product discount at 100% | 10 min |
| MED-3: Check children before category deletion | 30 min |
| MED-4: Standardize checkout API call | 30 min |
| MED-5: Re-validate coupon on subtotal change | 1 hour |
| MED-8: Guest coupon limit enforcement | 30 min |
| MED-9: PasswordResetToken cleanup cron | 30 min |
| MED-10: Use server-provided subtotal in cart page | 15 min |
| MED-13: Consolidate error extraction to one utility | 1 hour |
| MED-14: Preserve error structure in API wrappers | 1 hour |
| Missing DB indexes (5 indexes) | 30 min |
| HIGH-5/6: Remove mock data from prod bundle | 2 hours |
| Docker improvements | 2 hours |

### P3 — Backlog

| Issue | Effort |
|-------|--------|
| Accessibility fixes (4 items) | 4 hours |
| Extract hero CSS to module | 1 hour |
| De-duplicate keyframe definitions | 30 min |
| Type `any` cleanup (5+ locations) | 2 hours |
| Remove dead code | 30 min |
| Add proactive token refresh | 2 hours |
| Add CSRF token mechanism | 4 hours |
| Consistent exception classes | 1 hour |
| Add refresh token timeout | 30 min |
| Registration form name fields | 1 hour |
| Favorites backend sync | 4 hours |
| Add pagination to Promotions findAll | 30 min |
| Email HTML escaping utility | 1 hour |

---

> **Total estimated remediation effort:** ~40-50 developer hours
> **P0 items alone:** ~1 hour
> **Biggest ROI fix:** Caching the category tree eliminates the majority of N+1 query storms in one change.
