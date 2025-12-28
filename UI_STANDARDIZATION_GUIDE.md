# UI Standardization Guide

This guide documents the standardized design tokens and patterns for consistent spacing, buttons, and UI primitives across the ShopHub application.

## Design Tokens

All design tokens are defined in `frontend/lib/ui-tokens.ts` and exported via the `ui` object.

### 1. Container Gutters (`ui.gutter`)

Standardized responsive horizontal padding for containers and sections.

```typescript
ui.gutter = "px-4 sm:px-6 lg:px-8";
```

**Usage:**

- Applied automatically by the `Container` component
- Used by the `Section` component internally
- Provides consistent horizontal spacing across all screen sizes

### 2. Section Vertical Spacing (`ui.sectionY`)

Standardized vertical padding for page sections. Use these tiers based on section importance and content density.

```typescript
ui.sectionY = {
  sm: "py-8", // Compact sections (banners, alerts)
  md: "py-12", // Standard sections (product grids, forms)
  lg: "py-16", // Important sections (hero, featured content)
  xl: "py-20", // Major sections (landing pages, main content)
  "2xl": "py-24", // Page-level sections (homepage hero)
};
```

**Usage:**

- Applied automatically by the `Section` component
- Choose based on content hierarchy and visual weight
- Use `withContainer={false}` when manually wrapping content with Container to avoid double-nesting

### 3. Stack Vertical Spacing (`ui.stack`)

Standardized spacing between stacked elements within components.

```typescript
ui.stack = {
  xs: "space-y-2", // Tight spacing (form fields, list items)
  sm: "space-y-3", // Close spacing (card content, compact lists)
  md: "space-y-4", // Standard spacing (component internals)
  lg: "space-y-6", // Generous spacing (section content, large blocks)
  xl: "space-y-8", // Wide spacing (major content divisions)
  "2xl": "space-y-12", // Very wide spacing (page sections)
};
```

**Usage:**

- Applied automatically by the `Stack` component
- Use for consistent vertical rhythm within components

### 4. Gap Spacing (`ui.gap`)

Standardized spacing between adjacent elements (horizontal and grid gaps).

```typescript
ui.gap = {
  sm: "gap-4", // Close elements (buttons, small cards)
  md: "gap-6", // Standard gaps (medium cards, form elements)
  lg: "gap-8", // Wide gaps (large cards, sections)
  xl: "gap-12", // Very wide gaps (major layout divisions)
  "2xl": "gap-16", // Extra wide gaps (hero elements, full sections)
};
```

**Usage:**

- Apply directly to flexbox/grid containers: `className={ui.gap.md}`
- Use for consistent spacing between sibling elements

### 5. Icon Sizing (`ui.icon`)

Standardized icon dimensions for consistent visual hierarchy.

```typescript
ui.icon = {
  sm: "h-4 w-4", // Small icons (form fields, metadata)
  md: "h-5 w-5", // Standard icons (buttons, navigation)
  lg: "h-6 w-6", // Large icons (hero elements, prominent actions)
  hero: "h-8 w-8", // Hero icons (major UI elements, branding)
};
```

**Usage:**

- Apply directly to icon elements: `className={ui.icon.md}`

## Component Usage

### Container Component

```tsx
import { Container } from "@/components/ui/container";

// Standard usage (applies ui.gutter automatically)
<Container size="lg">
  <div>Content</div>
</Container>;

// Available sizes: "sm" | "md" | "lg" | "xl" | "full"
```

### Section Component

```tsx
import { Section } from "@/components/ui/section";

// Standard usage (applies ui.sectionY[spacing] + Container automatically)
<Section spacing="lg" containerSize="lg">
  <div>Content</div>
</Section>;

// spacing: "sm" | "md" | "lg" | "xl" | "2xl"
// containerSize: "sm" | "md" | "lg" | "xl" | "full"
// withContainer: boolean (default: true) - whether to wrap content with Container
```

### Stack Component

```tsx
import { Stack } from "@/components/ui/stack";

// Standard usage (applies ui.stack[spacing] automatically)
<Stack spacing="md" align="start">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>;

// spacing: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
// align: "start" | "center" | "end" | "stretch"
```

### Button Component

```tsx
import { Button } from "@/components/ui/button";

// Standard sizes (padding-based for consistency)
<Button size="sm">Small Button</Button>    // px-4 py-1.5
<Button size="default">Default Button</Button> // px-6 py-2
<Button size="lg">Large Button</Button>    // px-8 py-2.5
<Button size="hero">Hero Button</Button>     // px-8 py-6 text-base (rounded-2xl recommended)

// Icon sizing
<Button>
  <ArrowRight className={ui.icon.md} />
  Click me
</Button>

// Variants remain unchanged: default, secondary, outline, ghost, destructive
```

## Migration Guidelines

### DOs

- ✅ Use `Section` component for page sections with standardized spacing
- ✅ Use `Stack` component for vertical spacing within components
- ✅ Use `Container` component for consistent gutters
- ✅ Use `ui.gap.*` for consistent element spacing
- ✅ Use `ui.icon.*` for consistent icon sizing
- ✅ Use Button `size="hero"` for hero/prominent buttons

### DON'Ts

- ❌ Don't override button padding (px/py) directly - use `size` prop instead
- ❌ Don't use manual `py-*`, `px-*` classes for section padding (use Section)
- ❌ Don't use manual `space-y-*` classes (use Stack component)
- ❌ Don't use manual `px-4 sm:px-6 lg:px-8` (use Container)
- ❌ Don't use inconsistent gap values (use `ui.gap.*`)
- ❌ Don't use manual `h-4 w-4`, `h-5 w-5` (use `ui.icon.*`)

### Examples

**Before (inconsistent):**

```tsx
<div className="py-16">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div className="space-y-4">
      <div className="flex gap-6">
        <Button className="px-8 py-6">Action</Button>
      </div>
    </div>
  </div>
</div>
```

**After (standardized):**

```tsx
<Section spacing="lg">
  <Stack spacing="md">
    <div className={ui.gap.md}>
      <Button size="hero">Action</Button>
    </div>
  </Stack>
</Section>
```
