# UI Design System Guidelines

This document defines the unified design system for ShopHub frontend. All components, pages, and sections must follow these guidelines to ensure consistency across the entire application.

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Layout Components](#layout-components)
3. [Form Components](#form-components)
4. [Button System](#button-system)
5. [Card System](#card-system)
6. [Typography](#typography)
7. [Spacing System](#spacing-system)
8. [Color System](#color-system)
9. [Accessibility](#accessibility)
10. [Component Usage Examples](#component-usage-examples)

---

## Design Tokens

All design tokens are defined in `app/globals.css` and `tailwind.config.ts`. These tokens ensure consistency across the application.

### Border Radius Scale

- `--radius-xs`: 0.25rem (4px) - Small elements
- `--radius-sm`: 0.375rem (6px) - Small inputs
- `--radius-md`: 0.5rem (8px) - Default inputs
- `--radius-lg`: 0.5rem (8px) - Buttons, cards
- `--radius-xl`: 0.5rem (8px) - Small interactive elements
- `--radius-2xl`: 0.75rem (12px) - Hero sections
- `--radius-full`: 9999px - Pills, badges

**Usage:**

- Buttons: `rounded-lg` (8px)
- Cards: `rounded-lg` (8px)
- Inputs: `rounded-lg` (8px)
- Badges: `rounded-full`

### Shadow Scale

- `--shadow-xs`: Minimal shadow
- `--shadow-sm`: Default card shadow
- `--shadow-md`: Elevated cards
- `--shadow-lg`: Modals, dropdowns
- `--shadow-xl`: High elevation
- `--shadow-2xl`: Maximum elevation
- `--shadow-hover`: Hover state shadow

**Usage:**

- Default cards: `shadow-sm`
- Hover cards: `shadow-md` → `shadow-lg` on hover
- Modals: `shadow-lg` or `shadow-xl`

### Spacing Scale

- `--spacing-xs`: 0.5rem (8px)
- `--spacing-sm`: 0.75rem (12px)
- `--spacing-md`: 1rem (16px)
- `--spacing-lg`: 1.5rem (24px)
- `--spacing-xl`: 2rem (32px)
- `--spacing-2xl`: 3rem (48px)
- `--spacing-3xl`: 4rem (64px)
- `--spacing-4xl`: 5rem (80px)

**Section Spacing:**

- Small sections: `py-10 md:py-16` (mobile: 40px, desktop: 64px)
- Medium sections: `py-16 md:py-24` (mobile: 64px, desktop: 96px)
- Large sections: `py-24 md:py-32` (mobile: 96px, desktop: 128px)

---

## Layout Components

### Container

Standardized container with consistent max-width and padding.

```tsx
import { Container } from "@/components/ui/container";

<Container size="lg">
  {" "}
  {/* sm | md | lg | xl | full */}
  {/* Content */}
</Container>;
```

**Sizes:**

- `sm`: max-w-3xl
- `md`: max-w-5xl
- `lg`: max-w-7xl (default)
- `xl`: max-w-[1400px]
- `full`: max-w-full

**Padding:** `px-4 sm:px-6 lg:px-8` (mobile: 16px, tablet: 24px, desktop: 32px)

### Section

Consistent section spacing and backgrounds.

```tsx
import { Section } from "@/components/ui/section";

<Section spacing="md" background="white">
  {/* Content */}
</Section>;
```

**Spacing:**

- `sm`: py-10 md:py-16
- `md`: py-16 md:py-24 (default)
- `lg`: py-24 md:py-32
- `xl`: py-32 md:py-40
- `2xl`: py-40 md:py-48

**Backgrounds:**

- `white`: bg-white
- `gray`: bg-warm-gray-50
- `primary`: bg-primary-50
- `transparent`: bg-transparent

### Stack

Vertical spacing component.

```tsx
import { Stack } from "@/components/ui/stack";

<Stack spacing="md" align="start">
  {/* Items */}
</Stack>;
```

**Spacing:** `xs | sm | md | lg | xl`
**Align:** `start | center | end | stretch`

### Grid

Responsive grid layout.

```tsx
import { Grid } from "@/components/ui/grid";

<Grid cols={3} gap="md">
  {/* Items */}
</Grid>;
```

**Columns:** `1 | 2 | 3 | 4 | 6 | 12` (responsive)
**Gap:** `xs | sm | md | lg | xl`

### PageHeader

Consistent page headers.

```tsx
import { PageHeader } from "@/components/ui/page-header";

<PageHeader
  title="Page Title"
  description="Optional description"
  actions={<Button>Action</Button>}
/>;
```

---

## Form Components

All form components follow consistent styling:

- **Height:** `h-10` (40px) for inputs
- **Border:** `border-warm-gray-300`
- **Focus:** `border-primary-500` + `ring-2 ring-primary-500`
- **Error:** `border-error` + `ring-error/20`
- **Label spacing:** `mb-2` (8px gap)
- **Helper text:** `mt-1.5` (6px gap)

### Input

```tsx
import { Input } from "@/components/ui/input";

<Input
  label="Email"
  type="email"
  error={errors.email?.message}
  helperText="We'll never share your email"
  {...register("email")}
/>;
```

### Textarea

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea
  label="Message"
  rows={4}
  error={errors.message?.message}
  {...register("message")}
/>;
```

### Select

```tsx
import { Select } from "@/components/ui/select";

<Select
  label="Country"
  options={[
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
  ]}
  error={errors.country?.message}
  {...register("country")}
/>;
```

### Checkbox

```tsx
import { Checkbox } from "@/components/ui/checkbox";

<Checkbox
  label="I agree to the terms"
  error={errors.terms?.message}
  {...register("terms")}
/>;
```

### Radio

```tsx
import { Radio } from "@/components/ui/radio";

<Radio
  label="Option 1"
  value="option1"
  error={errors.option?.message}
  {...register("option")}
/>;
```

---

## Button System

All buttons use the unified Button component.

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="default">
  Click me
</Button>;
```

### Variants

- `default`: Primary action (bg-primary-500)
- `secondary`: Secondary action (bg-warm-gray-100)
- `outline`: Outlined button (border-2)
- `ghost`: Minimal button (hover:bg-warm-gray-100)
- `link`: Text link style
- `destructive`: Delete/danger actions (bg-error)

### Sizes

- `sm`: h-9 px-4 text-sm
- `default`: h-10 px-6 (default)
- `lg`: h-11 px-8 text-base
- `icon`: h-10 w-10

### States

- **Hover:** Consistent transition (duration-200)
- **Focus:** `ring-2 ring-primary-500 ring-offset-2`
- **Disabled:** `opacity-50 cursor-not-allowed`
- **Loading:** Use `isLoading` prop

### Rules

- ✅ Use Button component, not custom buttons
- ✅ Consistent height: `h-10` default
- ✅ Consistent padding: `px-6` default
- ✅ Consistent font: `text-sm font-medium`
- ✅ Always include focus states
- ❌ Don't use `rounded-full` unless specifically needed
- ❌ Don't override height/padding without justification

---

## Card System

Consistent card styling across the application.

```tsx
import { Card } from "@/components/ui/card";

<Card padding="md" shadow="sm" hover>
  {/* Content */}
</Card>;
```

### Properties

- **Radius:** `rounded-lg` (8px) - fixed
- **Border:** `border-warm-gray-200` - fixed
- **Background:** `bg-white` - fixed
- **Padding:** `none | sm (p-4) | md (p-6) | lg (p-8)`
- **Shadow:** `none | sm | md | lg`
- **Hover:** `hover:shadow-lg hover:border-warm-gray-300`

### Usage

- Product cards: `padding="md" shadow="sm" hover`
- Info cards: `padding="lg" shadow="md"`
- Modal content: `padding="lg" shadow="lg"`

---

## Typography

Use Typography components for consistent text styling.

```tsx
import { Heading, Text } from "@/components/ui/typography";

<Heading level={1}>Main Title</Heading>
<Heading level={2}>Section Title</Heading>
<Text size="lg" weight="semibold">Body text</Text>
```

### Heading Levels

- `level={1}`: text-4xl md:text-5xl lg:text-6xl (Hero titles)
- `level={2}`: text-3xl md:text-4xl lg:text-5xl (Page titles)
- `level={3}`: text-2xl md:text-3xl (Section titles)
- `level={4}`: text-xl md:text-2xl (Subsection titles)
- `level={5}`: text-lg md:text-xl
- `level={6}`: text-base md:text-lg

### Text Sizes

- `sm`: text-sm
- `base`: text-base (default)
- `lg`: text-lg
- `xl`: text-xl

### Font Families

- **Display:** `font-display` (Crimson Pro) - Headlines - more masculine serif
- **Body:** `font-body` (Inter) - Body text (default)
- **Accent:** `font-accent` (Righteous) - Special accents

### Color Scale

- **Primary text:** `text-warm-gray-900` (headings)
- **Body text:** `text-warm-gray-700` (body)
- **Secondary text:** `text-warm-gray-600` (muted)
- **Tertiary text:** `text-warm-gray-500` (helper text)

---

## Spacing System

### Component Spacing

- **Form fields:** `gap-4` (16px) between fields
- **Form groups:** `gap-6` (24px) between groups
- **Card content:** `space-y-4` (16px) vertical spacing
- **Button groups:** `gap-2` (8px) or `gap-3` (12px)

### Section Spacing

Always use Section component for consistent spacing:

```tsx
<Section spacing="md">
  {" "}
  {/* py-16 md:py-24 */}
  <Container>{/* Content */}</Container>
</Section>
```

### Container Padding

- **Mobile:** `px-4` (16px)
- **Tablet:** `sm:px-6` (24px)
- **Desktop:** `lg:px-8` (32px)

---

## Color System

### Primary Colors

- `primary-50` through `primary-900`
- Primary action: `primary-500` (#fb0a03)
- Hover: `primary-600`
- Active: `primary-600`

### Neutral Colors (Warm Gray)

- `warm-gray-50` through `warm-gray-900`
- Borders: `warm-gray-200` / `warm-gray-300`
- Text: `warm-gray-700` (body), `warm-gray-900` (headings)
- Backgrounds: `warm-gray-50` / `warm-gray-100`

### Secondary Colors

- `secondary-50` through `secondary-800` (warm amber palette)
- Secondary accent: `secondary-500` (#f59e0b)

### Semantic Colors

- **Success:** `success` (#10b981)
- **Error:** `error` (#ef4444)
- **Warning:** `warning` (#f59e0b)
- **Info:** `info` (#3b82f6)

### Usage Rules

- ✅ Use `warm-gray-*` instead of `gray-*` for consistency
- ✅ Use `warm-gray-200` for borders
- ✅ Use `warm-gray-700` for body text
- ✅ Use `warm-gray-900` for headings
- ❌ Don't mix `gray-*` and `warm-gray-*`

---

## Accessibility

### Focus States

All interactive elements must have visible focus states:

```tsx
className =
  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use semantic HTML (`button`, `a`, `input`)
- Provide skip links for main content

### Reduced Motion

Animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  /* Animations disabled */
}
```

### ARIA Labels

- Buttons without text: `aria-label`
- Form fields: Proper `label` associations
- Error messages: `aria-describedby`

---

## Component Usage Examples

### Form Layout

```tsx
<Card padding="lg">
  <Stack spacing="md">
    <Heading level={3}>Form Title</Heading>

    <div className="grid gap-4 md:grid-cols-2">
      <Input label="First Name" {...register("firstName")} />
      <Input label="Last Name" {...register("lastName")} />
    </div>

    <Textarea label="Message" rows={4} {...register("message")} />

    <div className="flex gap-3 justify-end">
      <Button variant="outline">Cancel</Button>
      <Button type="submit">Submit</Button>
    </div>
  </Stack>
</Card>
```

### Page Layout

```tsx
<Section spacing="md" background="white">
  <Container>
    <PageHeader
      title="Page Title"
      description="Page description"
      actions={<Button>New Item</Button>}
    />

    <Grid cols={3} gap="md">
      {items.map((item) => (
        <Card key={item.id} hover>
          {/* Card content */}
        </Card>
      ))}
    </Grid>
  </Container>
</Section>
```

### Product Card

```tsx
<Card padding="md" shadow="sm" hover className="group">
  <div className="space-y-3">
    <ProductImage src={product.image} alt={product.name} />
    <div>
      <Heading level={5}>{product.name}</Heading>
      <Text size="sm" className="text-warm-gray-600">
        {product.description}
      </Text>
    </div>
    <div className="flex items-center justify-between">
      <Price amount={product.price} />
      <Button size="sm">Add to Cart</Button>
    </div>
  </div>
</Card>
```

---

## Checklist for New Components

When creating new components, ensure:

- [ ] Uses design tokens (radius, spacing, colors)
- [ ] Uses Container/Section for layout
- [ ] Uses Button component (not custom buttons)
- [ ] Uses Input/Textarea/Select for forms
- [ ] Uses Card component for card layouts
- [ ] Includes focus states
- [ ] Uses warm-gray colors (not gray)
- [ ] Consistent spacing (gap-4, gap-6)
- [ ] Responsive (mobile-first)
- [ ] Accessibility (ARIA labels, keyboard nav)

---

## Migration Notes

### Replacing Custom Styles

**Before:**

```tsx
<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
```

**After:**

```tsx
<Card padding="md" shadow="md">
```

**Before:**

```tsx
<button className="h-10 px-6 rounded-lg bg-primary-500 text-white">
```

**After:**

```tsx
<Button variant="default">
```

**Before:**

```tsx
<input className="h-10 rounded-lg border border-gray-300 px-3" />
```

**After:**

```tsx
<Input {...register("field")} />
```

---

## Questions?

If you're unsure about styling decisions:

1. Check existing components in `components/ui/`
2. Refer to this guide
3. Use design tokens from `globals.css`
4. Follow the examples above

**Remember:** Consistency is key. When in doubt, use the shared components and tokens.
