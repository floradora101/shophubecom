# Component Organization Guidelines

**Version:** 1.0
**Last Updated:** January 2026
**Status:** Active

## Overview

This document provides clear guidelines for organizing components in the ShopHub frontend codebase. Following these guidelines ensures consistency, maintainability, and easier navigation.

## Component Taxonomy

### 1. Base Components (`/components/ui`)

**Purpose:** Design system primitives with no business logic.

**Characteristics:**
- Pure UI components
- No feature-specific logic
- Highly reusable
- Examples: `Button`, `Input`, `Card`, `Dialog`, `Select`

**When to use:**
- Building a new UI primitive
- Component has no business logic
- Used across multiple features

**Example:**
```typescript
// components/ui/button.tsx
export function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}
```

### 2. Layout Components (`/components/layout`)

**Purpose:** Application-wide layout structure.

**Characteristics:**
- Used in root layouts
- Application-wide structure
- Examples: `Header`, `Footer`, `Sidebar`

**When to use:**
- Component defines page structure
- Used in root layout or multiple route groups

**Example:**
```typescript
// components/layout/header.tsx
export function Header() {
  return <header>...</header>;
}
```

### 3. Shared Components (`/components/shared`)

**Purpose:** Cross-feature reusable business components.

**Characteristics:**
- Contains business logic
- Used by 2+ features
- Examples: `ProductCard`, `OrderCard`, `AddressCard`

**When to use:**
- Component is used by multiple features
- Contains business logic but is reusable
- Not feature-specific

**Example:**
```typescript
// components/shared/product-card.tsx
export function ProductCard({ product }: { product: Product }) {
  // Used by products page, home page, search, etc.
  return <Card>...</Card>;
}
```

### 4. Feature Components (`/features/{feature}/components`)

**Purpose:** Feature-specific components with feature-specific logic.

**Characteristics:**
- Only used within the feature
- Contains feature-specific business logic
- Examples: `CartSidebar`, `ProductFilters`, `OrderSummary`

**When to use:**
- Component is specific to one feature
- Contains feature-specific logic
- Not reusable across features

**Example:**
```typescript
// features/cart/components/cart-sidebar.tsx
export function CartSidebar() {
  // Only used in cart feature
  return <Sidebar>...</Sidebar>;
}
```

### 5. Route Components (`/app/{route}/_components`)

**Purpose:** Route-specific components that are not reusable.

**Characteristics:**
- Only used in that specific route
- Page-specific implementations
- Examples: `HomeHero`, `ProductsBanner`

**Special Case - Root Route (`/app/_components`):**
- Components used only by the root home page (`app/page.tsx`)
- Contains home page-specific sections like `BrandStory`, `DepartmentTabs`, etc.
- If component is reused elsewhere, move to `components/shared` or appropriate feature

**When to use:**
- Component is specific to one route/page
- Not reusable
- Page-specific implementation
- For root route: use `/app/_components/` for home page components

**Example:**
```typescript
// app/(shop)/products/_components/products-banner.tsx
export function ProductsBanner() {
  // Only used on products page
  return <Banner>...</Banner>;
}

// app/_components/BrandStory.tsx
export function BrandStory() {
  // Only used on home page (app/page.tsx)
  return <Section>...</Section>;
}
```

## Placement Decision Tree

```
Is it a design system primitive?
├─ Yes → /components/ui
└─ No
   └─ Is it layout-related?
      ├─ Yes → /components/layout
      └─ No
         └─ Is it used by 2+ features?
            ├─ Yes → /components/shared
            └─ No
               └─ Is it feature-specific?
                  ├─ Yes → /features/{feature}/components
                  └─ No → /app/{route}/_components
```

## Migration Checklist

When moving a component, ensure:

- [ ] Component is classified correctly
- [ ] All imports are updated
- [ ] Barrel exports (`index.ts`) are updated
- [ ] Component is tested after move
- [ ] No circular dependencies introduced

## Barrel Exports

Use barrel exports for cleaner imports:

```typescript
// components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Card } from './card';

// Usage
import { Button, Input, Card } from '@/components/ui';
```

## Examples

### ✅ Correct Organization

```typescript
// components/ui/button.tsx - Base component
// components/shared/product-card.tsx - Used by products, home, search
// features/cart/components/cart-sidebar.tsx - Cart-specific
// app/(shop)/products/_components/products-banner.tsx - Route-specific
```

### ❌ Incorrect Organization

```typescript
// components/home/product-card.tsx - Should be in shared
// components/products/product-card.tsx - Should be in shared
// features/cart/components/product-card.tsx - Should be in shared
```

## File Naming Conventions

### Component Files
- Use **PascalCase** for all component files: `ProductCard.tsx`, `BrandStory.tsx`
- Match component name to file name: `export function ProductCard` → `ProductCard.tsx`
- Exception: Utility/non-component files can use kebab-case: `hero-utils.ts`

### Directories
- Use **kebab-case** for directories: `slide-bodies/`, `hero-slides/`
- Exception: Route groups use parentheses: `(shop)/`, `(auth)/`

### Examples
```typescript
// ✅ Correct
app/_components/BrandStory.tsx
app/_components/hero/slide-bodies/ProductSpotlightSlideBody.tsx
features/cart/components/CartSidebar.tsx

// ❌ Incorrect
app/_components/brand-story.tsx  // Should be PascalCase
app/_components/Hero/SlideBodies/  // Should be kebab-case
```

## Import Path Conventions

### Always Use Path Aliases (`@/`)
- ✅ Use `@/` aliases: `@/components/ui/button`
- ❌ Avoid relative imports when crossing route boundaries: `../../components`
- ✅ Relative imports OK within same feature/directory: `./shared/hero-price-block`

**Examples:**
```typescript
// ✅ Correct - absolute import
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/app/admin/products/_components/ProductForm";

// ✅ OK - relative within same directory structure
import { HeroPriceBlock } from "../../shared/hero-price-block";

// ❌ Incorrect - relative crossing route boundaries
import { ProductForm } from "../../_components/ProductForm";
```

## Best Practices

1. **Start with feature components** - If unsure, start in feature directory
2. **Promote when reused** - Move to shared when used by 2+ features
3. **Keep components small** - Extract sub-components when >300 lines
4. **Use barrel exports** - Cleaner imports
5. **Document complex components** - Add JSDoc comments
6. **Use absolute imports** - Prefer `@/` aliases over relative paths for cross-boundary imports
7. **Consistent naming** - PascalCase for components, kebab-case for directories

## Related Documents

- [ADR-001: Component Organization Strategy](./adr/ADR-001-component-organization.md)
- [Frontend System Architecture Refactoring Guide](../FRONTEND_SYSTEM_ARCHITECTURE_REFACTORING.md)
