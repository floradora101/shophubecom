# State Management Guidelines

**Version:** 1.0
**Last Updated:** January 2026
**Status:** Active

## Overview

This document provides clear guidelines for state management in the ShopHub frontend. Following these guidelines ensures consistent patterns and easier maintenance.

## State Management Decision Tree

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
   │     - UI preferences
   │
   ├─ Form State
   │  └─ react-hook-form
   │     - Form inputs
   │     - Validation
   │
   └─ Derived State
      └─ useMemo / useCallback
         - Computed values
         - Filtered/sorted lists
```

## React Query (Server State)

### When to Use

- ✅ Data fetched from API
- ✅ Needs caching
- ✅ Needs synchronization
- ✅ Examples: Products, Cart, Orders, User Profile, Categories

### Standard Pattern

```typescript
// features/{feature}/queries.ts
export function useFeatureQuery() {
  return useQuery({
    queryKey: featureKeys.all,
    queryFn: () => featureApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFeatureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: featureApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.all });
    },
  });
}
```

### Query Configuration by Feature

```typescript
const queryDefaults = {
  queries: {
    staleTime: {
      products: 5 * 60 * 1000,      // 5 minutes
      categories: 10 * 60 * 1000,   // 10 minutes
      cart: 30 * 1000,                // 30 seconds
      orders: 2 * 60 * 1000,         // 2 minutes
      user: 5 * 60 * 1000,           // 5 minutes
    },
  },
};
```

### Optimistic Updates

```typescript
export function useAddCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.addItem,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.all });
      const previousCart = queryClient.getQueryData(cartKeys.all);

      queryClient.setQueryData(cartKeys.all, (old) => ({
        ...old,
        items: [...old.items, newItem],
      }));

      return { previousCart };
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(cartKeys.all, context.previousCart);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
```

## Zustand (Client UI State)

### When to Use

- ✅ Modal open/closed state
- ✅ Sidebar visibility
- ✅ UI preferences (theme, sidebar collapsed)
- ✅ Temporary selections
- ❌ **NEVER use for server data**

### Standard Pattern

```typescript
// store/{feature}-store.ts
interface FeatureStore {
  // UI state only
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useFeatureStore = create<FeatureStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
```

### ✅ Correct Usage

```typescript
// Cart store - only UI state
interface CartStore {
  isOpen: boolean;  // ✅ UI state
  open: () => void;
  close: () => void;
}
```

### ❌ Incorrect Usage

```typescript
// Cart store - storing server data
interface CartStore {
  cart: Cart;  // ❌ Should be in React Query
  items: CartItem[];  // ❌ Should be in React Query
}
```

## React Hook Form (Form State)

### When to Use

- ✅ Form inputs
- ✅ Validation
- ✅ Submission state
- ✅ Field-level errors

### Standard Pattern

```typescript
const form = useForm<FormData>({
  resolver: yupResolver(schema),
  defaultValues: getDefaultValues(),
});

const onSubmit = async (data: FormData) => {
  try {
    await api.create(data);
  } catch (error) {
    handleError(error); // Sets form errors
  }
};
```

## Derived State (useMemo/useCallback)

### When to Use

- ✅ Computed values from other state
- ✅ Filtered/sorted lists
- ✅ Aggregations

### Standard Pattern

```typescript
const filteredProducts = useMemo(() => {
  return products.filter((p) => p.price < maxPrice);
}, [products, maxPrice]);

const sortedProducts = useMemo(() => {
  return [...products].sort((a, b) => a.price - b.price);
}, [products]);
```

## Unified Hooks Pattern

When combining multiple state sources:

```typescript
// features/cart/hooks.ts
export function useCart() {
  // Server data from React Query
  const { data: cart, isLoading } = useCartQuery();

  // UI state from Zustand
  const { isOpen, open, close } = useCartStore();

  return {
    cart,
    isLoading,
    isOpen,
    open,
    close,
  };
}
```

## Common Patterns

### Pattern 1: Server Data + UI State

```typescript
// ✅ CORRECT
const { data: products } = useProductsQuery(); // React Query
const { isFiltersOpen, toggleFilters } = useFiltersStore(); // Zustand
```

### Pattern 2: Form with Server Submission

```typescript
// ✅ CORRECT
const form = useForm<FormData>({ ... }); // react-hook-form
const mutation = useCreateProductMutation(); // React Query

const onSubmit = form.handleSubmit((data) => {
  mutation.mutate(data);
});
```

### Pattern 3: Derived State

```typescript
// ✅ CORRECT
const { data: products } = useProductsQuery();
const filteredProducts = useMemo(() => {
  return products?.filter(p => p.inStock) ?? [];
}, [products]);
```

## Anti-Patterns

### ❌ Don't Store Server Data in Zustand

```typescript
// ❌ WRONG
const useProductsStore = create((set) => ({
  products: [], // Should be in React Query
  setProducts: (products) => set({ products }),
}));
```

### ❌ Don't Duplicate State

```typescript
// ❌ WRONG
const { data: cart } = useCartQuery(); // React Query
const { cart } = useCartStore(); // Zustand - duplicate!
```

### ❌ Don't Use Local State for Server Data

```typescript
// ❌ WRONG
const [products, setProducts] = useState([]);
useEffect(() => {
  fetchProducts().then(setProducts);
}, []);
```

## Related Documents

- [ADR-002: State Management Pattern](./adr/ADR-002-state-management-pattern.md)
- [Frontend System Architecture Refactoring Guide](../FRONTEND_SYSTEM_ARCHITECTURE_REFACTORING.md)
