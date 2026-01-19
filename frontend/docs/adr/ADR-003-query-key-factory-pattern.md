# ADR-003: Query Key Factory Pattern

**Status:** Accepted
**Date:** January 2026
**Authors:** Senior System Design Solution Architect

## Context

Hardcoded query keys are error-prone and hard to maintain:
- Typos in query keys cause cache bugs
- Inconsistent key structures across features
- Difficult to invalidate related queries
- No type safety for query keys

## Decision

Use query key factory pattern in all features for type-safe, hierarchical query keys.

### Standard Pattern

```typescript
// features/{feature}/query-keys.ts
export const featureKeys = {
  /**
   * Base key for all feature queries
   * Use this to invalidate all feature-related queries
   */
  all: ['feature'] as const,

  /**
   * Key for list queries
   * Use for filtered/paginated lists
   */
  lists: () => [...featureKeys.all, 'list'] as const,

  /**
   * Key for a specific list with filters
   * @param filters - Filter parameters
   */
  list: (filters?: Filters) => [...featureKeys.lists(), filters] as const,

  /**
   * Key for detail queries
   * Use for individual item queries
   */
  details: () => [...featureKeys.all, 'detail'] as const,

  /**
   * Key for a specific detail
   * @param id - Item ID or slug
   */
  detail: (id: string) => [...featureKeys.details(), id] as const,
};
```

### Usage Examples

```typescript
// In queries
export function useProductList(filters?: Filters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productApi.getProducts(filters),
  });
}

// In invalidations
queryClient.invalidateQueries({ queryKey: productKeys.lists() });
queryClient.invalidateQueries({ queryKey: productKeys.all });
```

### Feature-Specific Variations

**Cart (Simple):**
```typescript
export const cartKeys = {
  all: ['cart'] as const,
  // Cart is always a single entity, no lists/details needed
};
```

**Products (Complex):**
```typescript
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductsQueryParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  latest: () => [...productKeys.all, 'latest'] as const,
};
```

**Orders (With Filters):**
```typescript
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params?: OrderListParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
};
```

## Consequences

### Positive

- ✅ Type-safe query keys
- ✅ Easier invalidation (can invalidate parent keys)
- ✅ Prevents cache key bugs
- ✅ Consistent structure across features
- ✅ Better IDE autocomplete

### Negative

- ⚠️ Slight overhead (minimal)
- ⚠️ Need to update existing query keys

### Migration Strategy

1. **Phase 1**: Standardize all existing query key factories
2. **Phase 2**: Update cart query keys (currently only has `all`)
3. **Phase 3**: Document pattern in ADR
4. **Phase 4**: Add to code review checklist

## Implementation Notes

- Use `as const` for type safety
- Keep keys flat (avoid deep nesting)
- Include all filter parameters in list keys
- Use hierarchical structure for easy invalidation

## References

- [React Query Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [Frontend System Architecture Refactoring Guide](../FRONTEND_SYSTEM_ARCHITECTURE_REFACTORING.md#query-key-architecture)
