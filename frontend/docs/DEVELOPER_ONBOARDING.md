# Developer Onboarding Guide

## Welcome to ShopHub Frontend

This guide will help you get started with the ShopHub frontend codebase.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

## Architecture Overview

### Tech Stack

- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **React Query**: Server state management
- **Zustand**: Client UI state management
- **Tailwind CSS**: Styling
- **Vitest**: Testing

### Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (shop)/            # Shop routes
│   ├── (auth)/            # Auth routes
│   └── admin/             # Admin routes
├── components/
│   ├── ui/                 # Base design system components
│   ├── shared/             # Cross-feature reusable components
│   └── layout/             # Layout components
├── features/               # Feature modules (FSD pattern)
│   ├── cart/
│   ├── products/
│   ├── auth/
│   └── orders/
├── lib/                    # Shared utilities
│   ├── api/                # API client and transformers
│   └── utils/              # Utility functions
├── store/                  # Zustand stores (UI state only)
└── test/                   # Test utilities and mocks
```

## Key Concepts

### 1. Component Organization

Components are organized by scope:

- **`/components/ui`**: Base design system (buttons, inputs, etc.)
- **`/components/shared`**: Cross-feature reusable (ProductCard, etc.)
- **`/features/{feature}/components`**: Feature-specific components
- **`/app/{route}/_components`**: Route-specific components

**Guideline**: If a component is used in 2+ features, move it to `/components/shared`.

### 2. State Management

**React Query** for server data:
```typescript
// ✅ Good: Server data in React Query
const { data: cart } = useCartQuery();

// ❌ Bad: Server data in Zustand
const cart = useCartStore(state => state.cart);
```

**Zustand** for UI state only:
```typescript
// ✅ Good: UI state in Zustand
const isOpen = useCartStore(state => state.isOpen);

// ❌ Bad: Server data in Zustand
const cart = useCartStore(state => state.cart);
```

**react-hook-form** for form state:
```typescript
// ✅ Good: Form state in react-hook-form
const { register, handleSubmit } = useForm();
```

### 3. Query Keys

Always use query key factories:

```typescript
// ✅ Good: Use factory
queryKey: cartKeys.all

// ❌ Bad: Hardcoded
queryKey: ["cart"]
```

### 4. API Calls

Use standardized response transformers:

```typescript
// ✅ Good: Use transformer
import { extractResponseData } from "@/lib/api/response-transformer";
const data = extractResponseData(response);

// ❌ Bad: Manual extraction
const data = response.data.data;
```

## Development Workflow

### Adding a New Feature

1. **Create feature directory**:
   ```
   features/{feature}/
   ├── api.ts              # API functions
   ├── queries.ts          # React Query hooks
   ├── query-keys.ts       # Query key factory
   ├── hooks.ts            # Custom hooks
   ├── types.ts            # TypeScript types
   └── components/         # Feature components
   ```

2. **Follow the patterns**:
   - Use query key factory
   - Use response transformers
   - React Query for data, Zustand for UI

3. **Add tests**:
   - Unit tests for utilities
   - Hook tests for custom hooks
   - Component tests for UI

### Making API Changes

1. **Update API function** in `features/{feature}/api.ts`
2. **Use response transformer** for consistent extraction
3. **Update types** if response structure changes
4. **Update queries** if needed
5. **Add/update tests**

### Component Development

1. **Choose the right location**:
   - UI component? → `/components/ui`
   - Shared component? → `/components/shared`
   - Feature component? → `/features/{feature}/components`
   - Route component? → `/app/{route}/_components`

2. **Default to server components**:
   - Only add `"use client"` when needed
   - Use client components for interactivity

3. **Use TypeScript**:
   - Define prop types
   - Use shared types from features

## Code Style

### TypeScript

- Use strict mode
- Define types for all props
- Use shared types from features

### Naming Conventions

- **Components**: PascalCase (`ProductCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useCart.ts`)
- **Utilities**: camelCase (`formatPrice.ts`)
- **Types**: PascalCase (`Product`, `CartItem`)

### File Organization

- One component per file
- Co-locate related files
- Use index.ts for exports

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage
```

### Writing Tests

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing guidelines.

## Common Tasks

### Adding a New Page

1. Create page file in `app/{route}/page.tsx`
2. Use server component for data fetching
3. Pass data to client components as props

### Adding a New API Endpoint

1. Add function to `features/{feature}/api.ts`
2. Use `extractResponseData` or `extractPaginatedData`
3. Create React Query hook in `queries.ts`
4. Add query key to `query-keys.ts`

### Adding a New Component

1. Determine component location (ui/shared/feature/route)
2. Create component file
3. Add TypeScript types
4. Export from index.ts if needed
5. Add tests

## Debugging

### React Query DevTools

React Query DevTools are available in development:
- Open browser DevTools
- Look for React Query tab

### Common Issues

**Issue**: Cart not updating after mutation
**Solution**: Check query key invalidation in mutation `onSuccess`

**Issue**: Component not re-rendering
**Solution**: Check if using React Query data correctly (not Zustand)

**Issue**: Type errors
**Solution**: Ensure types are imported from correct locations

## Resources

- [Component Organization Guidelines](./COMPONENT_ORGANIZATION_GUIDELINES.md)
- [State Management Guidelines](./STATE_MANAGEMENT_GUIDELINES.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)
- [Architecture Documentation](../../ARCHITECTURE_DOCUMENTATION.md)

## Getting Help

- Check existing documentation
- Review similar features in codebase
- Ask team members
- Review ADRs in `frontend/docs/adr/`

## Next Steps

1. Read [Component Organization Guidelines](./COMPONENT_ORGANIZATION_GUIDELINES.md)
2. Read [State Management Guidelines](./STATE_MANAGEMENT_GUIDELINES.md)
3. Review existing features (cart, products, auth)
4. Start with a small task
5. Ask questions!

Welcome to the team! 🚀
