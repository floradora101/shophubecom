# Guard Configuration Guide

This document outlines the correct application of authentication and authorization guards for the e-commerce application.

## Rules (Enterprise Best Practice)

1. **Customer Profile / "My Account" Pages**:
   - Must be accessible by ANY authenticated user (ADMIN or CUSTOMER)
   - Use `JwtAuthGuard` only
   - Do NOT use `@Roles(CUSTOMER)` - this would exclude ADMIN users

2. **Admin Pages**:
   - Must be ADMIN-only
   - Use `JwtAuthGuard` + `RolesGuard` with `@Roles('ADMIN')`

## Current Guard Configuration

### ✅ Correctly Configured Controllers

#### 1. Users Controller (`/api/users`)

**Purpose**: Customer profile endpoints ("My Account")

- **Controller Level**: `@UseGuards(JwtAuthGuard)` ✅
- **Endpoints**:
  - `GET /api/users/profile` - Get user profile (any authenticated user)
  - `PUT /api/users/profile` - Update user profile (any authenticated user)
- **Status**: ✅ CORRECT - Uses only JwtAuthGuard, accessible to ADMIN and CUSTOMER

#### 2. Addresses Controller (`/api/addresses`)

**Purpose**: User address management (customer profile feature)

- **Controller Level**: `@UseGuards(JwtAuthGuard)` ✅
- **Endpoints**: All CRUD operations for addresses
- **Status**: ✅ CORRECT - Uses only JwtAuthGuard, accessible to ADMIN and CUSTOMER

#### 3. Orders Controller (`/api/orders`)

**Purpose**: Order management (customer profile + admin)

- **Controller Level**: `@UseGuards(JwtAuthGuard)` ✅
- **Customer Profile Endpoints** (any authenticated user):
  - `POST /api/orders` - Create order ✅
  - `GET /api/orders` - Get user's orders ✅
  - `GET /api/orders/stats` - Get user stats ✅
  - `GET /api/orders/:id` - Get single order ✅
- **Admin Endpoints** (ADMIN only):
  - `GET /api/orders/admin` - `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` ✅
  - `PATCH /api/orders/:id/status` - `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` ✅
- **Status**: ✅ CORRECT - Customer endpoints use JwtAuthGuard only, admin endpoints add RolesGuard

#### 4. Auth Controller (`/api/auth`)

**Purpose**: Authentication endpoints

- **Controller Level**: No guard (public endpoints)
- **Customer Profile Endpoint**:
  - `GET /api/auth/me` - `@UseGuards(JwtAuthGuard)` ✅ (any authenticated user)
- **Public Endpoints**: login, register, logout, refresh, forgot-password, reset-password
- **Status**: ✅ CORRECT

#### 5. Admin Controller (`/api/admin`)

**Purpose**: Admin dashboard and management

- **Controller Level**: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` ✅
- **All Endpoints**: ADMIN-only
  - `GET /api/admin/stats`
  - `GET /api/admin/orders/recent`
  - `GET /api/admin/products/low-stock`
  - `GET /api/admin/products/top`
- **Status**: ✅ CORRECT - All endpoints are ADMIN-only

#### 6. Products Controller (`/api/products`)

**Purpose**: Product browsing and management

- **Controller Level**: No guard (public endpoints)
- **Public Endpoints**:
  - `GET /api/products` - `@UseGuards(OptionalJwtAuthGuard)` ✅ (public, optional auth)
  - `GET /api/products/featured` - Public ✅
  - `GET /api/products/latest` - Public ✅
  - `GET /api/products/:id` - Public ✅
- **Admin Endpoints** (ADMIN only):
  - `POST /api/products` - `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` ✅
  - `PUT /api/products/:id` - `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` ✅
  - `DELETE /api/products/:id` - `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` ✅
- **Status**: ✅ CORRECT

#### 7. Categories Controller (`/api/categories`)

**Purpose**: Category browsing and management

- **Controller Level**: No guard (public endpoints)
- **Public Endpoints**:
  - `GET /api/categories` - Public ✅
  - `GET /api/categories/:id` - Public ✅
- **Admin Endpoints** (ADMIN only):
  - `POST /api/categories` - `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` ✅
  - `PUT /api/categories/:id` - `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` ✅
  - `DELETE /api/categories/:id` - `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` ✅
- **Status**: ✅ CORRECT

#### 8. Cart Controller (`/api/cart`)

**Purpose**: Shopping cart management

- **Controller Level**: `@UseGuards(OptionalJwtAuthGuard)` ✅
- **Status**: ✅ CORRECT - Allows both authenticated and guest users

#### 9. Checkout Controller (`/api/checkout`)

**Purpose**: Order placement

- **Controller Level**: `@UseGuards(OptionalJwtAuthGuard)` ✅
- **Status**: ✅ CORRECT - Allows both authenticated and guest checkout

## Summary

✅ **All controllers are correctly configured according to enterprise best practices!**

### Key Points:

1. **Customer profile endpoints** (`/users`, `/addresses`, `/orders` customer routes, `/auth/me`) use only `JwtAuthGuard` - accessible to both ADMIN and CUSTOMER
2. **Admin endpoints** (`/admin/*`, product/category/order admin routes) use `JwtAuthGuard` + `RolesGuard` + `@Roles('ADMIN')` - ADMIN-only
3. **Public endpoints** (product browsing, categories) have no guards or use `OptionalJwtAuthGuard`
4. **No incorrect `@Roles('CUSTOMER')` usage** - customer profile pages are accessible to all authenticated users

## Guard Usage Patterns

### Pattern 1: Customer Profile (Any Authenticated User)

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard) // No RolesGuard, no @Roles
export class UsersController {
  // Accessible to ADMIN and CUSTOMER
}
```

### Pattern 2: Admin Only

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  // ADMIN-only
}
```

### Pattern 3: Mixed (Customer Profile + Admin Routes)

```typescript
@Controller('orders')
@UseGuards(JwtAuthGuard) // Base: any authenticated user
export class OrdersController {
  // Customer profile routes inherit JwtAuthGuard

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard) // Override: add RolesGuard
  @Roles('ADMIN')
  findAllAdmin() {
    // ADMIN-only
  }
}
```

## Verification Checklist

- [x] Users controller uses only JwtAuthGuard
- [x] Addresses controller uses only JwtAuthGuard
- [x] Orders customer routes use only JwtAuthGuard
- [x] Orders admin routes use JwtAuthGuard + RolesGuard + @Roles('ADMIN')
- [x] Admin controller uses JwtAuthGuard + RolesGuard + @Roles('ADMIN')
- [x] Products admin routes use JwtAuthGuard + RolesGuard + @Roles('ADMIN')
- [x] Categories admin routes use JwtAuthGuard + RolesGuard + @Roles('ADMIN')
- [x] No @Roles('CUSTOMER') decorators found
- [x] Auth /me endpoint uses only JwtAuthGuard

**Result**: ✅ All guards are correctly applied!



