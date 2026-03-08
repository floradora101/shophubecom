# ShopHub Senior Code Review

> **Date:** March 8, 2026
> **Scope:** Full codebase inspection — backend (NestJS) + frontend (Next.js)
> **Focus:** Bugs, dead code, bad practices, inconsistencies

---

## Overall Impression

The codebase is well-structured for an e-commerce app — proper module separation, custom exceptions, auth with httpOnly cookies, rate limiting, and a clean NestJS + Next.js architecture. That said, there are several real bugs, dead code, inconsistencies, and patterns that would hurt in production.

---

## CRITICAL: Actual Bugs

### 1. Logic bug in `ProductsService.update` — `defaultVariantId` disconnect never fires

**File:** `backend/src/products/products.service.ts` (lines 408–424)

```typescript
if (updateProductDto.defaultVariantId !== undefined) {
  if (updateProductDto.defaultVariantId === null) {
    // Will be handled in transaction after syncVariants
  } else {
    await this.variantService.validateDefaultVariant(
      this.prisma, id, updateProductDto.defaultVariantId,
    );
    if (updateProductDto.defaultVariantId === null) {  // ← DEAD BRANCH: always false here
      data.defaultVariant = { disconnect: true };
    } else {
      data.defaultVariant = { connect: { id: updateProductDto.defaultVariantId } };
    }
  }
}
```

**Problem:** The inner `if (defaultVariantId === null)` is inside the `else` block where it's guaranteed to be non-null. The `disconnect` path is **unreachable**. If a user explicitly clears the default variant, nothing happens.

**Fix:** Move the disconnect logic into the outer `if (=== null)` branch, or restructure to handle null before the else.

---

### 2. Auth cache not invalidated on profile email change

**File:** `backend/src/users/users.service.ts` (lines 95–143)

```typescript
async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<UserEntity> {
  // ...
  try {
    const updated = await this.prisma.user.update({  // ← uses prisma directly
      where: { id },
      data,
    });
    return new UserEntity(updated);  // ← no cache invalidation!
  }
}
```

**Problem:** `updateProfile` bypasses `updateUser()` and writes directly to Prisma. When a user changes their email, the auth cache (`AuthUserCacheService`) is never invalidated. The JWT strategy will serve stale user data from cache for up to 5 minutes.

**Fix:** Either route through `updateUser()` or add `this.authUserCache.invalidate(id)` when email changes.

---

### 3. Missing validation on favorites sync endpoint

**File:** `backend/src/favorites/favorites.controller.ts` (lines 31–38)

```typescript
@Post('sync')
sync(
  @Body() body: { productIds: string[] },
  @CurrentUser() user: AuthenticatedUser,
): Promise<string[]> {
  const productIds = Array.isArray(body?.productIds) ? body.productIds : [];
  return this.favoritesService.sync(user.id, productIds);
}
```

**Problem:** No DTO, no `class-validator` decorators. A client can send `{ productIds: [123, {}, null, "x".repeat(100000)] }` and it passes straight to the service. Every other endpoint uses proper DTOs — this one was missed.

**Fix:** Create a `SyncFavoritesDto` with `@IsArray()`, `@IsString({ each: true })`, `@ArrayMaxSize()`.

---

## HIGH: Dead Code

### 4. Entire `transformers.ts` file is dead code

**File:** `frontend/lib/api/transformers.ts`

`transformArray`, `normalizeDates`, `pickAndTransform`, `mapObjectValues`, `combineObjects` — none of these are imported anywhere outside the file itself. Only `PaginatedResponse<T>` is potentially useful but is also defined in `response-transformer.ts`. This file is **159 lines of unused code**.

**Fix:** Delete the file. Move `PaginatedResponse<T>` to `response-transformer.ts` if needed.

---

### 5. `useAuthMutations.ts` — never imported anywhere

**File:** `frontend/features/auth/hooks/useAuthMutations.ts`

```typescript
export function useLoginMutation() { ... }
export function useRegisterMutation() { ... }
export function useLogoutMutation() { ... }
```

`LoginForm` and `RegisterForm` use `useAuthStore` directly. These hooks exist but are imported by **zero files**.

**Fix:** Either adopt these hooks in the forms (preferred — they give you `isPending`/`isError` for free) or delete them.

---

### 6. Deprecated sync functions that just throw

**File:** `frontend/lib/data/products.ts`

```typescript
export function getAllProductsSync(): Product[] {
  throw new Error("getAllProductsSync is deprecated...");
}

export function getProductBySlugSync(_slug: string): Product | null {
  throw new Error("getProductBySlugSync is deprecated...");
}
```

These do nothing but throw. They're only referenced in the same file's barrel.

**Fix:** Delete them.

---

### 7. `getProductsByCategory` — throws for non-mock mode

