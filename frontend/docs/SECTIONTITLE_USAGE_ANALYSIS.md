# SectionTitle Component Usage Analysis

**Date:** January 2026
**Purpose:** Document all usages of `SectionTitle` components before making them consistent

---

## Overview

There are **TWO different** `SectionTitle` components with different APIs:

### Component 1: `SectionTitle` from `/components/shared/SectionHeader.tsx`
**API:** `{ italic: string, bold: string, variant?, centered?, className? }`
**Style:** Italic/Bold split text styling
**Usage Pattern:** Displays text like "Welcome Back" with italic "Welcome" and bold "Back"

### Component 2: `SectionTitle` from `/components/ui/SectionTitle.tsx` (BadgedSectionTitle)
**API:** `{ badgeText?, title?, subtitle?, showHearts?, icon?, className?, ... }`
**Style:** Badge + Title + Subtitle pattern
**Usage Pattern:** Displays badge with icon, main title, and subtitle description

---

## Detailed Usage Breakdown

### ✅ Using `SectionTitle` from `/components/shared/SectionHeader.tsx` (Italic/Bold Split)

#### 1. **Home Page Components** (6 files)

##### 1.1 `app/_components/BrandStory.tsx`
**Import:**
```typescript
import { SectionHeader, SectionTitle } from "@/components/shared/SectionHeader";
```
**Usage:**
- Uses `SectionHeader` component (which internally uses `SectionTitle`)
- Not directly using `SectionTitle` standalone

**Status:** ✅ Correct usage

---

##### 1.2 `app/_components/DepartmentTabs.tsx`
**Import:**
```typescript
import { SectionHeader, SectionTitle } from "@/components/shared/SectionHeader";
```
**Usage:**
- Uses `SectionHeader` component with badge and title
- Not directly using `SectionTitle` standalone

**Status:** ✅ Correct usage

---

##### 1.3 `app/_components/TrendingNow.tsx`
**Import:**
```typescript
import { SectionHeader, SectionTitle } from "@/components/shared/SectionHeader";
```
**Usage:**
- Uses `SectionHeader` component
- Not directly using `SectionTitle` standalone

**Status:** ✅ Correct usage

---

#### 2. **Auth Pages** (2 files)

##### 2.1 `app/(auth)/login/page.tsx`
**Import:**
```typescript
import { SectionTitle } from "@/components/shared/SectionHeader";
```
**Usage:**
```typescript
<SectionTitle
  italic="Welcome"
  bold="Back"
  className="text-2xl md:text-3xl"
/>
```
**Props Used:** `italic`, `bold`, `className`

**Status:** ✅ Correct usage - Uses italic/bold split pattern

---

##### 2.2 `app/(auth)/register/page.tsx`
**Import:**
```typescript
import { SectionTitle } from "@/components/shared/SectionHeader";
```
**Usage:**
```typescript
<SectionTitle
  italic="Create"
  bold="Account"
  className="text-2xl md:text-3xl"
/>
```
**Props Used:** `italic`, `bold`, `className`

**Status:** ✅ Correct usage - Uses italic/bold split pattern

---

#### 3. **Shop Pages** (1 file)

##### 3.1 `app/(shop)/categories/page.tsx`
**Import:**
```typescript
import { SectionTitle } from "@/components/shared/SectionHeader";
```
**Usage:**
```typescript
<SectionTitle
  variant="large"
  italic="Shop by"
  bold="Category"
/>
```
**Props Used:** `variant`, `italic`, `bold`

**Status:** ✅ Correct usage - Uses italic/bold split pattern with variant

---

### ✅ Using `SectionTitle` from `/components/ui/SectionTitle.tsx` (Badged Section Title)

#### 1. **Shop Pages** (4 files)

##### 1.1 `app/(shop)/checkout/page.tsx`
**Import:**
```typescript
import { SectionTitle } from "@/components/ui/SectionTitle";
```
**Usage:**
```typescript
<SectionTitle
  badgeText="Final Step"
  title="Checkout"
  subtitle="Complete your order by filling in the details below"
  icon={CreditCard}
/>
```
**Props Used:** `badgeText`, `title`, `subtitle`, `icon`

**Status:** ❌ **INCORRECT** - Should use `BadgedSectionTitle` instead of `SectionTitle` alias

---

##### 1.2 `app/(shop)/cart/page.tsx`
**Import:**
```typescript
import { SectionTitle } from "@/components/ui/SectionTitle";
```
**Usage:**
```typescript
<SectionTitle
  badgeText="Your Selection"
  title="Shopping Cart"
  subtitle="Review your items before proceeding to checkout"
  icon={ShoppingBag}
/>
```
**Props Used:** `badgeText`, `title`, `subtitle`, `icon`

**Status:** ❌ **INCORRECT** - Should use `BadgedSectionTitle` instead of `SectionTitle` alias

---

##### 1.3 `app/(shop)/profile/page.tsx`
**Import:**
```typescript
import { SectionTitle } from "@/components/ui/SectionTitle";
```
**Usage:**
```typescript
<SectionTitle
  badgeText="Member Profile"
  title={`Welcome back, ${mockUser.name.split(" ")[0]}`}
  subtitle="Manage your orders, addresses, and account settings in one place."
  className="text-left md:text-center max-w-none mb-12"
/>
```
**Props Used:** `badgeText`, `title`, `subtitle`, `className`

**Status:** ❌ **INCORRECT** - Should use `BadgedSectionTitle` instead of `SectionTitle` alias

---

##### 1.4 `app/(shop)/products/[slug]/components/ProductDetailsAccordion.tsx`
**Import:**
```typescript
import { SectionTitle } from "@/components/ui/SectionTitle";
```
**Usage:**
- ❌ **NOT USED** - Imported but never used in the component
- Can be removed entirely

