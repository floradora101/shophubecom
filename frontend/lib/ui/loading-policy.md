# Loading & Skeleton Policy

## Skeleton vs Spinner Usage Guidelines

### When to Use Skeletons
- **Content Loading**: Use skeletons for loading states that display actual content (products, articles, profiles, etc.)
- **Data-Driven UI**: When the final UI structure is known and content is being fetched
- **Progressive Loading**: For better perceived performance in content-heavy pages
- **Layout Preservation**: When you want to maintain the page layout during loading

### When to Use Spinners
- **Action Loading**: Submit buttons, form submissions, navigation actions
- **Indeterminate State**: When you don't know how long loading will take
- **Modal/Dialog Loading**: Loading states within modals or dialogs
- **Inline Actions**: Like buttons, links, or small UI elements

### Component Guidelines

#### Skeleton Components (from `@/components/ui/skeleton`)
- `SkeletonBlock`: Base skeleton component with shimmer animation
- `SkeletonCircle`: Circular skeleton (avatars, icons)
- `SkeletonText`: Multi-line text skeletons with natural width variations

#### Loading Components (from `@/lib/ui/loading`)
- `PageLoadingSpinner`: Full-page loading with centered spinner
- `ProductsGridSkeleton`: Product grid skeleton (8 items default)
- `CategoryGridSkeleton`: Category listing skeleton
- `SearchResultsSkeleton`: Search results page skeleton
- `CartItemsSkeleton`: Cart items skeleton
- `ProfileSkeleton`: Profile sections skeleton
- `FormSkeleton`: Form loading skeleton
- `ButtonSpinner`: Inline button loading spinner

#### Canonical Components
- **ProductCardSkeleton**: Single canonical skeleton for product cards
- **LoadingButton**: Standard button with inline spinner for actions

### Implementation Rules

#### Skeleton Implementation
```tsx
// ✅ Correct: Use canonical ProductCardSkeleton
import { ProductCardSkeleton } from "@/features/products/components/ProductCardSkeleton";

// ❌ Avoid: Custom product skeletons
function CustomProductSkeleton() { /* ... */ }
```

#### Spinner Implementation
```tsx
// ✅ Correct: Use LoadingButton for actions
<LoadingButton loading={isSubmitting} onClick={handleSubmit}>
  Submit Order
</LoadingButton>

// ✅ Correct: Use ButtonSpinner for custom buttons
<button disabled={loading}>
  {loading && <ButtonSpinner />}
  Save Changes
</button>

// ❌ Avoid: Inline spinner logic
<button disabled={loading}>
  {loading ? <div className="animate-spin">...</div> : "Save"}
</button>
```

### Route-Level Loading States
- Use `loading.tsx` files for route-level skeletons
- Match the actual page layout structure
- Use appropriate skeleton components based on content type

### Accessibility
- All loading states should have appropriate ARIA labels
- Spinners should have `role="status"` and `aria-label`
- Skeletons should have `aria-hidden="true"`
- Screen readers should be informed of loading states

### Performance
- Lazy load skeleton components only when needed
- Use progressive loading for large content areas
- Avoid over-skeletonizing (don't skeleton every small element)