**File:** `frontend/lib/data/products.ts` (lines 126–142)

```typescript
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  if (USE_MOCKS) { /* ... */ }
  throw new Error("Use features/products/api.getProducts({ categoryId })...");
}
```

This will crash in production if ever called.

**Fix:** Either implement the API call or remove the function entirely.

---

## MEDIUM: Bad Practices & Inconsistencies

### 8. `request.ts` duplicates error handling from `error-handler.ts`

**Files:** `frontend/lib/api/request.ts` and `frontend/lib/api/error-handler.ts`

`buildErrorInfoFromFailedResponse` in `request.ts` duplicates the exact same message-mapping logic that `extractErrorInfo` provides in `error-handler.ts` (auth errors, forbidden, not-found, server errors). If you change the user-facing messages in one place, you have to remember the other.

**Fix:** Consolidate into one shared function in `error-handler.ts`.

---

### 9. `window.confirm` for destructive actions across ALL admin pages

**Files:** 7 admin pages

```typescript
// Found in:
// - admin/promotions/page.tsx
// - admin/categories/page.tsx
// - admin/subcategories/page.tsx
// - admin/announcements/page.tsx
// - admin/products/page.tsx
// - admin/hero-slides/page.tsx
// - admin/coupons/page.tsx

if (window.confirm("Are you sure you want to delete this promotion?")) { ... }
```

`window.confirm` is ugly, cannot be styled, blocks the thread, and looks unprofessional for an e-commerce admin panel. You already have `@radix-ui/react-alert-dialog` as a dependency.

**Fix:** Create a reusable `<ConfirmDialog>` component using Radix AlertDialog and use it everywhere.

---

### 10. `window.location.reload()` instead of `refetch()` for error retry

**Files:** 6 places across admin and shop pages

```typescript
// Found in:
// - admin/categories/page.tsx
// - admin/subcategories/page.tsx
// - admin/subcategories/[id]/edit/page.tsx
// - admin/orders/page.tsx
// - admin/products/page.tsx
// - (shop)/products/ProductsContent.tsx

<Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
```

A full page reload loses all client state (filters, scroll position, sidebar state).

**Fix:** Use React Query's `refetch()` or `queryClient.invalidateQueries()`.

---

### 11. "Proceed to Checkout" button uses `variant="destructive"`

**File:** `frontend/app/(shop)/cart/page.tsx` (line 411)

```tsx
<Button
  className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white ..."
  variant="destructive"
>
  Proceed to Checkout
</Button>
```

"Destructive" is for delete/danger actions, not the primary CTA of your checkout flow. The inline `className` overrides the variant colors anyway, making the variant meaningless.

**Fix:** Use `variant="default"` or create a custom variant.

---

### 12. Missing `@ArrayMinSize(1)` on product variants

**File:** `backend/src/products/dto/create-product.dto.ts` (lines 116–119)

```typescript
@IsArray()
@ValidateNested({ each: true })
@Type(() => CreateProductVariantDto)
variants!: CreateProductVariantDto[]; // Required: at least 1 variant needed
```

The comment says "at least 1 variant needed" but the validation allows an empty array `[]`.

**Fix:** Add `@ArrayMinSize(1, { message: 'At least one variant is required' })`.

---

### 13. Favorites store silently swallows backend errors

**File:** `frontend/store/favorites-store.ts`

```typescript
addFavorite: async (productId) => {
  if (isAuth) {
    try {
      await favoritesApi.add(productId);
    } catch (err) {
      logWarning(...);
      // ← error caught, local state updated anyway
    }
  }
  set({ favoriteProductIds: [...current, productId] }); // ← always executes
},
```

If the backend call fails, the user sees the favorite added locally but it won't persist across sessions/devices.

**Fix:** Surface sync failures with a toast notification so users know it didn't save.

---

### 14. Auth store storage listener never cleaned up

**File:** `frontend/store/auth-store.ts` (lines 198–209)

```typescript
onRehydrateStorage: () => (state) => {
  if (typeof window === "undefined") return;
  const handleStorage = (e: StorageEvent) => { ... };
  window.addEventListener("storage", handleStorage);
  // ← no removeEventListener ever
},
```

The `storage` event listener is added but never removed. In a standard Next.js app this may not cause visible issues since the store is a singleton, but it's a memory leak pattern. If the store were ever re-created (SSR, tests), listeners would stack up.

**Fix:** Return a cleanup function or manage the listener lifecycle.

---

### 15. Hardcoded stats in `home.ts`

**File:** `frontend/lib/data/home.ts`

```typescript
stats: {
  totalProducts: allProductsTotal,
  happyCustomers: 50000,   // ← hardcoded magic number
  yearsExperience: 8,      // ← hardcoded magic number
}
```

These appear in both mock and API branches — hardcoded in a data-fetching function.

