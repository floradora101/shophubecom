# Quick Reference Guide

**For:** Developers working on ShopHub frontend
**Last Updated:** January 2026

## Where to Put Components?

```
Design system primitive?
├─ Yes → /components/ui
└─ No
   └─ Layout component?
      ├─ Yes → /components/layout
      └─ No
         └─ Used by 2+ features?
            ├─ Yes → /components/shared
            └─ No
               └─ Feature-specific?
                  ├─ Yes → /features/{feature}/components
                  └─ No → /app/{route}/_components
```

## State Management Quick Guide

| State Type | Solution | Example |
|------------|----------|---------|
| Server data (API) | React Query | Products, Cart, Orders |
| UI state (modals, sidebars) | Zustand | `isOpen`, `isSidebarCollapsed` |
| Form state | react-hook-form | Form inputs, validation |
| Derived state | useMemo/useCallback | Filtered lists, computed values |

**Rule:** ❌ NEVER use Zustand for server data

## Query Key Pattern

```typescript
// Standard pattern
export const featureKeys = {
  all: ['feature'] as const,
  lists: () => [...featureKeys.all, 'list'] as const,
  list: (filters?) => [...featureKeys.lists(), filters] as const,
  details: () => [...featureKeys.all, 'detail'] as const,
  detail: (id: string) => [...featureKeys.details(), id] as const,
};
```

## Common Patterns

### React Query Query

```typescript
export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: () => productApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}
```

### React Query Mutation

```typescript
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
```

### Zustand Store (UI State Only)

```typescript
interface CartStore {
  isOpen: boolean;  // ✅ UI state only
  open: () => void;
  close: () => void;
}
```

### Unified Hook (React Query + Zustand)

```typescript
export function useCart() {
  const { data: cart } = useCartQuery(); // React Query
  const { isOpen, open, close } = useCartStore(); // Zustand

  return { cart, isOpen, open, close };
}
```

## Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Example

```typescript
import { render, screen } from '@/test/utils';
import { ProductCard } from '@/components/shared/product-card';

describe('ProductCard', () => {
  it('displays product information', () => {
    const product = { id: '1', name: 'Test', price: 99.99 };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## File Structure

```
frontend/
├── components/
│   ├── ui/              # Design system primitives
│   ├── layout/          # Layout components
│   └── shared/          # Cross-feature components
├── features/
│   └── {feature}/
│       ├── api.ts
│       ├── queries.ts
│       ├── query-keys.ts
│       └── components/   # Feature-specific components
├── app/
│   └── {route}/
│       └── _components/ # Route-specific components
└── docs/                # Architecture documentation
```

## Links

- [Component Organization Guidelines](./COMPONENT_ORGANIZATION_GUIDELINES.md)
- [State Management Guidelines](./STATE_MANAGEMENT_GUIDELINES.md)
- [ADRs](./adr/)
