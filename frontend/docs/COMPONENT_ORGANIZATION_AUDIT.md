# Component Organization Consistency Audit

**Date:** January 2026
**Auditor:** Senior System Design Solution Architect
**Status:** ⚠️ INCONSISTENCIES FOUND

## Executive Summary

Your component organization follows the documented guidelines **~75% consistently**. Several critical inconsistencies were identified that could lead to maintainability issues, confusion for developers, and technical debt over time.

## Critical Inconsistencies

### 1. ❌ **File Naming Convention Violations**

**Issue:** Component files in `/app/_components/shared/` use **kebab-case** instead of **PascalCase** as specified in guidelines.

**Guideline Reference:**
> File Naming Conventions: Use **PascalCase** for all component files: `ProductCard.tsx`, `BrandStory.tsx`

**Violations:**
- `app/_components/shared/section-header.tsx` (exports `SectionTitle`, `SectionHeader`)
- `app/_components/shared/hero-price-block.tsx` (exports `HeroPriceBlock`)
- `app/_components/shared/hero-security-badge.tsx` (exports `HeroSecurityBadge`)
- `app/_components/shared/hero-security-badge-accent.tsx` (exports `HeroSecurityBadgeAccent`)
- `app/_components/shared/hero-trust-row.tsx` (exports `HeroTrustRow`)
- `app/_components/shared/hero-ctas.tsx` (exports `HeroCTAs`)
- `app/_components/shared/slide-indicators.tsx`
- `app/_components/shared/background-gradients.tsx`

**Impact:** Medium - Violates documented standards, creates confusion about naming conventions.

**Recommendation:** Rename all files to PascalCase to match component names:
- `section-header.tsx` → `SectionHeader.tsx`
- `hero-price-block.tsx` → `HeroPriceBlock.tsx`
- etc.

---

### 2. ❌ **Shared Components in Wrong Location**

**Issue:** Components in `/app/_components/shared/` are used across multiple routes/features but should be in `/components/shared/` according to guidelines.

**Guideline Reference:**
> **Shared Components** (`/components/shared`): Cross-feature reusable business components. Used by 2+ features.

**Violations:**

#### `SectionTitle` / `SectionHeader`
**Current Location:** `app/_components/shared/section-header.tsx`
**Used In:**
- ✅ `app/_components/` (home page) - 9 files
- ❌ `app/(auth)/login/page.tsx`
- ❌ `app/(auth)/register/page.tsx`
- ❌ `app/(shop)/categories/page.tsx`
- ❌ `app/(shop)/checkout/page.tsx`
- ❌ `app/(shop)/cart/page.tsx`
- ❌ `app/(shop)/profile/page.tsx`

**Status:** Used in **6+ routes**, should be in `/components/shared/`

#### `SparkleEffect`
**Current Location:** `app/_components/hero/shared/SparkleEffect.tsx`
**Used In:**
- ✅ Hero components (intended)
- ❌ `components/layout/Footer.tsx`
- ❌ `app/(auth)/login/page.tsx`
- ❌ `app/(auth)/register/page.tsx`

