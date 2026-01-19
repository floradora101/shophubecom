# Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented in the ShopHub frontend application.

## Bundle Size Optimization

### Package Import Optimization

Next.js automatically tree-shakes unused exports from optimized packages:

- `lucide-react` - Icon library (87 files use it)
- `@radix-ui/react-*` - UI component libraries
- `@tanstack/react-query` - Data fetching
- `date-fns` - Date utilities

Configured in `next.config.ts`:
```typescript
experimental: {
  optimizePackageImports: [
    "lucide-react",
    "@radix-ui/react-navigation-menu",
    "@radix-ui/react-dialog",
    "@radix-ui/react-popover",
    "@radix-ui/react-select",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-alert-dialog",
    "@tanstack/react-query",
    "date-fns",
  ],
}
```

### Dynamic Imports

Heavy components are dynamically imported to reduce initial bundle size:

#### Home Page (`app/home-page-content.tsx`)
- `DepartmentTabs` - Client-only, below-the-fold
- `CategorySpotlight` - Client-only, below-the-fold
- `ServiceShowcase` - Client-only, below-the-fold
- `ProductRevealSection` - Client-only, below-the-fold
- `TrendingNow` - Client-only, below-the-fold
- `SubcategoryShowcase` - Client-only, below-the-fold
- `LatestProductsCarousel` - Client-only, below-the-fold
- `BrandStory` - Client-only, below-the-fold

All use `ssr: false` since they're client-only interactive components.

#### Product Detail Page (`app/(shop)/products/[slug]/ProductDetailClient.tsx`)
- `YouMayAlsoLike` - Client-only, below-the-fold recommendations

### Code Splitting Strategy

1. **Route-based splitting**: Each route is automatically code-split by Next.js
2. **Component-based splitting**: Heavy components use dynamic imports
3. **Library splitting**: Large libraries are optimized via `optimizePackageImports`

## Server Components

### Current Status

- **Server Components**: Used for data fetching and static content
  - `app/page.tsx` - Home page shell
  - `app/(shop)/products/[slug]/page.tsx` - Product detail shell
  - Layout components where possible

- **Client Components**: Used for interactivity
  - Cart functionality
  - Form handling
  - Interactive UI (modals, dropdowns, etc.)
  - State management (Zustand stores)

### Best Practices

1. **Default to Server Components**: Start with server components, add "use client" only when needed
2. **Minimize Client Boundaries**: Keep client components small and focused
3. **Pass Data Down**: Server components fetch data, pass to client components as props

## Caching Strategy

### Static Assets
- Images: `max-age=31536000, immutable`
- Fonts: `max-age=31536000, immutable`
- Static files: `max-age=31536000, immutable`

Configured in `next.config.ts` headers.

### React Query Caching
- Product queries: 30-60 seconds staleTime
- Cart queries: Real-time (no staleTime)
- Category queries: 60 seconds staleTime
- Order queries: 30-60 seconds staleTime

## Bundle Analysis

### Running Bundle Analysis

```bash
npm run analyze
```

This will:
1. Build the application
2. Generate bundle analysis reports
3. Open interactive visualization in browser

### Analyzing Results

1. **Large Dependencies**: Look for unexpectedly large packages
2. **Duplicate Code**: Check for duplicate dependencies
3. **Unused Code**: Identify dead code that can be removed
4. **Code Splitting**: Verify dynamic imports are working

## Performance Metrics

### Target Metrics

- **Initial Bundle Size**: < 500KB (gzipped)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s

### Monitoring

Use Next.js built-in analytics or tools like:
- Web Vitals
- Lighthouse
- Chrome DevTools Performance tab

## Optimization Checklist

- [x] Package import optimization configured
- [x] Dynamic imports for below-the-fold components
- [x] Server components for data fetching
- [x] Static asset caching headers
- [x] Bundle analyzer configured
- [ ] Image optimization (Next.js Image component)
- [ ] Font optimization (next/font)
- [ ] Route prefetching optimization
- [ ] React Query cache optimization

## Future Optimizations

1. **Image Optimization**
   - Use Next.js Image component consistently
   - Implement responsive images
   - Add image placeholders

2. **Font Optimization**
   - Use `next/font` for font loading
   - Preload critical fonts
   - Subset fonts to reduce size

3. **Route Prefetching**
   - Optimize prefetching strategy
   - Disable prefetching for low-priority routes

4. **React Query Optimization**
   - Fine-tune staleTime per query
   - Implement query prefetching
   - Optimize cache invalidation

5. **Component Lazy Loading**
   - Add more dynamic imports for heavy components
   - Implement intersection observer for lazy loading
   - Optimize skeleton loading states
