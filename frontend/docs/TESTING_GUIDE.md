# Testing Guide

## Overview

This guide covers testing strategies, patterns, and best practices for the ShopHub frontend application.

## Testing Stack

- **Vitest**: Test runner and framework
- **React Testing Library**: Component testing utilities
- **jsdom**: DOM environment for tests
- **MSW (Mock Service Worker)**: API mocking (optional, for integration tests)

## Test Structure

```
frontend/
├── test/
│   ├── setup.ts              # Test environment setup
│   ├── utils.tsx             # Test utilities (renderWithProviders)
│   └── mocks/
│       └── handlers.ts       # MSW request handlers
├── features/
│   └── {feature}/
│       └── __tests__/
│           ├── *.test.ts     # Unit tests
│           └── *.test.tsx    # Component tests
└── lib/
    └── {module}/
        └── __tests__/
            └── *.test.ts     # Utility tests
```

## Test Types

### 1. Unit Tests

Test individual functions, utilities, and hooks in isolation.

**Example: Query Key Factories**
```typescript
// features/cart/__tests__/query-keys.test.ts
import { describe, it, expect } from "vitest";
import { cartKeys } from "../query-keys";

describe("cartKeys", () => {
  it("should have correct base key structure", () => {
    expect(cartKeys.all).toEqual(["cart"]);
  });
});
```

**Example: API Response Transformers**
```typescript
// lib/api/__tests__/response-transformer.test.ts
import { extractResponseData } from "../response-transformer";

describe("extractResponseData", () => {
  it("should extract data from BackendResponse", () => {
    const mockResponse = {
      data: {
        success: true,
        data: { id: "123" },
        timestamp: "2026-01-01T00:00:00Z",
      },
    };
    expect(extractResponseData(mockResponse)).toEqual({ id: "123" });
  });
});
```

### 2. Hook Tests

Test custom hooks with React Testing Library's `renderHook`.

**Example: Cart Hook**
```typescript
// features/cart/__tests__/hooks.test.tsx
import { renderHook } from "@testing-library/react";
import { useCart } from "../hooks";

// Mock dependencies
vi.mock("../queries");
vi.mock("@/store/cart-store");

describe("useCart", () => {
  it("should return cart state from React Query", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
  });
});
```

### 3. Component Tests

Test React components with React Testing Library.

**Example: ProductCard Component**
```typescript
// components/shared/__tests__/ProductCard.test.tsx
import { render, screen } from "@/test/utils";
import { ProductCard } from "../ProductCard";

describe("ProductCard", () => {
  it("should render product information", () => {
    const product = {
      id: "1",
      name: "Test Product",
      price: 100,
    };

    render(<ProductCard product={product} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });
});
```

### 4. Integration Tests

Test complete user flows across multiple components.

**Example: Add to Cart Flow**
```typescript
// features/cart/__tests__/cart-flow.test.tsx
import { render, screen, waitFor } from "@/test/utils";
import { ProductCard } from "@/components/shared/ProductCard";
import { server } from "@/test/mocks/server";

describe("Add to Cart Flow", () => {
  it("should add product to cart when clicking add button", async () => {
    render(<ProductCard product={mockProduct} />);

    const addButton = screen.getByRole("button", { name: /add to cart/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/item added/i)).toBeInTheDocument();
    });
  });
});
```

## Test Utilities

### renderWithProviders

Custom render function that includes all necessary providers:

```typescript
// test/utils.tsx
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

## Mocking Strategies

### 1. Mock React Query Hooks

```typescript
vi.mock("../queries", () => ({
  useCartQuery: vi.fn(() => ({
    data: mockCart,
    isLoading: false,
  })),
}));
```

### 2. Mock Zustand Stores

```typescript
vi.mock("@/store/cart-store", () => ({
  useCartStore: vi.fn((selector) => {
    const state = {
      isOpen: false,
      open: vi.fn(),
      close: vi.fn(),
    };
    return selector(state);
  }),
}));
```

### 3. Mock API Calls with MSW

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/cart', () => {
    return HttpResponse.json({
      success: true,
      data: mockCart,
    });
  }),
];
```

## Testing Best Practices

### 1. Test Behavior, Not Implementation

✅ **Good**: Test that clicking "Add to Cart" adds the item
❌ **Bad**: Test that `addItem` function is called

### 2. Use Accessible Queries

✅ **Good**: `getByRole("button", { name: /add to cart/i })`
❌ **Bad**: `getByTestId("add-button")`

### 3. Test User Flows

Focus on testing complete user interactions rather than isolated functions.

### 4. Keep Tests Isolated

Each test should be independent and not rely on other tests.

### 5. Use Descriptive Test Names

✅ **Good**: `"should add product to cart when clicking add button"`
❌ **Bad**: `"test add to cart"`

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Coverage Goals

- **Critical Paths**: > 80% coverage
  - Cart operations
  - Authentication flows
  - Checkout process
  - Order management

- **Utilities**: > 90% coverage
  - Query key factories
  - API transformers
  - Form validators

- **Components**: > 70% coverage
  - Shared components
  - Feature components
  - UI components

## Common Testing Patterns

### Testing React Query Mutations

```typescript
it("should call mutation when adding item", async () => {
  const mockMutateAsync = vi.fn().mockResolvedValue({});
  vi.mocked(useAddCartItemMutation).mockReturnValue({
    mutateAsync: mockMutateAsync,
  } as any);

  const { result } = renderHook(() => useCart(), { wrapper });

  await result.current.addItem(mockProduct, { variantId: "v1" });

  expect(mockMutateAsync).toHaveBeenCalledWith({
    variantId: "v1",
    quantity: 1,
  });
});
```

### Testing Error States

```typescript
it("should handle API errors gracefully", async () => {
  vi.mocked(useCartQuery).mockReturnValue({
    data: undefined,
    error: new Error("Failed to fetch"),
    isLoading: false,
  } as any);

  const { result } = renderHook(() => useCart(), { wrapper });

  expect(result.current.items).toEqual([]);
});
```

### Testing Loading States

```typescript
it("should show loading state while fetching", () => {
  vi.mocked(useCartQuery).mockReturnValue({
    data: undefined,
    isLoading: true,
  } as any);

  const { result } = renderHook(() => useCart(), { wrapper });

  expect(result.current.isLoading).toBe(true);
});
```

## Next Steps

1. Add tests for all query key factories
2. Add tests for all API transformers
3. Add component tests for shared components
4. Add integration tests for critical user flows
5. Set up CI/CD test pipeline
