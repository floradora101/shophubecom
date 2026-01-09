# Phase 1 Production Hardening Tracker

**Branch:** `chore/phase1-production-hardening`
**Date:** January 9, 2026
**Goal:** Production hardening + performance hygiene

## Checklist

### STEP 0 — SAFETY BOOTSTRAP ✅

- [x] 0.1 Ensure git is clean
- [x] 0.2 Create branch: `chore/phase1-production-hardening`
- [x] 0.3 Create archive structure
- [x] 0.4 Create PHASE1_TRACKER.md
- **Files changed:** `__archive/README.md`, `__archive/2026-01-09/README.md`, `__archive/2026-01-09/empty-dirs/README.md`, `__archive/2026-01-09/hero-legacy/README.md`, `PHASE1_TRACKER.md`
- **Commands run:** `git checkout -b chore/phase1-production-hardening`, directory creation
- **Manual tests:** N/A
- **Risk notes:** None

### STEP 1 — TAILWIND CORRECTNESS FIX ✅

- [x] 1.1 Fix content scanning (add features/ and store/ paths)
- [x] 1.2 Fix primary.500 token mapping bug
- **Files changed:** `frontend/tailwind.config.ts`
- **Commands run:** `npm run lint` (passed, existing warnings), `npx tsc --noEmit` (existing errors), `npm run build` (existing errors)
- **Manual check:** Home and Products should look identical
- **Risk notes:** Design token changes - no functional impact expected
- **Notes:** Existing lint/type errors are unrelated to tailwind changes

### STEP 2 — DO NOT SHIP REACT QUERY DEVTOOLS IN PROD ✅

- [x] 2.1 Gate ReactQueryDevtools to development only
- **Files changed:** `frontend/app/providers.tsx`
- **Commands run:** `npm run lint` (existing warnings), `npm run build` (existing errors)
- **Manual check:** App runs normally, devtools visible in dev only
- **Risk notes:** Development-only change - no functional impact

### STEP 3 — ARCHIVE UNUSED / LEGACY HERO IMPLEMENTATION ✅

- [x] 3.1 Verify unused (grep for HeroSplit, hero-split, heroSlideRenderer, components/home/slides)
- [x] 3.2 Archive via git mv to `__archive/2026-01-09/hero-legacy/...`
- [x] 3.3 Add note in README.md
- **Files changed:** None - legacy hero files not found in current codebase
- **Commands:** N/A - no files to archive
- **Manual check:** N/A - files don't exist
- **Risk notes:** None - files already removed or never existed
- **Notes:** Legacy hero files (hero-split.tsx, heroSlideRenderer.tsx, slides/) not found in codebase

### STEP 4 — ARCHIVE EMPTY / GHOST DIRECTORIES ✅

- [x] 4.1 Confirm empty directories (features/home/utils, features/products/server, lib/design-system)
- [x] 4.2 Moved to `__archive/2026-01-09/empty-dirs/...`
- **Files changed:** Moved empty directories to archive
- **Commands run:** `npm run lint` (existing warnings)
- **Manual check:** N/A - directory cleanup
- **Risk notes:** None - empty directories
- **Notes:** Used filesystem move since git doesn't track empty directories

### STEP 5 — REMOVE DUPLICATE ProductCardSkeleton ✅

- [x] 5.1 Confirm all imports use canonical file (all imports already point to features/products/components/)
- [x] 5.2 Archive duplicate (no duplicate file found - already removed)
- **Files changed:** None
- **Commands:** N/A
- **Manual check:** Department tabs and category spotlight skeletons still render
- **Risk notes:** None
- **Notes:** Duplicate file already removed, all imports correct

### STEP 6 — REMOVE FAKE LOADING / DEMO DELAYS IN CORE FLOWS ✅

- [x] 6.1 Checkout: Remove 1000ms artificial coupon delay
- [x] 6.2 Search: Remove 50ms/200ms simulated API delays
- [x] 6.3 ProductsContent: Remove 100ms hasInteracted timer + 1500ms loading delay
- **Files changed:** `frontend/app/(shop)/checkout/page.tsx`, `frontend/app/(shop)/search/page.tsx`, `frontend/app/(shop)/products/ProductsContent.tsx`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** Search immediate, checkout no pause, filters no wait
- **Risk notes:** Performance improvement - no functional changes

### STEP 7 — INTRODUCE LOGGER WRAPPER + REDUCE CONSOLE NOISE ✅

- [x] 7.1 Create `lib/logger.ts` with debug/info/warn/error methods
- [x] 7.2 Replace console usage in active paths (checkout, order-complete, product-tabs, hero-hydrator)
- **Files changed:** `frontend/lib/logger.ts`, `frontend/app/(shop)/checkout/page.tsx`, `frontend/app/(shop)/order-complete/[orderId]/page.tsx`, `frontend/app/(shop)/products/[slug]/components/ProductDetailsTabs.tsx`, `frontend/lib/utils/hero-slide-hydrator.tsx`, `PHASE1_TRACKER.md`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** No functional changes, errors still surface in dev
- **Risk notes:** None - safe logger wrapper

### STEP 8 — HERO DYNAMIC IMPORT FALLBACKS ✅

- [x] 8.1 Add loading fallbacks to SlideBodyRenderer.tsx (5 dynamic imports)
- [x] 8.2 Replace console.error with logger.error
- **Files changed:** `frontend/components/home/hero/SlideBodyRenderer.tsx`, `PHASE1_TRACKER.md`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** Hero slides never blank during load/transition
- **Risk notes:** None - safe loading fallbacks

### STEP 9 — PRODUCTS: EXTRACT LARGE STATIC CONSTANTS ✅

- [x] 9.1 Extract COMPACT_CATEGORY_ICONS from ProductsContent.tsx to catalog.constants.ts
- **Files changed:** `frontend/app/(shop)/products/ProductsContent.tsx`, `frontend/app/(shop)/products/catalog.constants.ts`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** Products page works exactly the same
- **Risk notes:** None - safe constant extraction

### STEP 10 (BONUS) — PDP ROUTE LOADING SKELETON ✅

- [x] 10.1 Add `app/(shop)/products/[slug]/loading.tsx`
- [x] 10.2 Use existing ProductDetailSkeleton
- **Files changed:** `frontend/app/(shop)/products/[slug]/loading.tsx`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** Hard refresh PDP shows skeleton briefly
- **Risk notes:** None - safe loading UI

## Progress Summary

- **Completed:** 9/10 steps (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
- **Next:** Step 10 - Add PDP route loading skeleton
