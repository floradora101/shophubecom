# ADR-002: State Management Pattern

**Status:** Accepted
**Date:** January 2026
**Authors:** Senior System Design Solution Architect

## Context

Inconsistent state management patterns across features:
- Cart uses Zustand for both UI state AND cart data
- Some features mix Zustand data with React Query
- Query invalidation strategies vary across features
- Unclear when to use which state management solution

## Decision

Establish clear state management rules with strict separation of concerns:

### State Management Decision Tree

```
What type of state?
├─ Server State (from API)
│  └─ React Query
│     - API data (products, cart, orders, user profile)
│     - Caching and synchronization
│     - Optimistic updates
│
└─ Client State
   ├─ UI State (modals, sidebars, preferences)
   │  └─ Zustand
   │     - Modal open/closed
   │     - Sidebar state
   │     - UI preferences (theme, sidebar collapsed)
   │
   ├─ Form State
   │  └─ react-hook-form
   │     - Form inputs
   │     - Validation
   │     - Submission state
   │
   └─ Derived State
      └─ useMemo / useCallback
         - Computed values from other state
         - Filtered/sorted lists
         - Aggregations
```

### Rules

1. **Server State → React Query**
   - All data fetched from API
   - Needs caching and synchronization
   - Examples: Products, Cart, Orders, User Profile, Categories

2. **Client UI State → Zustand**
   - Modal open/closed state
   - Sidebar visibility
   - UI preferences (theme, sidebar collapsed)
   - Temporary selections
   - **NEVER use Zustand for server data**

3. **Form State → react-hook-form**
   - Form inputs and validation
   - Submission state
   - Field-level errors

4. **Derived State → useMemo/useCallback**
   - Computed values from other state
   - Filtered/sorted lists
   - Aggregations

### React Query Configuration

```typescript
// Standard query configuration per feature type
const queryDefaults = {
  queries: {
    staleTime: {
      products: 5 * 60 * 1000,      // 5 minutes
      categories: 10 * 60 * 1000,     // 10 minutes
      cart: 30 * 1000,                // 30 seconds
      orders: 2 * 60 * 1000,         // 2 minutes
      user: 5 * 60 * 1000,           // 5 minutes
    },
  },
};
```

### Zustand Store Pattern

```typescript
// ✅ CORRECT: Only UI state
interface CartStore {
  isOpen: boolean;  // UI state only
  open: () => void;
  close: () => void;
}

// ❌ WRONG: Don't store server data
interface CartStore {
  cart: Cart;  // ❌ This should be in React Query
  items: CartItem[];  // ❌ This should be in React Query
}
```

## Consequences

### Positive

- ✅ Consistent patterns across codebase
- ✅ Single source of truth for server data (React Query)
- ✅ Better synchronization with backend
- ✅ Clearer mental model for developers
- ✅ Easier to reason about data flow

### Negative

- ⚠️ Requires refactoring cart feature (one-time)
- ⚠️ Team needs to learn new patterns
- ⚠️ Need to update existing code

### Migration Strategy

1. **Phase 1**: Document patterns (this ADR)
2. **Phase 2**: Refactor cart to use React Query for data
3. **Phase 3**: Update Zustand stores to only contain UI state
4. **Phase 4**: Standardize React Query configurations
5. **Phase 5**: Update documentation and examples

## Implementation Notes

- Cart data migration: Move from Zustand to React Query
- Create unified cart hook that combines React Query + Zustand
- Use optimistic updates for better UX
- Standardize query key factories across all features

## References

- [Frontend System Architecture Refactoring Guide](../FRONTEND_SYSTEM_ARCHITECTURE_REFACTORING.md#state-management-architecture)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
