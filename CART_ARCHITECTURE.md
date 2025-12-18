# Cart System Architecture

## Overview

The ShopHub cart system supports both **authenticated users** and **guest users** with automatic cart merging when a guest logs in. The system is designed to be stateless on the frontend, with the backend managing all cart state and identification.

### Key Features

- ✅ Guest cart support (stored server-side, identified via HttpOnly cookies)
- ✅ Authenticated user cart support (stored server-side, linked to user account)
- ✅ Automatic cart merging when guest logs in
- ✅ Optimistic UI updates for responsive UX
- ✅ Stock validation on all operations
- ✅ Support for products with and without variants
- ✅ Price snapshotting (unitPrice stored per cart item)
- ✅ React Query for server state management
- ✅ Functional optimistic updates to prevent cache conflicts

---

## Architecture Principles

### 1. Server-Owned State

The backend is the **single source of truth** for cart data. The frontend never stores cart data in local storage or client-side state. All cart operations go through the API, ensuring consistency and enabling cart persistence across devices for authenticated users.

### 2. Dual Identification System

- **Authenticated users**: Identified via JWT token in HttpOnly cookies
- **Guest users**: Identified via a secure guest token in HttpOnly cookies

Both identification methods are handled automatically by the backend, requiring no special logic on the frontend.

### 3. Automatic Cart Merging

When a guest user logs in, the backend automatically:

1. Detects the guest cart via the guest token cookie
2. Merges guest cart items into the user's cart
3. Validates stock availability during merge
4. Cleans up the guest cart and session
5. Removes the guest token cookie

The frontend invalidates the React Query cache on login/logout to fetch the merged cart.

### 4. Optimistic Updates with Safety

- Optimistic updates use **functional setQueryData** to prevent overwriting newer cache data
- Only optimistically update when item already exists (avoid fake items with missing product data)
- Always replace optimistic data with server response on success
- Rollback on error using previous cart state

---

## Backend Implementation

### Database Schema

#### Cart Model

```prisma
model Cart {
  id        String      @id @default(cuid())
  user      User?       @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String?     @unique  // null for guest carts
  items     CartItem[]
  session   CartSession?  // Only for guest carts
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}
```

**Key Points:**

- `userId` is nullable (null = guest cart, value = user cart)
- One cart per user (unique constraint on `userId`)
- Guest carts are linked to a `CartSession` for token-based identification

#### CartSession Model

```prisma
model CartSession {
  id        String   @id @default(cuid())
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  cartId    String   @unique
  tokenHash String   @unique  // SHA-256 hash of guest token
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([expiresAt])  // For cleanup of expired sessions
}
```

**Key Points:**

- Stores hashed guest token (never stores plaintext tokens)
- Expires after 30 days
- One session per guest cart (unique constraint on `cartId`)

#### CartItem Model

```prisma
model CartItem {
  id         String          @id @default(cuid())
  cart       Cart            @relation(fields: [cartId], references: [id], onDelete: Cascade)
  cartId     String
  product    Product         @relation(fields: [productId], references: [id])
  productId  String
  variant    ProductVariant? @relation(fields: [variantId], references: [id], onDelete: Cascade)
  variantId  String?
  quantity   Int             @default(1)
  unitPrice  Decimal         @db.Decimal(10, 2)  // Price snapshot at add time
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt

  @@unique([cartId, productId, variantId])  // Prevent duplicate items
  @@index([productId])
}
```

**Key Points:**

- `variantId` is nullable (null = product without variant)
- `unitPrice` snapshots price at add/update time (prevents price changes affecting cart)
- Unique constraint prevents duplicate product+variant combinations per cart
- Note: PostgreSQL treats NULL as distinct in unique constraints, so multiple rows with `variantId=NULL` for the same product are technically allowed. Consider a partial unique index for stricter enforcement.

### Services

#### CartIdentityService

**File:** `backend/src/cart/cart-identity.service.ts`

Handles guest token generation, hashing, and cookie management.

**Key Methods:**

