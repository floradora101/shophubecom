# Frontend Architecture Documentation

This directory contains architectural documentation for the ShopHub frontend codebase.

## Structure

```
docs/
├── adr/                          # Architectural Decision Records
│   ├── ADR-001-component-organization.md
│   ├── ADR-002-state-management-pattern.md
│   └── ADR-003-query-key-factory-pattern.md
├── DUAL_MODE_SCOPE.md
├── COMPONENT_ORGANIZATION_GUIDELINES.md
├── STATE_MANAGEMENT_GUIDELINES.md
└── README.md                      # This file
```

## Architectural Decision Records (ADRs)

ADRs document important architectural decisions and their rationale.

### ADR-001: Component Organization Strategy
- **Status:** Accepted
- **Summary:** Hierarchical component organization with clear placement rules
- **Key Decision:** Five-tier taxonomy (ui/layout/shared/feature/route)

### ADR-002: State Management Pattern
- **Status:** Accepted
- **Summary:** Clear separation between server state (React Query) and client state (Zustand)
- **Key Decision:** Never use Zustand for server data

### ADR-003: Query Key Factory Pattern
- **Status:** Accepted
- **Summary:** Type-safe, hierarchical query keys for all features
- **Key Decision:** Standardized factory pattern across all features

## Guidelines

### Component Organization Guidelines
- Placement decision tree
- Component taxonomy
- Migration checklist
- Best practices

### State Management Guidelines
- State management decision tree
- React Query patterns
- Zustand patterns
- Common patterns and anti-patterns

### Dual Mode Scope
- Defines which frontend domains are mock-supported, demo-only, or backend-required
- Source of truth for `NEXT_PUBLIC_USE_MOCKS` and `NEXT_PUBLIC_DEMO_CHECKOUT`
- See `DUAL_MODE_SCOPE.md`

## Related Documents

- [Frontend System Architecture Refactoring Guide](../../FRONTEND_SYSTEM_ARCHITECTURE_REFACTORING.md)
- [Architecture Documentation](../../ARCHITECTURE_DOCUMENTATION.md)
- [Dual Mode Scope](./DUAL_MODE_SCOPE.md)

## Contributing

When making architectural decisions:
1. Create an ADR document
2. Follow the ADR template
3. Update relevant guidelines
4. Share with team for review
