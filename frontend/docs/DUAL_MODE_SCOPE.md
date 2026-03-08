# Dual Mode Scope

This document defines the supported frontend runtime scope for `NEXT_PUBLIC_USE_MOCKS` and `NEXT_PUBLIC_DEMO_CHECKOUT`.

## Runtime Modes

### `NEXT_PUBLIC_USE_MOCKS=true`
- Intended for storefront catalog development only.
- Supported domains use local mock-backed adapters instead of backend APIs.
- Unsupported domains must fail explicitly or remain unavailable instead of silently calling the backend.

### `NEXT_PUBLIC_USE_MOCKS=false`
- Uses backend-backed adapters for all supported domains.
- Real mode must never fall back to mock content when backend requests fail.

### `NEXT_PUBLIC_DEMO_CHECKOUT=true`
- Development-only overlay for order placement demos.
- This is not a full application mode.
- It only replaces final order creation and order-complete rendering for explicitly demo-created orders.

## Supported Scope Matrix

| Domain | Mock mode | Real mode | Notes |
| --- | --- | --- | --- |
| Homepage catalog data | Supported | Supported | Real mode returns safe empty state on failure; no mock fallback. |
| Product list and product detail core data | Supported | Supported | Backed by shared adapters. |
| Category helpers and category trees | Supported | Supported | Real-mode helper branches are implemented. |
| Coupons list and validation | Partially supported | Supported | Read flows are mock-backed; admin writes remain backend-only. |
| Product reviews | Read-only mock content only | Supported | Backend reviews API: list and create. Real mode uses `/products/:id/reviews`. |
| Auth | Backend-required | Supported | Auth is intentionally unavailable in mock mode. |
| Favorites sync | Local-only in mock mode | Supported | Backend sync is disabled when mocks are enabled. |
| Cart | Backend-required | Supported | Cart still depends on backend APIs. |
| Checkout | Demo-only / backend-required | Supported | `DEMO_CHECKOUT` is separate from mock mode and only covers order placement demo flow. |
| Order complete | Demo-only / backend-required | Supported | Real mode never falls back to demo orders. |
| Profile | Backend-required | Supported | Requires authenticated backend session. |
| Admin | Backend-required | Supported | Admin depends on auth and backend-managed data. |

## Implementation Rules

1. Shared adapters decide mock vs backend behavior. Page-level toggles are not allowed.
2. Real mode must fail closed: empty state, explicit unavailable state, or surfaced error. Never use mock fallback.
3. If a domain is backend-required, code should say so explicitly and avoid background backend calls during mock sessions.
4. Mock datasets must maintain valid IDs, slugs, and relationships.
5. Demo checkout is separate from general mock mode and must stay clearly labeled as development-only.

## Backend-Required Domains (By Contract)

The following domains are **intentionally backend-required**. They do not support mock mode and will show an explicit unavailable message or redirect when `USE_MOCKS=true`:

- **Auth**: Login, register, logout, session. Mock mode does not bootstrap backend auth.
- **Cart**: Server-owned cart (guest + user). Mock mode shows "Cart requires backend" message.
- **Checkout**: Order placement, saved addresses, coupon validation. Demo overlay (`DEMO_CHECKOUT`) only simulates final order creation; cart and addresses remain backend-backed.
- **Profile**: Account details, orders, saved addresses. Mock mode shows "Profile Unavailable In Mock Mode".
- **Admin**: All admin CRUD operations. Mock mode shows "Admin requires backend" message.

## Maintenance

- Keep this file updated whenever a new feature adds or removes mock support.
