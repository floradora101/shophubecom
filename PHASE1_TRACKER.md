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

### STEP 1 — TAILWIND CORRECTNESS FIX
- [ ] 1.1 Fix content scanning (add features/ and store/ paths)
- [ ] 1.2 Fix primary.500 token mapping bug
- **Files changed:** `tailwind.config.ts`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** Home and Products look identical
- **Risk notes:** Design token changes

### STEP 2 — DO NOT SHIP REACT QUERY DEVTOOLS IN PROD
- [ ] 2.1 Gate ReactQueryDevtools to development only
- **Files changed:** `app/providers.tsx`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** App runs normally, devtools visible in dev only
- **Risk notes:** Development-only change

### STEP 3 — ARCHIVE UNUSED / LEGACY HERO IMPLEMENTATION
- [ ] 3.1 Verify unused (grep for HeroSplit, hero-split, heroSlideRenderer, components/home/slides)
- [ ] 3.2 Archive via git mv to `__archive/2026-01-09/hero-legacy/...`
- [ ] 3.3 Add note in README.md
- **Files changed:** Various hero files → `__archive/2026-01-09/hero-legacy/...`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** Home hero still works
- **Risk notes:** Only proceed if truly unused

### STEP 4 — ARCHIVE EMPTY / GHOST DIRECTORIES
- [ ] 4.1 Confirm empty directories
- [ ] 4.2 git mv to `__archive/2026-01-09/empty-dirs/...`
- **Files changed:** `app/products/`, `features/home/utils/`, `features/products/server/`, `lib/design-system/`, etc.
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Risk notes:** None

### STEP 5 — REMOVE DUPLICATE ProductCardSkeleton
- [ ] 5.1 Confirm all imports use canonical file
- [ ] 5.2 Archive duplicate to `__archive/2026-01-09/duplicates/`
- **Files changed:** `components/home/ProductCardSkeleton.tsx`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** Department tabs and category spotlight skeletons still render
- **Risk notes:** None

### STEP 6 — REMOVE FAKE LOADING / DEMO DELAYS IN CORE FLOWS
- [ ] 6.1 Checkout: Remove artificial delays
- [ ] 6.2 Search: Remove 50ms/200ms simulated delays
- [ ] 6.3 ProductsContent: Remove fake loading delays
- **Files changed:** `app/(shop)/checkout/page.tsx`, `app/(shop)/search/page.tsx`, `app/(shop)/products/ProductsContent.tsx`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** Search immediate, checkout no pause, filters no wait
- **Risk notes:** Performance improvement

### STEP 7 — INTRODUCE LOGGER WRAPPER + REDUCE CONSOLE NOISE
- [ ] 7.1 Create `lib/logger.ts`
- [ ] 7.2 Replace console usage in active paths
- **Files changed:** `lib/logger.ts`, various files with console.log
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** No functional changes, errors surface in dev
- **Risk notes:** None

### STEP 8 — HERO DYNAMIC IMPORT FALLBACKS
- [ ] 8.1 Add loading fallbacks to SlideBodyRenderer.tsx
- [ ] 8.2 Replace console.error with logger.error
- **Files changed:** `components/home/hero/SlideBodyRenderer.tsx`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** Hero slides never blank during load/transition
- **Risk notes:** None

### STEP 9 — PRODUCTS: EXTRACT LARGE STATIC CONSTANTS
- [ ] 9.1 Extract constants from ProductsContent.tsx
- **Files changed:** `app/(shop)/products/ProductsContent.tsx`, `app/(shop)/products/catalog.constants.ts`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** Products page works exactly the same
- **Risk notes:** None

### STEP 10 (BONUS) — PDP ROUTE LOADING SKELETON
- [ ] 10.1 Add `app/(shop)/products/[slug]/loading.tsx`
- **Files changed:** `app/(shop)/products/[slug]/loading.tsx`
- **Commands:** `npm run lint`, `npx tsc -p tsconfig.json --noEmit`, `npm run build`
- **Manual check:** Hard refresh PDP shows skeleton briefly
- **Risk notes:** None

## Progress Summary

- **Completed:** 0/10 steps
- **Next:** Step 1 - Tailwind config fixes
