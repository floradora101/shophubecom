# Unused API Endpoints Analysis

## Summary

I've analyzed all backend API endpoints and compared them with frontend usage. Found **2 potentially unused endpoints**.

---

## Unused Endpoints

### 1. `GET /api` (Root endpoint - Health check)

- **Controller**: `AppController`
- **Route**: `GET /api`
- **Purpose**: Returns "Hello World" - appears to be a health check endpoint
- **Status**: ⚠️ **POTENTIALLY UNUSED**
- **Usage**: Not found in any frontend API calls
- **Recommendation**: Keep for health checks/monitoring, or remove if not needed

### 2. `POST /api/orders` (Create order directly)

- **Controller**: `OrdersController`
- **Route**: `POST /api/orders`
- **Purpose**: Creates a new order for authenticated user
- **Status**: ⚠️ **UNUSED** (Alternative endpoint is used)
- **Usage**: Frontend uses `/api/checkout/place-order` instead
- **Recommendation**: Consider removing this endpoint since checkout flow is handled via `/checkout/place-order`

---

## Missing Endpoint (Referenced but doesn't exist)

### `POST /api/users/change-password`

- **Referenced in**: `frontend/features/profile/api.ts` (line 42)
- **Status**: ❌ **DOES NOT EXIST IN BACKEND**
- **Impact**: Profile password change feature will fail
- **Recommendation**: Either implement this endpoint in `UsersController` or remove the frontend call

---

## All Used Endpoints (for reference)

### Auth (`/api/auth`)

- ✅ POST `/auth/register` - Used
- ✅ POST `/auth/login` - Used
- ✅ POST `/auth/logout` - Used
- ✅ POST `/auth/refresh` - Used (automatic via interceptor)
- ✅ POST `/auth/forgot-password` - Used
- ✅ POST `/auth/reset-password` - Used
- ✅ GET `/auth/me` - Used

### Products (`/api/products`)

- ✅ GET `/products` - Used
- ✅ GET `/products/featured` - Used
- ✅ GET `/products/latest` - Used
- ✅ GET `/products/:id` - Used
- ✅ POST `/products` - Used (admin)
- ✅ PUT `/products/:id` - Used (admin)
- ✅ DELETE `/products/:id` - Used (admin)

### Categories (`/api/categories`)

- ✅ GET `/categories` - Used
- ✅ GET `/categories/:id` - Used
- ✅ POST `/categories` - Used (admin)
- ✅ PUT `/categories/:id` - Used (admin)
- ✅ DELETE `/categories/:id` - Used (admin)

### Cart (`/api/cart`)

- ✅ GET `/cart` - Used
- ✅ POST `/cart/items` - Used
- ✅ PATCH `/cart/items/:itemId` - Used
- ✅ DELETE `/cart/items/:itemId` - Used
- ✅ DELETE `/cart` - Used

### Checkout (`/api/checkout`)

- ✅ POST `/checkout/place-order` - Used

### Orders (`/api/orders`)

- ✅ GET `/orders` - Used
- ✅ GET `/orders/stats` - Used
- ✅ GET `/orders/:id` - Used
- ❌ POST `/orders` - **UNUSED** (checkout/place-order is used instead)

### Admin Orders (`/api/admin/orders`)

- ✅ GET `/admin/orders` - Used
- ✅ PATCH `/admin/orders/:id/status` - Used

### Addresses (`/api/addresses`)

- ✅ GET `/addresses` - Used
- ✅ GET `/addresses/:id` - Used
- ✅ POST `/addresses` - Used
- ✅ PUT `/addresses/:id` - Used
- ✅ DELETE `/addresses/:id` - Used

### Users (`/api/users`)

- ✅ GET `/users/profile` - Used
- ✅ PUT `/users/profile` - Used
- ❌ POST `/users/change-password` - **DOES NOT EXIST** (referenced in frontend)

### Admin Dashboard (`/api/admin`)

- ✅ GET `/admin/stats` - Used
- ✅ GET `/admin/orders/recent` - Used (via dashboard API)
- ✅ GET `/admin/products/low-stock` - Used
- ✅ GET `/admin/products/top` - Used
- ✅ GET `/admin/sales-data` - Used

---

## Recommendations

1. **Remove unused `POST /api/orders`** - The checkout flow uses `/checkout/place-order` instead
2. **Implement `POST /api/users/change-password`** - Frontend references this but it doesn't exist
3. **Keep `GET /api`** - Useful for health checks/monitoring, unless you have a dedicated health endpoint