**Fix:** Move to a config file, CMS, or site constants.

---

### 16. Inconsistent exception constructor signatures

**Files:** `backend/src/common/exceptions/`

Some exceptions accept an optional custom message:
- `ProductNotFoundException(message?)`
- `CategoryNotFoundException(message?)`
- `UserNotFoundException(message?)`

Others have hardcoded messages:
- `CouponNotFoundException` — no custom message
- `OrderNotFoundException` — no custom message
- `CartItemNotFoundException` — no custom message
- `AddressNotFoundException` — no custom message

**Fix:** Pick one pattern and apply consistently. Recommended: all accept optional message with a sensible default.

---

### 17. `update()` is a pointless wrapper in `UsersService`

**File:** `backend/src/users/users.service.ts` (lines 45–47)

```typescript
async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
  return this.updateUser(id, data);
}
```

`update()` just calls `updateUser()`. Having both is confusing and contributed to the cache bug (#2) because `updateProfile` bypasses both.

**Fix:** Remove `update()`, rename `updateUser` to `update`, and route `updateProfile` through it.

---

## LOW: Code Smell & Polish

### 18. Deprecated `.substr()` usage

**File:** `frontend/app/admin/products/_components/ProductForm.tsx` (line 353)

```typescript
const tempKey = `__temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

`.substr()` is deprecated in modern JavaScript.

**Fix:** Use `.substring(2, 11)` or `.slice(2, 11)`.

---

### 19. Inconsistent response parsing in `products.ts`

**File:** `frontend/lib/data/products.ts`

```typescript
// Three different patterns for the same backend:
return json?.data?.data ?? json?.data ?? [];   // getAllProducts
return json?.data ?? null;                      // getProductBySlugForServer
return json?.data?.data ?? json?.data ?? [];   // searchProducts
```

The backend wraps responses in `{ success: true, data: ... }`. The double `.data.data` fallback suggests uncertainty about the response shape.

**Fix:** Standardize on one extraction pattern based on the actual backend response shape.

---

### 20. Hardcoded cookie name in JWT strategy

**File:** `backend/src/auth/strategies/jwt.strategy.ts`

The JWT strategy reads `request.cookies.accessToken` while the auth controller uses a constant `ACCESS_TOKEN_COOKIE`. If someone renames the cookie, only one place gets updated.

**Fix:** Centralize cookie names in a shared constants file.

---

### 21. Non-null assertions on config values

**File:** `backend/src/auth/auth.service.ts`, `backend/src/auth/auth.module.ts`

```typescript
configService.get<string>('JWT_ACCESS_SECRET')!
configService.get<string>('JWT_REFRESH_SECRET')!
```

If these env vars are missing, you get a cryptic runtime error deep in JWT signing. You have `env.validation.ts` but these assertions bypass it.

**Fix:** Use `configService.getOrThrow()` for guaranteed safety.

---

### 22. `data` variable shadowed in `request.ts`

**File:** `frontend/lib/api/request.ts`

```typescript
export async function apiPost<T, D = unknown>(
  url: string,
  data?: D,                    // ← parameter named "data"
  config?: ApiRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.post<BackendResponse<T>>(url, data, config);
    if (!response.data.success) {
      const data = response.data as { ... };  // ← shadows outer "data" parameter
    }
  }
}
```

Not a bug (the parameter is no longer needed at that point), but it's sloppy and confusing to read.

**Fix:** Rename the inner variable to `errorData` or `responseData`.

---

## Architecture Notes

These aren't bugs but are worth thinking about for production readiness:

- **Mock/API dual mode everywhere:** The `USE_MOCKS` branching in `lib/data/*.ts` is extensive. In production, all mock paths are dead weight. Consider feature flags or build-time tree-shaking instead of runtime branches.

- **No request deduplication in favorites:** `addFavorite` and `removeFavorite` fire API calls but don't debounce or deduplicate. A user rapidly toggling favorites will fire many concurrent requests.

- **DEMO_CHECKOUT in checkout flow:** `useCheckoutOrder.ts` has a demo mode that creates fake orders client-side. Ensure this is impossible to enable in production via env vars.

- **`getProductsByCategoryPrefix` throws in non-mock mode:** Another function that only works with mocks and throws otherwise. Dead in production.

---

## Summary

| Priority | Count | Action |
|----------|-------|--------|
| **Critical** (bugs) | 3 | Fix immediately — logic error, cache staleness, missing validation |
| **High** (dead code) | 4 | Delete unused code to reduce maintenance burden |
| **Medium** (bad practices) | 10 | Refactor for production quality |
| **Low** (polish) | 5 | Clean up when convenient |

The three critical bugs should be addressed before any production deployment. The dead code should be cleaned up to keep the codebase honest. The medium-priority items are what separates a "works in demo" app from a production-grade e-commerce platform.
