# ShopHub Architecture Documentation

**Complete Technical Documentation**
_Generated from conversation history_

---

## Table of Contents

1. [Cart Flow](#1-cart-flow)
2. [Authentication Flow](#2-authentication-flow)
3. [Database Transactions](#3-database-transactions)
4. [Over-Reservation Prevention](#4-over-reservation-prevention)
5. [React Query and Caching](#5-react-query-and-caching)
6. [Invalidation vs Direct Cache Updates](#6-invalidation-vs-direct-cache-updates)
7. [Zustand State Management](#7-zustand-state-management)
8. [User Validation on Every Request](#8-user-validation-on-every-request)
9. [Filtering System](#9-filtering-system)
10. [Category/Product Slug to ID Mapping](#10-categoryproduct-slug-to-id-mapping)
11. [Form Handling](#11-form-handling)
12. [Products and Variants Implementation](#12-products-and-variants-implementation)
13. [UploadThing Integration](#13-uploadthing-integration)
14. [Database Design](#14-database-design)
15. [Error Handling Architecture](#15-error-handling-architecture)
16. [Variant Handling](#16-variant-handling)

---

## 1. Cart Flow

### Overview

The cart system supports both **authenticated users** and **guest users**, with automatic merging when a guest logs in.

### Architecture

- **Backend**: Single source of truth (database)
- **Frontend**: React Query for data, Zustand for UI state only
- **Storage**: Server-side (guest carts use httpOnly cookies, user carts use database)

### Authenticated User Flow

1. **User adds item to cart**

   - Frontend calls `POST /api/cart/items` with `variantId` and `quantity`
   - Backend validates stock, creates/updates cart item
   - React Query mutation uses optimistic update for instant UI feedback

2. **Cart state management**

   - React Query cache: `queryKey: ["cart"]`
   - Zustand store: Only manages `isOpen` (cart sidebar visibility)
   - **Important**: Cart data is NOT stored in Zustand

3. **Cart persistence**
   - Cart data stored in database (`Cart` + `CartItem` tables)
   - Linked to user via `userId`
   - Automatically loaded on page load via `useCartQuery()`

### Guest User Flow

1. **Guest adds item to cart**

   - Same API call as authenticated user
   - Backend creates guest cart session (stored in httpOnly cookie)
   - Cart stored in database with `userId: null`

2. **Guest logs in**

   - Backend automatically merges guest cart into user cart
   - Uses transaction with `Serializable` isolation level to prevent race conditions
   - Frontend invalidates cart query to fetch merged cart

3. **Cart merging logic**
   - Items with same `(productId, variantId)` are combined (quantities added)
   - Stock validation ensures merged quantities don't exceed available stock
   - All done atomically in a transaction

### React Query Configuration

```typescript
useCartQuery() {
  queryKey: ["cart"],
  staleTime: 30_000,        // 30 seconds
  gcTime: 5 * 60 * 1000,    // Keep in cache 5 minutes
  refetchOnMount: false,     // Don't refetch on mount
  refetchOnWindowFocus: false,
  enabled: true,             // ALWAYS enabled (guest + user)
}
```

**Why these settings?**

- `staleTime: 30s`: Cart data is relatively stable, no need for constant refetching
- `refetchOnMount: false`: Prevents unnecessary API calls when navigating
- `enabled: true`: Works for both guest and authenticated users

### Optimistic Updates

All cart mutations use optimistic updates:

```typescript
useAddCartItemMutation() {
  onMutate: async (newItem) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: cartKeys.all });

    // Snapshot previous value
    const previousCart = queryClient.getQueryData(cartKeys.all);

    // Optimistically update cache
    queryClient.setQueryData(cartKeys.all, (old) => {
      // Add item to cart optimistically
      return { ...old, items: [...old.items, newItem] };
    });

    return { previousCart };
  },
  onError: (err, newItem, context) => {
    // Rollback on error
    queryClient.setQueryData(cartKeys.all, context.previousCart);
  },
  onSuccess: () => {
    // Refetch to get server truth
    queryClient.invalidateQueries({ queryKey: cartKeys.all });
  }
}
```

### Post-Checkout Behavior

1. **Order placed**

   - Backend clears cart items in transaction
   - Returns order details

2. **Frontend handling**

   - Invalidates cart query: `queryClient.invalidateQueries({ queryKey: cartKeys.all })`
   - Redirects to order confirmation page
   - Cart is now empty (fresh fetch shows empty cart)

3. **Page reload**
   - Cart query refetches from server
   - Shows empty cart (items were deleted on backend)

---

## 2. Authentication Flow

### Overview

JWT-based authentication with httpOnly cookies for security. Supports registration, login, token refresh, and automatic session management.

### Registration Flow

1. **User submits registration form**

   - Frontend: `RegisterForm.tsx` uses `useAuthStore().register()`
   - Backend: `POST /api/auth/register`
   - Password hashed with bcrypt
   - User created in database

2. **Automatic login after registration**
   - Backend sets httpOnly cookies (`accessToken`, `refreshToken`)
   - Frontend calls `bootstrap()` to fetch user data
   - User state stored in Zustand (persisted to localStorage)

### Login Flow

1. **User submits login form**

   - Frontend: `LoginForm.tsx` uses `useAuthStore().login()`
   - Backend: `POST /api/auth/login`
   - Validates credentials
   - Sets httpOnly cookies

2. **Bootstrap after login**
   - Frontend calls `bootstrap()` → `GET /api/auth/me`
   - User data stored in Zustand
   - Cart query invalidated (to merge guest cart if exists)

### Bootstrap Process

```typescript
// frontend/store/auth-store.ts
async bootstrap() {
  try {
    const user = await authApi.getMe();
    set({ user, status: 'authenticated', bootstrapped: true });
  } catch (error) {
    set({ user: null, status: 'unauthenticated', bootstrapped: true });
  }
}
```

**When bootstrap runs:**

- On app initialization
- After login/registration
- On page reload (checks existing session)

### Token Refresh

1. **Automatic refresh on 401**

   - Axios interceptor catches 401 errors
   - Calls `POST /api/auth/refresh` with refresh token (from httpOnly cookie)
   - Backend validates refresh token, issues new access token
   - Retries original request with new token

2. **Refresh failure**
   - If refresh fails, emits `authExpired` event
   - `AuthProvider` handles event, clears user state
   - Redirects to login page

### Logout Flow

1. **User clicks logout**

   - Frontend: `useAuthStore().logout()`
   - Backend: `POST /api/auth/logout` (clears cookies)
   - Frontend clears Zustand state
   - Invalidates cart query (backend creates new guest cart)

2. **Guest cart creation**
   - Backend automatically creates new guest cart session
   - Frontend fetches empty guest cart

### State Management

**Zustand Store:**

```typescript
useAuthStore {
  status: 'loading' | 'authenticated' | 'unauthenticated',
  user: User | null,
  bootstrapped: boolean,

  // Actions
  bootstrap(),
  login(credentials),
  register(data),
  logout(),
}
```

**Persistence:**

- `user` and `status` persisted to localStorage
- Survives page reloads
- Backend is still source of truth (validated on every request)

---

## 3. Database Transactions

### Overview

Transactions ensure **ACID properties** (Atomicity, Consistency, Isolation, Durability) for critical operations.

### When Transactions Are Used

1. **Cart Operations**

   - `addItem()`: Check stock + create/update cart item atomically
   - `updateItem()`: Validate stock + update quantity + update price atomically
   - `resolveOrCreateCart()`: Create cart + session atomically (guest) or merge carts atomically (authenticated)

2. **Checkout**

   - `placeOrder()`: Decrement stock + create order + create order items + clear cart atomically

3. **Product Management**

   - `create()`: Create product + variants atomically
   - `update()`: Update product + sync variants + recompute derived fields atomically

4. **Order Creation**
   - `create()`: Create order + order items atomically

### Isolation Levels

**Default (Read Committed):**

- Most operations use default isolation
- Prevents dirty reads
- Allows non-repeatable reads (acceptable for most cases)

**Serializable (Strictest):**

- Used for cart merging: `Prisma.TransactionIsolationLevel.Serializable`
- Prevents all race conditions
- Ensures no phantom reads
- **Why**: Cart merging is critical - must prevent concurrent merge conflicts

### Example: Cart Item Addition

```typescript
async addItem(dto: AddCartItemDto) {
  return await this.prisma.$transaction(async (tx) => {
    // 1. Fresh read of variant (inside transaction)
    const freshVariant = await tx.productVariant.findUnique({
      where: { id: variantId },
    });

    // 2. Check stock
    if (freshVariant.stock < desiredQuantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // 3. Upsert cart item
    await tx.cartItem.upsert({
      where: { /* composite key */ },
      create: { /* ... */ },
      update: { quantity: desiredQuantity },
    });

    // 4. Reload cart
    return await tx.cart.findUnique({ /* ... */ });
  });
}
```

**Benefits:**

- Stock check and cart update are atomic
- If stock check fails, cart is not updated
- Fresh read ensures we see latest stock (not stale data)

---

## 4. Over-Reservation Prevention

### The Problem

**Question**: "If we only check stock when adding to cart, we could still reserve items that aren't in stock!"

**Answer**: We don't reserve stock at cart addition. Stock is only decremented at **checkout**.

### How It Works

1. **Adding to Cart**

   - Only validates stock exists (doesn't decrement)
   - Stock can change between add-to-cart and checkout
   - Multiple users can add same item to cart

2. **Checkout (Stock Decrement)**
   - Atomic conditional update: `stock >= quantity`
   - If condition fails, transaction rolls back
   - Order is not created if stock insufficient

### Checkout Implementation

```typescript
async placeOrder(dto: PlaceOrderDto) {
  return await this.prisma.$transaction(async (tx) => {
    // 1. Load cart items
    const cartItems = await tx.cartItem.findMany({ /* ... */ });

    // 2. Decrement stock atomically (with condition)
    for (const cartItem of cartItems) {
      const updated = await tx.productVariant.updateMany({
        where: {
          id: cartItem.variantId,
          stock: { gte: cartItem.quantity }, // ← Condition: only update if stock >= quantity
        },
        data: {
          stock: { decrement: cartItem.quantity },
        },
      });

      // 3. If no rows updated, stock was insufficient
      if (updated.count === 0) {
        throw new BadRequestException(`Insufficient stock for variant ${cartItem.variant.sku}`);
      }
    }

    // 4. Create order (only if all stock decrements succeeded)
    const order = await tx.order.create({ /* ... */ });

    // 5. Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
}
```

### Example Scenario

**Initial state:**

- Product has 5 units in stock
- User A adds 3 to cart
- User B adds 3 to cart
- Both carts show "3 in cart"

**Checkout:**

- User A checks out first → Stock: 5 - 3 = 2
- User B checks out → Stock: 2 - 3 = **FAILS** (insufficient stock)
- User B's order is rejected, cart remains

**Result**: Only 5 units sold (correct), no over-selling.

---

## 5. React Query and Caching

### Overview

React Query manages **server state** (data from API). Provides caching, background refetching, and optimistic updates.

### Query vs Mutation

**Queries (Read Operations):**

- `useQuery`: Fetch data
- Automatically cached
- Refetch on invalidation
- Used for: GET requests

**Mutations (Write Operations):**

- `useMutation`: Modify data
- Not cached (they modify data)
- Trigger invalidation/updates
- Used for: POST, PUT, DELETE, PATCH

### Caching Configuration

**Cart Query:**

```typescript
useCartQuery() {
  queryKey: ["cart"],
  staleTime: 30_000,        // 30 seconds
  gcTime: 5 * 60 * 1000,    // Keep in cache 5 minutes
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  enabled: true,
}
```

**Why these settings?**

- `staleTime: 30s`: Cart data doesn't change frequently, no need for constant refetching
- `refetchOnMount: false`: Prevents unnecessary API calls when navigating
- `enabled: true`: Works for both guest and authenticated users

**Products Query:**

```typescript
useProductsQuery(filters) {
  queryKey: ["products", filters],
  staleTime: 60_000,        // 1 minute
  placeholderData: keepPreviousData, // Keep old data while fetching
}
```

**Why `keepPreviousData`?**

- Smooth pagination/filtering experience
- Shows previous results while new data loads
- Prevents "loading spinner" flicker

**Orders Query:**

```typescript
useOrdersQuery() {
  queryKey: ["orders"],
  staleTime: 2 * 60 * 1000, // 2 minutes
  placeholderData: keepPreviousData,
}
```

**Why `keepPreviousData`?**

- Orders don't change frequently
- Better UX when navigating between pages

### Query Keys

**Structure:**

```typescript
// Single key
["cart"][
  // Parameterized
  ("products", { category: "electronics", page: 1 })
][
  // Nested
  ("order", orderId)
];
```

**Best Practices:**

- Use consistent key structure
- Include all filter parameters
- Invalidate parent keys to clear related data

---

## 6. Invalidation vs Direct Cache Updates

### The Difference

**Invalidation:**

- Tells React Query: "This data is stale, refetch from server"
- Triggers a network request
- Gets fresh data from backend
- Used when: You want server truth, data might have changed

**Direct Update:**

- Updates cache directly (no network request)
- Instant UI update
- Used when: You know the exact new state, no need to refetch

### When to Use Each

**Use Invalidation When:**

- Data might have changed on server
- You want to ensure consistency
- After mutations that affect multiple queries
- Example: After checkout, invalidate cart (backend cleared it)

**Use Direct Update When:**

- You know the exact new state
- Optimistic updates (update immediately, refetch on success)
- Computed updates (you can calculate new state)
- Example: Adding item to cart (optimistic update)

### Examples

**Invalidation (Checkout):**

```typescript
// After checkout, backend cleared cart
queryClient.invalidateQueries({ queryKey: cartKeys.all });
// → Triggers refetch, gets empty cart from server
```

**Direct Update (Add to Cart):**

```typescript
// Optimistic update
onMutate: async (newItem) => {
  queryClient.setQueryData(cartKeys.all, (old) => ({
    ...old,
    items: [...old.items, newItem],
    totalQuantity: old.totalQuantity + newItem.quantity,
  }));
},
// Then on success, invalidate to get server truth
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: cartKeys.all });
}
```

**Why Both?**

- Optimistic update: Instant UI feedback
- Invalidation on success: Ensures consistency with server

---

## 7. Zustand State Management

### Overview

Zustand manages **client-side UI state**, not server data. React Query is the source of truth for server data.

### What Zustand Stores

1. **Auth Store:**

   - `status`: 'loading' | 'authenticated' | 'unauthenticated'
   - `user`: User object (from backend)
   - `bootstrapped`: Whether initial auth check completed

2. **Cart Store:**
   - `isOpen`: Cart sidebar visibility (ONLY UI state)
   - **Important**: Cart data is NOT stored here (React Query owns it)

### Why Store User Data in Zustand?

**Benefits:**

1. **Instant UI updates**: No loading state when accessing user data
2. **Persistence**: Survives page reloads (localStorage)
3. **Reduces API calls**: Don't need to fetch user on every component mount
4. **Selective subscriptions**: Components can subscribe to specific fields

**Connection to Backend:**

- Backend is still source of truth
- Every API request validates user (via JWT)
- If user is deleted/banned, API requests will fail
- Frontend state is just a cache for UX

### Persistence

```typescript
useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      status: "unauthenticated",
      // ...
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        status: state.status,
      }),
    }
  )
);
```

**What's persisted:**

- `user` and `status` → localStorage
- Used for initial render (before bootstrap completes)

**What's NOT persisted:**

- Cart data (React Query manages this)
- Temporary UI state

---

## 8. User Validation on Every Request

### The Question

"How does every API request validate the user?"

### The Answer

**JWT Strategy + Database Lookup**

### Flow

1. **Request arrives at backend**

   - Protected route uses `@UseGuards(JwtAuthGuard)`

2. **JwtAuthGuard activates**

   - Extracts `accessToken` from httpOnly cookie
   - Calls `JwtStrategy.validate()`

3. **JwtStrategy validates**

   ```typescript
   async validate(payload: JwtPayload) {
     const userId = payload.userId;

     // Check in-memory cache (optional optimization)
     if (this.userCache.has(userId)) {
       return this.userCache.get(userId);
     }

     // ALWAYS fetch from database
     const user = await this.prisma.user.findUnique({
       where: { id: userId },
     });

     if (!user) {
       throw new UnauthorizedException('User not found');
     }

     // Cache for short time
     this.userCache.set(userId, user);
     return user;
   }
   ```

4. **User attached to request**
   - `request.user = user` (from database)
   - Controller can access via `@CurrentUser()` decorator

### Why Database Lookup?

**Security reasons:**

- User might be deleted after token issued
- User might be banned/deactivated
- Token might be valid but user no longer exists
- Ensures data consistency

**Performance:**

- In-memory cache reduces database calls
- Cache TTL: 5 minutes (configurable)
- Still validates on every request (cache miss = DB lookup)

### Example

```typescript
// Controller
@Get('/orders')
@UseGuards(JwtAuthGuard)
async getOrders(@CurrentUser() user: User) {
  // user is guaranteed to exist and be active
  // (validated by JwtStrategy)
  return this.ordersService.findAll(user.id);
}
```

---

## 9. Filtering System

### Overview

**Architecture principle:**

- URL is single source of truth for filters
- No client-side state for filters (no Zustand)
- Server-side filtering (backend applies filters)
- React Query caches filtered results

### URL-Based Filtering

**URL structure:**

```
/products?category=electronics&minPrice=100&maxPrice=500&search=laptop&page=1
```

**Frontend:**

- Reads filters from URL search params
- Converts to backend format
- Sends to API

**Backend:**

- Applies filters to database query
- Returns filtered results

### Filter Types

1. **Category** (slug → ID conversion)
2. **Search** (text search in name/description)
3. **Price Range** (minPrice, maxPrice)
4. **Stock** (inStock: true/false)
5. **Sorting** (price, name, createdAt)
6. **Pagination** (page, limit)

### Frontend Filter Parsing

```typescript
// frontend/features/products/utils/filters.ts
export function parseFiltersFromURL(searchParams: URLSearchParams) {
  return {
    category: searchParams.get("category") || undefined,
    search: searchParams.get("search") || undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    inStock: searchParams.get("inStock") === "true" ? true : undefined,
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 20,
  };
}
```

### Category Slug → ID Mapping

**Problem:**

- Frontend uses slug in URL: `/products?category=electronics`
- Backend needs ID: `GET /api/products?categoryId=cat123`

**Solution:**

1. Fetch all categories once
2. Build map: `slug → id`
3. Use map to convert filter

```typescript
// Fetch categories
const { data: categories } = useCategoriesQuery();

// Build map
const categoryIdMap = useMemo(() => {
  const map = new Map<string, string>();
  categories?.forEach((cat) => {
    map.set(cat.slug, cat.id);
  });
  return map;
}, [categories]);

// Convert filter
const categoryId = category ? categoryIdMap.get(category) : undefined;
```

### Backend Filtering

```typescript
async findAll(filters: FilterProductsDto) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  // Category filter
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  // Search filter
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Price range
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.variants = {
      some: {
        price: {
          gte: filters.minPrice,
          lte: filters.maxPrice,
        },
      },
    };
  }

  // Stock filter
  if (filters.inStock === true) {
    where.effectiveStock = { gt: 0 };
  }

  return await this.prisma.product.findMany({
    where,
    include: { /* ... */ },
    orderBy: { [filters.sortBy]: filters.sortOrder },
    skip: (filters.page - 1) * filters.limit,
    take: filters.limit,
  });
}
```

### Debouncing Search

**Frontend:**

```typescript
const [searchInput, setSearchInput] = useState("");
const debouncedSearch = useDebounce(searchInput, 500);

useEffect(() => {
  // Update URL when debounced search changes
  router.push({
    pathname: "/products",
    query: { ...filters, search: debouncedSearch },
  });
}, [debouncedSearch]);
```

**Why debounce?**

- Prevents API calls on every keystroke
- Waits 500ms after user stops typing
- Reduces server load

### React Query Caching with Filters

```typescript
useProductsQuery(filters) {
  queryKey: ["products", filters], // ← Filters in key
  staleTime: 60_000,
  placeholderData: keepPreviousData,
}
```

**Why filters in key?**

- Each filter combination has its own cache entry
- Changing filters = new query = new cache entry
- Old cache entries remain (for back navigation)

---

## 10. Category/Product Slug to ID Mapping

### The Difference

**Products:**

- Frontend uses slug in URL: `/products/laptop-pro-2024`
- Backend accepts slug OR ID: `GET /api/products/laptop-pro-2024`
- **No mapping needed** (backend handles both)

**Categories:**

- Frontend uses slug in URL: `/products?category=electronics`
- Backend needs ID for filtering: `GET /api/products?categoryId=cat123`
- **Mapping needed** (frontend converts slug → ID)

### Why the Difference?

**Products `findOne`:**

```typescript
async findOne(idOrSlug: string) {
  return await this.prisma.product.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });
}
```

✅ Backend accepts both

**Products `findAll` (filtering):**

```typescript
if (categoryId) {
  where.categoryId = categoryId; // Only ID, not slug
}
```

❌ Only accepts ID

**Categories `findOne`:**

```typescript
async findOne(idOrSlug: string) {
  return await this.prisma.category.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });
}
```

✅ Backend accepts both

**But filtering:**

```typescript
if (categoryId) {
  where.categoryId = categoryId; // Only ID
}
```

❌ Only accepts ID

### Could We Unify?

**Yes!** Backend could be modified to accept category slug in filtering:

```typescript
// Proposed change
if (filters.category) {
  // Try slug first, then ID
  const category = await this.prisma.category.findFirst({
    where: {
      OR: [{ slug: filters.category }, { id: filters.category }],
    },
  });
  if (category) {
    where.categoryId = category.id;
  }
}
```

**Trade-offs:**

- ✅ Eliminates frontend mapping
- ✅ Consistent with product behavior
- ❌ Extra database query per filter (could cache)

**Current approach is fine** - mapping is done once on frontend, reused for all filters.

---

## 11. Form Handling

### Overview

**Tech stack:**

- **React Hook Form**: Form state management
- **Yup**: Schema validation
- **FormField**: Reusable field wrapper
- **FormErrorAlert**: Error display
- **useFormErrorHandler**: Standardized error handling
- **useFormDraft**: Automatic draft persistence

### Architecture

1. **Form Definition**

   ```typescript
   const form = useForm<ProductFormData>({
     resolver: yupResolver(productSchema),
     defaultValues: product ? toFormData(product) : getDefaultValues(),
   });
   ```

2. **Validation**

   - Frontend: Yup schema
   - Backend: class-validator DTOs
   - Both must match

3. **Error Handling**

   ```typescript
   const { handleError, clearError } = useFormErrorHandler();

   const onSubmit = async (data) => {
     try {
       await productApi.create(data);
     } catch (error) {
       handleError(error); // Extracts and sets form errors
     }
   };
   ```

### Reusable Components

**FormField:**

```typescript
<FormField label="Name" required error={errors.name?.message}>
  <Input {...register("name")} />
</FormField>
```

**FormErrorAlert:**

```typescript
<FormErrorAlert error={formError} onDismiss={clearError} dismissible />
```

### Draft Persistence

**useFormDraft:**

- Automatically saves form data to localStorage
- Restores on page reload
- Clears on successful submit

```typescript
useFormDraft("product-form", {
  watch,
  getValues,
  setValue,
  enabled: !isSubmitting,
});
```

### Backend Validation

**DTO with class-validator:**

```typescript
export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  // ...
}
```

**ValidationPipe** (in main.ts):

- Automatically validates all DTOs
- Returns 400 with error details if validation fails

---

## 12. Products and Variants Implementation

### Overview

**SKU-first model:**

- Every product has at least one variant
- Variants are the sellable units (SKU, price, stock)
- Products are containers that aggregate variant data

### Database Schema

**ProductVariant:**

```prisma
model ProductVariant {
  id        String          @id
  productId String
  sku       String          @unique  // ← Unique across ALL products
  price     Decimal
  stock     Int
  options   VariantOption[]
  image     String?
  images    String[]
}
```

**VariantOption:**

```prisma
model VariantOption {
  id               String         @id
  productVariantId String
  name             String         // e.g., "color", "size"
  value            String         // e.g., "Red", "Large"

  @@unique([productVariantId, name])
}
```

### Variant Options

**Storage:**

- Normalized in database (VariantOption table)
- Denormalized in API response (object: `{ color: "Red", size: "Large" }`)

**Common options:**

- `color` (prioritized in UI)
- `storage` (prioritized in UI)
- `size`
- Custom options (any string)

### Derived Fields

**Product aggregates variant data:**

- `effectiveStock`: Sum of all variant stocks
- `minPrice`: Lowest variant price
- `maxPrice`: Highest variant price
- `price`: Set to `minPrice` (backwards compatibility)

**Recalculation:**

- After variant create/update/delete
- Done in transaction
- Ensures consistency

### Frontend Variant Selection

**Product detail page:**

1. User selects options (color, size, etc.)
2. System finds matching variant
3. Shows variant-specific price, stock, images
4. Auto-repairs invalid selections (e.g., if "Red + Small" doesn't exist, switches to "Red + Large")

**Stock display:**

- Shows stock per option value
- "Red (10 in stock)" vs "Blue (5 in stock)"

### Cart Integration

**Cart items reference variants:**

- `variantId` is required
- Stock validation uses variant stock
- Price taken from current variant price

**Composite unique key:**

- `(cartId, productId, variantId)`
- Same variant added twice = quantity increased (not new item)

---

## 13. UploadThing Integration

### Overview

UploadThing handles file uploads for product and variant images. Provides secure, scalable file storage.

### Architecture

1. **Frontend Upload Component**

   - Uses `@uploadthing/react` hooks
   - `useUploadThing()` for upload functionality
   - `UploadButton` or `UploadDropzone` for UI

2. **Next.js API Route**

   - `/app/api/uploadthing/route.ts`
   - Handles upload requests
   - Validates file types and sizes

3. **Core Configuration**
   - `/app/api/uploadthing/core.ts`
   - Defines upload handlers
   - Sets file type restrictions

### Configuration

**Core setup:**

```typescript
export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      // Auth check
      const user = await getServerSession();
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // File uploaded successfully
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;
```

**Environment variables:**

- `UPLOADTHING_SECRET`: Server-side secret
- `NEXT_PUBLIC_UPLOADTHING_APP_ID`: Public app ID

### Usage in Forms

**VariantImagesUploader:**

```typescript
<VariantImagesUploader
  variantIndex={index}
  mainImage={variant?.image}
  galleryImages={variant?.images}
  setValue={setValue}
  trigger={trigger}
/>
```

**Upload flow:**

1. User selects files
2. Files uploaded to UploadThing
3. URLs returned
4. URLs stored in form state
5. Submitted with product/variant data

### Security

- **Authentication**: Only authenticated users can upload
- **File type validation**: Only images allowed
- **Size limits**: Max 4MB per file
- **Count limits**: Max 10 files per upload

---

## 14. Database Design

### Relationship Types

**One-to-Many (1:N):**

- User → Addresses
- User → Orders
- Category → Products
- Product → Variants
- Product → CartItems
- Variant → VariantOptions
- Cart → CartItems
- Order → OrderItems

**Many-to-Many (M:N):**

- Product ↔ Promotion (via PromotionProduct)
- Category ↔ Promotion (via PromotionCategory)

**One-to-One (1:1):**

- User → Cart (one cart per user)

### Unique Constraints

**Global uniqueness:**

- `User.email` (unique)
- `Category.slug` (unique)
- `Product.slug` (unique)
- `ProductVariant.sku` (unique across all products)

**Composite uniqueness:**

- `CartItem`: `@@unique([cartId, productId, variantId])`
- `VariantOption`: `@@unique([productVariantId, name])`

### Indexes

**Performance indexes:**

- `User.email`
- `Category.slug`, `Category.parentId`
- `Product.slug`, `Product.categoryId`, `Product.isActive`, `Product.effectiveStock`
- `ProductVariant.productId`, `ProductVariant.sku`

### Cascade Behaviors

**onDelete: Cascade**

- User deleted → Addresses deleted
- Product deleted → Variants deleted
- Variant deleted → VariantOptions deleted
- Cart deleted → CartItems deleted
- Order deleted → OrderItems deleted

**onDelete: SetNull**

- Product deleted → CartItems.productId set to null (preserve cart history)
- Variant deleted → Product.defaultVariantId set to null

---

## 15. Error Handling Architecture

### Backend Error Handling

**Exception Filters:**

1. **AllExceptionsFilter**: Catches all exceptions

   - Maps to standardized error response
   - Logs errors
   - Returns 500 for unexpected errors

2. **HttpExceptionFilter**: Catches HTTP exceptions
   - Returns proper status code
   - Formats error message

**Custom Exceptions:**

```typescript
export class ProductNotFoundException extends NotFoundException {
  constructor() {
    super("Product not found");
  }
}
```

**Prisma Error Mapping:**

- `P2002` (unique constraint) → `ConflictException`
- `P2025` (record not found) → `NotFoundException`

**Validation Errors:**

- `ValidationPipe` automatically validates DTOs
- Returns 400 with error details
- Format: `{ message: string[], error: string, statusCode: number }`

### Frontend Error Handling

**Axios Interceptors:**

```typescript
// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try token refresh
      try {
        await authApi.refresh();
        return apiClient.request(error.config);
      } catch {
        emitAuthExpired();
        throw error;
      }
    }
    return Promise.reject(error);
  }
);
```

**Error Extraction:**

```typescript
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    return message || error.message;
  }
  return "An unexpected error occurred";
}
```

**Form Error Handler:**

```typescript
export function useFormErrorHandler() {
  const { setError } = useForm();

  const handleError = (error: unknown) => {
    const message = extractErrorMessage(error);
    // Set form-level error or field-level errors
    setError("root", { message });
  };

  return { handleError, clearError };
}
```

### Error Response Format

**Standardized format:**

```typescript
{
  statusCode: number,
  message: string | string[],
  error: string,
  timestamp: string,
  path: string
}
```

**Benefits:**

- Consistent error format
- Easy to parse on frontend
- Includes context (path, timestamp)

---

## 16. Variant Handling

### Complete Flow

**Product Creation:**

1. Admin creates product with variants
2. Backend creates variants + options in transaction
3. Derived fields computed (minPrice, maxPrice, effectiveStock)
4. First variant set as default

**User Browsing:**

1. User views product detail page
2. Frontend loads product with all variants
3. User selects options (color, size, etc.)
4. System finds matching variant
5. Shows variant-specific price, stock, images

**Adding to Cart:**

1. User clicks "Add to Cart"
2. Frontend sends `variantId` + `quantity`
3. Backend validates variant stock
4. Creates/updates cart item with variant reference
5. Cart displays variant-specific info (color, size, etc.)

**Checkout:**

1. User proceeds to checkout
2. Backend loads cart items with variants
3. Atomic stock decrement per variant
4. Order items reference variants
5. Cart cleared after successful order

### Key Takeaways

- **SKU-first model**: Variants are sellable units
- **Options are flexible**: Key-value pairs (color, size, storage, etc.)
- **Stock is per-variant**: Not per-product
- **Cart items reference variants**: Not products
- **Derived fields aggregate**: variant data at product level
- **Frontend auto-repairs**: Invalid selections
- **Backend validates**: SKU uniqueness globally

---

## Summary

This documentation covers the complete architecture of the ShopHub e-commerce platform, including:

- **Data flow**: How data moves from backend to frontend
- **State management**: React Query for server state, Zustand for UI state
- **Security**: JWT authentication, user validation, httpOnly cookies
- **Data consistency**: Transactions, stock management, race condition prevention
- **User experience**: Optimistic updates, caching, form handling
- **Scalability**: Efficient queries, indexing, caching strategies

All systems work together to provide a secure, performant, and user-friendly e-commerce experience.

---

_Document generated from conversation history_