**Status:** ❌ **UNUSED IMPORT** - Should be removed

---

## Summary Table

| File | Import Source | Component Type | Props Used | Status | Action Needed |
|------|--------------|----------------|------------|--------|---------------|
| `app/_components/BrandStory.tsx` | `/components/shared/` | SectionHeader | N/A (uses SectionHeader) | ✅ Correct | None |
| `app/_components/DepartmentTabs.tsx` | `/components/shared/` | SectionHeader | N/A (uses SectionHeader) | ✅ Correct | None |
| `app/_components/TrendingNow.tsx` | `/components/shared/` | SectionHeader | N/A (uses SectionHeader) | ✅ Correct | None |
| `app/(auth)/login/page.tsx` | `/components/shared/` | SectionTitle | `italic`, `bold` | ✅ Correct | None |
| `app/(auth)/register/page.tsx` | `/components/shared/` | SectionHeader | `italic`, `bold` | ✅ Correct | None |
| `app/(shop)/categories/page.tsx` | `/components/shared/` | SectionTitle | `variant`, `italic`, `bold` | ✅ Correct | None |
| `app/(shop)/checkout/page.tsx` | `/components/ui/` | BadgedSectionTitle (aliased) | `badgeText`, `title`, `subtitle`, `icon` | ❌ **WRONG** | Change to `BadgedSectionTitle` |
| `app/(shop)/cart/page.tsx` | `/components/ui/` | BadgedSectionTitle (aliased) | `badgeText`, `title`, `subtitle`, `icon` | ❌ **WRONG** | Change to `BadgedSectionTitle` |
| `app/(shop)/profile/page.tsx` | `/components/ui/` | BadgedSectionTitle (aliased) | `badgeText`, `title`, `subtitle` | ❌ **WRONG** | Change to `BadgedSectionTitle` |
| `app/(shop)/products/[slug]/components/ProductDetailsAccordion.tsx` | `/components/ui/` | BadgedSectionTitle (aliased) | ❌ **NOT USED** | ❌ **UNUSED** | Remove unused import |

---

## Component Usage Statistics

### SectionTitle from `/components/shared/SectionHeader.tsx`
- **Total Files:** 6 files
- **Direct Usage:** 3 files (login, register, categories)
- **Indirect Usage:** 3 files (via SectionHeader component)
- **Status:** ✅ All correct

### SectionTitle from `/components/ui/SectionTitle.tsx` (BadgedSectionTitle alias)
- **Total Files:** 4 files
- **Actually Used:** 3 files (checkout, cart, profile)
- **Unused Import:** 1 file (ProductDetailsAccordion)
- **All Using:** Badge + Title + Subtitle pattern
- **Status:** ❌ **3 should use `BadgedSectionTitle` directly, 1 should remove import**

---

## Recommended Fix Strategy

### Phase 1: Remove the `SectionTitle` Alias

**In `/components/ui/SectionTitle.tsx`:**
- Remove the deprecated `SectionTitle` export alias
- Keep only `BadgedSectionTitle` and `YouMayAlsoLikeTitle` exports
- Add clear migration comment

### Phase 2: Update All Imports

**Files to Update (4 files):**

1. `app/(shop)/checkout/page.tsx`
   - Change: `import { SectionTitle } from "@/components/ui/SectionTitle"`
   - To: `import { BadgedSectionTitle } from "@/components/ui/SectionTitle"`
   - Change: `<SectionTitle ...` → `<BadgedSectionTitle ...`

2. `app/(shop)/cart/page.tsx`
   - Change: `import { SectionTitle } from "@/components/ui/SectionTitle"`
   - To: `import { BadgedSectionTitle } from "@/components/ui/SectionTitle"`
   - Change: `<SectionTitle ...` → `<BadgedSectionTitle ...`

3. `app/(shop)/profile/page.tsx`
   - Change: `import { SectionTitle } from "@/components/ui/SectionTitle"`
   - To: `import { BadgedSectionTitle } from "@/components/ui/SectionTitle"`
   - Change: `<SectionTitle ...` → `<BadgedSectionTitle ...`

4. `app/(shop)/products/[slug]/components/ProductDetailsAccordion.tsx`
   - Remove unused import: `import { SectionTitle } from "@/components/ui/SectionTitle";`
   - No component changes needed (not used)

### Phase 3: Update Documentation

- Update `COMPONENT_ORGANIZATION_GUIDELINES.md` to clarify:
  - `SectionTitle` from `/components/shared/` = Italic/Bold split style
  - `BadgedSectionTitle` from `/components/ui/` = Badge + Title + Subtitle style

---

## Testing Checklist

After making changes, verify:

- [ ] Login page renders correctly (`/login`)
- [ ] Register page renders correctly (`/register`)
- [ ] Categories page renders correctly (`/categories`)
- [ ] Checkout page renders correctly (`/checkout`)
- [ ] Cart page renders correctly (`/cart`)
- [ ] Profile page renders correctly (`/profile`)
- [ ] Product detail accordion renders correctly
- [ ] Home page sections render correctly
- [ ] Build passes (`npm run build`)
- [ ] Type checking passes (`tsc --noEmit`)
- [ ] No console errors

---

## Impact Assessment

**Risk Level:** 🟢 **LOW**

- Only 4 files need to be updated
- The component functionality is identical, just renaming imports
- No breaking changes to component APIs
- All usages are clearly identified

**Estimated Time:** 15-30 minutes

---

**Next Steps:** Proceed with renaming `SectionTitle` alias to `BadgedSectionTitle` in all 4 affected files.
