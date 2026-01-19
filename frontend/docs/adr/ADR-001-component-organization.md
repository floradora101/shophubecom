# ADR-001: Component Organization Strategy

**Status:** Accepted
**Date:** January 2026
**Authors:** Senior System Design Solution Architect

## Context

Components are currently scattered across multiple locations with no clear guidelines:
- `/components/ui` - Base design system
- `/components/layout` - Layout components
- `/components/home` - Home-specific components
- `/app/_components` - Route-specific components
- `/features/{feature}/components` - Feature-specific components

This creates confusion about:
- Where to place new components
- Component ownership and reusability boundaries
- Finding existing components

## Decision

Adopt a hierarchical component organization strategy with clear placement rules:

### Component Taxonomy

1. **Base Components** (`/components/ui`)
   - Design system primitives
   - No business logic
   - Examples: `Button`, `Input`, `Card`, `Dialog`
   - Reusable across entire application

2. **Layout Components** (`/components/layout`)
   - Application-wide layout structure
   - Examples: `Header`, `Footer`, `Sidebar`
   - Used in root layouts

3. **Shared Components** (`/components/shared`)
   - Cross-feature reusable business components
   - Contains business logic but used by multiple features
   - Examples: `ProductCard`, `OrderCard`, `AddressCard`
   - When a component is used by 2+ features, move here

4. **Feature Components** (`/features/{feature}/components`)
   - Feature-specific components
   - Contains feature-specific business logic
   - Examples: `CartSidebar`, `ProductFilters`, `OrderSummary`
   - Only used within the feature

5. **Route Components** (`/app/{route}/_components`)
   - Route-specific components (not reusable)
   - Page-specific implementations
   - Examples: `HomeHero`, `ProductsBanner`
   - Only used in that specific route

### Placement Decision Tree

```
Is it a design system primitive?
├─ Yes → /components/ui
└─ No
   └─ Is it layout-related?
      ├─ Yes → /components/layout
      └─ No
         └─ Is it used by 2+ features?
            ├─ Yes → /components/shared
            └─ No
               └─ Is it feature-specific?
                  ├─ Yes → /features/{feature}/components
                  └─ No → /app/{route}/_components
```

## Consequences

### Positive

- ✅ Clear ownership boundaries
- ✅ Easier to find and maintain components
- ✅ Better code organization
- ✅ Reduced duplication
- ✅ Improved developer experience

### Negative

- ⚠️ Requires migration effort (one-time)
- ⚠️ Need to update all imports after migration
- ⚠️ Team needs to learn new conventions

### Migration Strategy

1. **Phase 1**: Create `/components/shared` directory
2. **Phase 2**: Audit all components and classify them
3. **Phase 3**: Move components to appropriate locations
4. **Phase 4**: Update imports across codebase
5. **Phase 5**: Document guidelines in developer onboarding

## Implementation Notes

- Use barrel exports (`index.ts`) for cleaner imports
- Maintain backward compatibility during migration
- Update ESLint rules to enforce organization patterns
- Add component organization to code review checklist

## References

- [Frontend System Architecture Refactoring Guide](../FRONTEND_SYSTEM_ARCHITECTURE_REFACTORING.md#component-organization)
- Feature-Sliced Design principles