- `generateGuestToken()`: Creates a secure 32-byte random hex token
- `hashToken(token)`: SHA-256 hash for secure storage
- `setGuestTokenCookie(res, token)`: Sets HttpOnly cookie (30-day expiration)
- `clearGuestTokenCookie(res)`: Removes guest token cookie
- `getGuestTokenFromCookie(req)`: Extracts token from request cookies

**Security:**

- Tokens are hashed before database storage (never store plaintext)
- HttpOnly cookies prevent XSS attacks
- Secure flag in production (HTTPS only)
- SameSite=Lax for CSRF protection

#### CartService

**File:** `backend/src/cart/cart.service.ts`

Core cart business logic.

**Key Methods:**

##### `resolveOrCreateCart(reqUserId?, req?, res?)`

**The heart of the cart system.** Handles both authenticated and guest cart resolution.

**Authenticated User Flow:**

1. Upsert user cart (create if doesn't exist)
2. If guest token exists (user added items before login):
   - Look up guest cart via token hash
   - If guest cart has items and is different from user cart:
     - Merge guest cart into user cart (with stock validation)
     - Delete guest cart and session
     - Clear guest token cookie
3. Return user cart with merged items

**Guest User Flow:**

1. Extract guest token from cookie
2. If token exists and session is valid:
   - Return existing guest cart
3. Otherwise:
   - Generate new guest token
   - Create new cart (userId = null)
   - Create CartSession with token hash
   - Set guest token cookie
   - Return new cart

**Transaction Isolation:**
Uses `Serializable` isolation level for authenticated user path to prevent race conditions during cart merging.

##### `mergeCarts(tx, fromCartId, toCartId)`

Merges items from guest cart into user cart.

**Merge Logic:**

1. Load source cart with all product/variant relations
2. Load target cart items and build lookup map (key: "productId:variantId")
3. For each source item:
   - Skip inactive products
   - Determine available stock (variant stock or product stock)
   - Calculate how much can be added: `min(item.quantity, max(0, availableStock - existingQtyInTarget))`
   - If quantity > 0:
     - Upsert target cart item (increment if exists, create if new)
     - Update price to current price at merge time
     - Update lookup map for subsequent iterations
4. Delete all items from source cart (cart itself deleted by caller)

**Stock Validation:**

- Ensures merged quantities don't exceed available stock
- Respects quantities already in target cart
- Gracefully handles stock exhaustion (skips items that can't be merged)

##### `addItem(reqUserId?, dto, req?, res?)`

Adds item to cart with stock validation.

**Features:**

- Supports products with variants (requires `variantId`)
- Supports products without variants (requires `productId`, validates no variants exist)
- Validates product is active
- Validates stock availability (existing quantity + new quantity)
- Updates existing items (increments quantity) or creates new items
- Updates `unitPrice` to current price on add/update

**Transaction Safety:**
Uses Prisma transactions to ensure atomic operations.

##### `updateItem(reqUserId?, itemId, dto, req?, res?)`

Updates cart item quantity.

**Features:**

- Validates stock availability
- Updates `unitPrice` to current price (snapshot)
- Handles both variant and non-variant items

##### `removeItem(reqUserId?, itemId, req?, res?)`

Removes item from cart.

**Features:**

- Validates item belongs to cart
- Returns updated cart

##### `clearCart(reqUserId?, req?, res?)`

Clears all items from cart.

**Features:**

- Deletes all cart items
- Returns empty cart structure

##### `toCartResponse(cart)`

Transforms Prisma cart model to `CartResponseDto`.

**Calculations:**

- `subtotal`: Sum of (unitPrice × quantity) for all items
- `totalQuantity`: Sum of all item quantities
- Transforms variant options array to key-value object

### Controller

**File:** `backend/src/cart/cart.controller.ts`

REST API endpoints.

**Guard:** `OptionalJwtAuthGuard` - Allows both authenticated and guest access

**Endpoints:**

- `GET /cart` - Get current cart
- `POST /cart/items` - Add item to cart
- `PATCH /cart/items/:itemId` - Update item quantity
- `DELETE /cart/items/:itemId` - Remove item from cart
- `DELETE /cart` - Clear cart

**Request Flow:**

1. `OptionalJwtAuthGuard` extracts JWT (if present) → sets `req.user`
2. Controller extracts `user?.id` (undefined for guests)
3. Passes `user?.id`, `req`, `res` to service methods
4. Service handles identification via JWT (user) or cookies (guest)

### DTOs

#### CartResponseDto

```typescript
{
  id: string;
  userId: string | null;
  items: CartItemDto[];
  subtotal: number;
  totalQuantity: number;
  createdAt?: string;
  updatedAt?: string;
}
```

#### CartItemDto

```typescript
{
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    images: string[];
  };
  variant?: {
    id: string;
    sku: string;
    price: number;
    stock: number;
    image?: string | null;
    images?: string[];
    options?: Record<string, string>;  // e.g., { Color: "Red", Storage: "256GB" }
  };
}
```

---

## Frontend Implementation

### State Management Strategy

#### React Query (Server State)

**File:** `frontend/lib/queries/cart.ts`

React Query owns all cart data. Single query key: `["cart"]`.

**Query Configuration:**

- `staleTime: 30_000` (30 seconds) - Reduces over-fetching
- `refetchOnMount: false` - Relies on cache + invalidation
- `refetchOnWindowFocus: false` - Not needed (invalidation handles freshness)
- `enabled: true` - Always enabled (works for both guest and authenticated)

**Mutations with Optimistic Updates:**

All mutations use functional `setQueryData` to prevent cache conflicts:

```typescript
queryClient.setQueryData<Cart>(queryKey, (prev) => {
  if (!prev) return prev;
  return { ...prev /* updates */ };
});
```

**useAddCartItemMutation:**

- Optimistically updates only if item already exists (avoids fake items with `unitPrice=0`)
- Skips optimistic add for new items (waits for server response)
- Updates `totalQuantity` optimistically
- Updates `subtotal` only if `unitPrice > 0` is available

**useUpdateCartItemMutation:**

- Optimistically updates quantity and `totalQuantity`
- Updates `subtotal` only if reliable `unitPrice` available

**useRemoveCartItemMutation:**

- Optimistically removes item, updates `totalQuantity` and `subtotal`

**useClearCartMutation:**

- Optimistically clears all items, zeros totals

**Error Handling:**
All mutations rollback on error using `context.previousCart`.

**Success Handling:**
All mutations replace optimistic data with server response on success.

#### Zustand (UI State Only)

**File:** `frontend/store/cart-store.ts`

Zustand only stores UI state:

- `isOpen`: Whether cart sidebar is open

Cart data is NOT stored in Zustand - React Query is the single source of truth.

### Cart Hooks

#### useCartQuery()

**File:** `frontend/lib/queries/cart.ts`

Fetches current cart. Always enabled, works for both guest and authenticated users.

**Key Points:**

- Backend handles identification automatically
- No auth state checks needed
- Query key: `["cart"]`

#### useCart()

**File:** `frontend/lib/hooks/use-cart.ts`

Main cart hook for components.

**Returns:**

- `items`: Cart items (transformed from server format)
- `totalItems`: Total quantity
- `subtotal`: Cart subtotal
- `isOpen`: Cart sidebar state
- `isLoading`: Loading state
- `isAuthenticated`: Auth state
- Actions: `addItem`, `updateQuantity`, `removeItem`, `clearCart`, `openCart`, `closeCart`, `toggleCart`

**Item Transformation:**
Server items are transformed to UI format:

- Uses `serverItem.id` as stable identifier
- Extracts product/variant data (name, price, images, options)
- Handles missing product data gracefully

### API Client

**File:** `frontend/lib/api/cart.ts`

Axios-based API client for cart operations.

**Methods:**

- `getCart()`: GET /cart
- `addItem(params)`: POST /cart/items
- `updateItem(itemId, params)`: PATCH /cart/items/:itemId
- `removeItem(itemId)`: DELETE /cart/items/:itemId
- `clearCart()`: DELETE /cart

**Features:**

- Automatic cookie handling (guest token, JWT)
- Error handling
- Development logging

### Auth Integration

**File:** `frontend/components/providers/AuthProvider.tsx`

**Cart Invalidation on Auth Changes:**

```typescript
useEffect(() => {
  const currentUserId = user?.id ?? null;
  const previousUserId = previousUserIdRef.current;

  // Skip first render
  if (!hasTrackedFirstRender.current) {
    hasTrackedFirstRender.current = true;
    previousUserIdRef.current = currentUserId;
    return;
  }

  // Invalidate cart when user id changes (login: null->id, logout: id->null)
  if (previousUserId !== currentUserId) {
    queryClient.invalidateQueries({ queryKey: cartKeys.all });
  }

  previousUserIdRef.current = currentUserId;
}, [user?.id, queryClient]);
```

**Why This Works:**

1. **On Login (null → id):**

   - Backend merges guest cart into user cart
   - Frontend invalidates React Query cache
   - Next `useCartQuery()` call fetches merged cart from server

2. **On Logout (id → null):**
   - Backend creates new guest cart (or returns existing if guest token exists)
   - Frontend invalidates React Query cache
   - Next `useCartQuery()` call fetches guest cart from server

---

## Data Flow

### Guest Adding Item to Cart

```
1. User (guest) clicks "Add to Cart"
   ↓
2. Frontend: useAddCartItemMutation.mutate()
   ↓
3. Optimistic Update (if item exists in cart)
   ↓
4. API: POST /cart/items (with guest token cookie)
   ↓
5. Backend: CartService.addItem()
   - resolveOrCreateCart() → finds/creates guest cart via cookie
   - Validates product/variant and stock
   - Adds item to cart
   ↓
6. Returns CartResponseDto
   ↓
7. Frontend: onSuccess → setQueryData (replaces optimistic update)
```

### Guest Logging In (Cart Merge)

```
1. User (guest) logs in
   ↓
2. Frontend: AuthProvider detects userId change (null → id)
   ↓
3. Frontend: invalidateQueries(["cart"])
   ↓
4. Backend: AuthController.login() sets JWT cookie
   ↓
5. Next cart operation (or manual refetch):
   ↓
6. API: GET /cart (with JWT cookie + guest token cookie)
   ↓
7. Backend: CartService.resolveOrCreateCart()
   - Detects authenticated user (JWT valid)
   - Finds/creates user cart
   - Detects guest token cookie
   - Looks up guest cart via token hash
   - mergeCarts() → merges guest items into user cart
   - Validates stock during merge
   - Deletes guest cart and session
   - Clears guest token cookie
   ↓
8. Returns merged CartResponseDto
   ↓
9. Frontend: React Query caches merged cart
```

### Authenticated User Adding Item

```
1. User (authenticated) clicks "Add to Cart"
   ↓
2. Frontend: useAddCartItemMutation.mutate()
   ↓
3. Optimistic Update (if item exists)
   ↓
4. API: POST /cart/items (with JWT cookie)
   ↓
5. Backend: CartService.addItem()
   - resolveOrCreateCart() → finds/creates user cart via JWT
   - Validates product/variant and stock
   - Adds item to cart
   ↓
6. Returns CartResponseDto
   ↓
7. Frontend: onSuccess → setQueryData (replaces optimistic update)
```

### Authenticated User Logging Out

```
1. User clicks "Logout"
   ↓
2. Frontend: AuthProvider detects userId change (id → null)
   ↓
3. Frontend: invalidateQueries(["cart"])
   ↓
4. Backend: AuthController.logout() clears JWT cookie
   ↓
5. Next cart operation (or manual refetch):
   ↓
6. API: GET /cart (no JWT, but may have guest token from previous session)
   ↓
7. Backend: CartService.resolveOrCreateCart()
   - No authenticated user detected
   - Looks up guest cart via cookie (if exists) OR creates new guest cart
   ↓
8. Returns guest CartResponseDto
   ↓
9. Frontend: React Query caches guest cart
```

---

## Security Considerations

### Guest Token Security

1. **Hashed Storage**: Guest tokens are hashed (SHA-256) before database storage
2. **HttpOnly Cookies**: Prevents XSS attacks (JavaScript cannot access token)
3. **Secure Flag**: In production, cookies are HTTPS-only
4. **SameSite=Lax**: Provides CSRF protection
5. **Expiration**: Guest sessions expire after 30 days
6. **Random Generation**: Tokens are cryptographically random (32 bytes)

### JWT Security

1. **HttpOnly Cookies**: JWT stored in HttpOnly cookie (same as guest token)
2. **Signature Validation**: Backend validates JWT signature
3. **Expiration Check**: Backend validates JWT expiration
4. **User Verification**: Backend verifies user still exists in database

### Stock Validation

1. **Server-Side Only**: All stock checks happen on the backend
2. **Transaction Safety**: Stock validation happens within database transactions
3. **Merge Safety**: Cart merging validates stock before merging items
4. **Atomic Operations**: Add/update operations are atomic (prevent race conditions)

### Authorization

1. **Cart Ownership**: Backend validates cart ownership for all operations
2. **Item Ownership**: Backend validates item belongs to cart before update/delete
3. **Optional Auth**: `OptionalJwtAuthGuard` allows guest access without errors

---

## Performance Optimizations

### Backend

1. **Database Indexes:**

   - `Cart.userId` (unique index) - Fast user cart lookup
   - `CartSession.tokenHash` (unique index) - Fast guest cart lookup
   - `CartSession.expiresAt` (index) - Fast expired session cleanup
   - `CartItem.productId` (index) - Fast product lookups

2. **Transaction Isolation:**

   - Uses `Serializable` isolation only for cart merging (prevents race conditions)
   - Other operations use default isolation (better performance)

3. **Eager Loading:**

   - Cart queries include product and variant relations (reduces N+1 queries)
   - Single query loads all cart data with relations

4. **Session Expiration:**
   - Guest sessions expire after 30 days (prevents database bloat)
   - Cleanup can be scheduled (not implemented yet)

### Frontend

1. **React Query Caching:**

   - `staleTime: 30_000` - Reduces unnecessary refetches
   - `refetchOnMount: false` - Uses cache when available
   - Functional updates prevent cache conflicts

2. **Optimistic Updates:**

   - Immediate UI feedback
   - Only updates when safe (existing items)
   - Always replaced with server response

3. **Query Invalidation:**

   - Only invalidates on auth changes (login/logout)
   - Not on every route change

4. **Selective Re-renders:**
   - Zustand selectors prevent unnecessary re-renders
   - React Query selectors optimize data access

---

## Testing Considerations

### Backend Tests

**Key Scenarios:**

1. Guest cart creation and retrieval
2. Authenticated user cart creation and retrieval
3. Cart merging on login (with stock validation)
4. Stock validation on add/update
5. Item uniqueness enforcement
6. Price snapshotting
7. Guest session expiration
8. Transaction isolation during merge

### Frontend Tests

**Key Scenarios:**

1. Optimistic updates for existing items
2. Skipping optimistic updates for new items
3. Error rollback
4. Cache invalidation on login/logout
5. Cart persistence across page refreshes (guest and authenticated)

---

## Future Improvements

1. **Partial Unique Index for NULL variantId:**

   ```sql
   CREATE UNIQUE INDEX ON "CartItem" (cartId, productId) WHERE "variantId" IS NULL;
   ```

   This would enforce uniqueness for products without variants at the database level.

2. **Guest Session Cleanup:**

   - Scheduled job to delete expired sessions
   - Prevents database bloat

3. **Cart Abandonment:**

   - Track last activity timestamp
   - Send reminders for abandoned carts

4. **Cart Sharing:**

   - Allow users to share cart links
   - Temporary access tokens for shared carts

5. **Multi-Device Sync:**
   - Real-time updates for authenticated users
   - WebSocket support for live cart updates

---

## Summary

The ShopHub cart system is a robust, secure, and performant implementation that seamlessly handles both guest and authenticated users. The key architectural decisions are:

1. **Server-owned state** - Ensures consistency and persistence
2. **Dual identification** - JWT for users, cookies for guests
3. **Automatic merging** - Seamless guest-to-user transition
4. **Optimistic updates** - Responsive UI with safety guarantees
5. **Stock validation** - Server-side validation prevents overselling
6. **Price snapshotting** - Protects against price changes

The system is designed to scale and can handle high traffic with proper database indexing and caching strategies.