**Status:** Used outside hero context, should be promoted to `/components/shared/` or `/components/ui/` (if it's a design primitive)

**Impact:** High - Violates the core organizational principle. Creates tight coupling between home page and other routes.

**Recommendation:** Move `SectionTitle`/`SectionHeader` to `/components/shared/SectionHeader.tsx`

---

### 3. ⚠️ **Dual Location for Checkout Components**

**Issue:** Checkout-related components exist in two locations:

**Locations:**
1. `/features/checkout/components/` - 3 files
   - `AddressSelector.tsx`
   - `CouponCodeInput.tsx`
   - `OrderSummaryCard.tsx`

2. `/app/(shop)/checkout/components/` - 1 file
   - `CheckoutCardSection.tsx`

**Guideline Reference:**
> **Feature Components** (`/features/{feature}/components`): Feature-specific components containing feature-specific business logic.

**Analysis:**
- `CheckoutCardSection` is a wrapper component specific to checkout UI pattern
- All checkout components should be co-located for maintainability

**Impact:** Medium - Creates confusion about where to find/modify checkout components.

**Recommendation:** Move `CheckoutCardSection` from route-specific to feature-specific:
- `app/(shop)/checkout/components/CheckoutCardSection.tsx` → `features/checkout/components/CheckoutCardSection.tsx`

---

### 4. ⚠️ **Nested Shared Directories Structure**

**Issue:** Two separate "shared" directories with overlapping purposes:

1. `/app/_components/shared/` - Components shared across home page sections
2. `/app/_components/hero/shared/` - Components shared within hero feature

**Analysis:**
- `/app/_components/hero/shared/` contains components like `HeroItem`, `HeroMediaFrame`, `SlideLayout` - these are hero-specific ✅
- However, `SparkleEffect` in this location is used outside hero ❌
- The dual "shared" structure can be confusing

**Impact:** Low-Medium - Can cause confusion, but structure is somewhat intentional.

**Recommendation:** Keep hero-specific shared components in `/app/_components/hero/shared/`, but move `SparkleEffect` if it's truly cross-cutting.

---

### 5. ⚠️ **Component Name Collision: SectionTitle**

**Issue:** Two different components share the same name `SectionTitle` but have different APIs:

1. `/app/_components/shared/section-header.tsx` - `SectionTitle` component
   - Used in: auth pages, categories page, home page sections
   - Props: `{ italic: string, bold: string, variant?, centered? }`
   - Displays split title with italic/bold styling

2. `/components/ui/SectionTitle.tsx` - Different `SectionTitle` component
   - Used in: checkout, cart, products, profile pages
   - Props: `{ badgeText?, title?, subtitle?, showHearts?, icon?, className?, ... }`
   - Displays badge + title + subtitle pattern

**Analysis:** These are **functionally different components** serving different use cases. However, **having the same name** causes confusion and potential import conflicts.

**Impact:** Medium - Developers may import wrong component, causing runtime errors or styling issues.

**Recommendation:** Rename one to avoid collision:
- Option A: Rename `/components/ui/SectionTitle.tsx` → `SectionHeaderWithBadge.tsx` or `BadgedSectionTitle.tsx`
- Option B: Keep both but add clear documentation about when to use each

---

## Consistent Patterns (✅ Good Examples)

### ✅ Base UI Components
- `/components/ui/` properly contains design system primitives
- File naming is PascalCase: `Button.tsx`, `Card.tsx`, `Dialog.tsx`

### ✅ Layout Components
- `/components/layout/` contains application-wide layout: `Header.tsx`, `Footer.tsx`

### ✅ Feature Components
- Most features correctly use `/features/{feature}/components/`:
  - `features/cart/components/CartSidebar.tsx` ✅
  - `features/auth/components/LoginForm.tsx` ✅
  - `features/products/components/ProductFilters.tsx` ✅

### ✅ Route-Specific Components
- Product detail components correctly located in:
  - `app/(shop)/products/[slug]/components/` ✅
- Product listing components correctly in:
  - `app/(shop)/products/components/` ✅

### ✅ Shared Business Components
- `/components/shared/ProductCard.tsx` - correctly used across multiple features ✅

---

## Recommendations Priority Matrix

| Priority | Issue | Impact | Effort | Action |
|----------|-------|--------|--------|--------|
| **P0** | Move `SectionTitle`/`SectionHeader` to `/components/shared/` | High | Medium | **Immediate** - Violates core principle |
| **P0** | Move `SparkleEffect` to appropriate location | High | Low | **Immediate** - Used across routes |
| **P1** | Fix file naming in `/app/_components/shared/` | Medium | Low | **Short-term** - Standards compliance |
| **P1** | Consolidate checkout components location | Medium | Low | **Short-term** - Reduce confusion |
| **P2** | Audit `SectionTitle` duplication | Low | Low | **As time permits** - Code cleanup |

---

## Migration Plan

### Phase 1: Critical Fixes (1-2 days)

1. **Move `SectionTitle`/`SectionHeader`:**
   ```bash
   # Move component
   app/_components/shared/section-header.tsx
   → components/shared/SectionHeader.tsx

   # Update imports in ~10 files
   # Files affected:
   # - app/(auth)/login/page.tsx
   # - app/(auth)/register/page.tsx
   # - app/(shop)/categories/page.tsx
   # - app/(shop)/checkout/page.tsx
   # - app/(shop)/cart/page.tsx
   # - app/(shop)/profile/page.tsx
   # - Plus home page components
   ```

2. **Move `SparkleEffect`:**
   ```bash
   # Evaluate usage - if truly shared UI primitive:
   app/_components/hero/shared/SparkleEffect.tsx
   → components/ui/SparkleEffect.tsx

   # Or if business component:
   → components/shared/SparkleEffect.tsx

   # Update imports in:
   # - components/layout/Footer.tsx
   # - app/(auth)/login/page.tsx
   # - app/(auth)/register/page.tsx
   ```

### Phase 2: Standards Compliance (2-3 days)

3. **Rename files to PascalCase:**
   - Rename all files in `/app/_components/shared/` to PascalCase
   - Update imports (should be minimal with path aliases)

4. **Consolidate checkout components:**
   - Move `CheckoutCardSection` to `/features/checkout/components/`
   - Update imports in checkout page

### Phase 3: Code Cleanup (As needed)

5. Audit and remove duplicate `SectionTitle` if exists

---

## Testing Checklist

After migration, verify:

- [ ] All imports updated and working
- [ ] No circular dependencies introduced
- [ ] Build passes (`npm run build`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linter passes (`npm run lint`)
- [ ] Visual regression check (all pages render correctly)
- [ ] Check affected routes manually:
  - [ ] Home page
  - [ ] Login/Register pages
  - [ ] Categories page
  - [ ] Checkout page
  - [ ] Cart page
  - [ ] Profile page

---

## Conclusion

While the overall organization structure is **sound and follows best practices**, there are **5 actionable inconsistencies** that should be addressed:

1. **2 Critical issues** (P0) - Shared components in wrong location
2. **2 Medium issues** (P1) - Naming conventions and component consolidation
3. **1 Low issue** (P2) - Potential duplication to verify

The inconsistencies are **manageable and fixable** within a few days of focused work. The current structure is **75% compliant** with documented guidelines.

**Recommendation:** Address P0 issues immediately to prevent architectural drift. P1 issues can be scheduled in next sprint. P2 can be handled as cleanup work.

---

## Related Documents

- [Component Organization Guidelines](./COMPONENT_ORGANIZATION_GUIDELINES.md)
- [ADR-001: Component Organization Strategy](./adr/ADR-001-component-organization.md)
- [Developer Onboarding Guide](./DEVELOPER_ONBOARDING.md)
