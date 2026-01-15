# Navigation Rendering Best Practices

## 🔍 **The Issue**

On first page load, the "SHOP ALL" button appeared first, then category links appeared after ~1 second. This created a **Flash of Incomplete Content (FOIC)**.

**Root Cause:**
- Header component is a Client Component (`"use client"`)
- Categories are fetched client-side in `useEffect` after component mount
- "SHOP ALL" button was always rendered (not conditional)
- Category links were conditionally rendered, causing the flash

## ✅ **Solution Implemented**

**Hide the entire navigation menu until categories are loaded.**

- Added `categoriesLoading` state (starts as `true`)
- Wrapped entire `<NavigationMenu.Root>` in conditional: `{!categoriesLoading && ...}`
- Navigation menu appears only when categories are ready
- Header structure (logo, search, cart, auth) remains visible

**Result:** No flash - navigation appears complete when ready.

## 🎯 **Best Practices for First Page Render**

### 1. **Server-Side Rendering (SSR) - BEST ⭐**
**For Next.js App Router:**
```typescript
// Server Component
async function Layout() {
  const categories = await getAllCategories(); // Server-side
  return <Header categories={categories} />
}
```

**Pros:**
- Zero flash - data available before React hydration
- SEO-friendly - content in initial HTML
- Fastest perceived performance
- No client-side fetch delay

**Cons:**
- Requires refactoring Header to accept props
- Categories cached per request (can use React Query for caching)

### 2. **Loading States with Skeletons - GOOD**
**Show placeholder while loading:**
```typescript
{categoriesLoading ? (
  <NavigationSkeleton /> // Show skeleton
) : (
  <NavigationMenu categories={categories} />
)}
```

**Pros:**
- Shows something is loading (better UX than empty)
- Prevents layout shift
- Good perceived performance

**Cons:**
- Still requires client-side fetch
- More code complexity

### 3. **Hide Until Ready - CURRENT IMPLEMENTATION**
**Don't render until data is ready:**
```typescript
{!categoriesLoading && <NavigationMenu categories={categories} />}
```

**Pros:**
- Simple implementation
- No flash of incomplete content
- Clean when data loads quickly

**Cons:**
- Navigation might appear "late" on slow connections
- Less ideal UX than skeleton

### 4. **React Query / SWR with Caching**
**Use data fetching libraries:**
```typescript
const { data: categories, isLoading } = useCategoriesQuery();
```

**Pros:**
- Built-in caching reduces refetches
- Better loading/error states
- Consistent with modern React patterns

**Cons:**
- Still client-side fetch
- Requires library setup

### 5. **Static Generation with Revalidation**
**Pre-render at build time:**
```typescript
export async function getStaticProps() {
  const categories = await getAllCategories();
  return { props: { categories }, revalidate: 3600 };
}
```

**Pros:**
- Categories in initial HTML
- No fetch delay
- Good for semi-static data

**Cons:**
- Requires rebuild for updates
- Not ideal for frequently changing data

## 📊 **Comparison Table**

| Approach | Flash Prevention | Performance | Complexity | Recommended For |
|----------|-----------------|-------------|------------|-----------------|
| **Server-Side Rendering** | ✅ Perfect | ⭐⭐⭐⭐⭐ | Medium | Production apps |
| **Skeletons** | ✅ Good | ⭐⭐⭐⭐ | Low | Quick fix |
| **Hide Until Ready** | ✅ Good | ⭐⭐⭐ | Low | Current implementation |
| **React Query** | ✅ Good | ⭐⭐⭐⭐ | Medium | Apps with caching needs |
| **Static Generation** | ✅ Perfect | ⭐⭐⭐⭐⭐ | Medium | Static/semi-static data |

## 🎨 **UX Guidelines**

### What to Show on First Render?

1. **Header Structure (Logo, Search, Cart)** - ✅ Always show
   - Essential navigation elements
   - Don't block on categories

2. **Navigation Menu** - Depends on approach:
   - **Server-side**: Show immediately (data ready)
   - **Client-side**: Show skeleton OR hide until ready
   - **Never show incomplete navigation** (causes flash)

3. **Page Content** - Show immediately with loading states
   - Hero section
   - Page structure
   - Loading skeletons for async content

### Navigation-Specific Rules:

- ✅ **DO**: Show navigation complete or not at all
- ✅ **DO**: Use skeletons for better perceived performance
- ✅ **DO**: Fetch server-side when possible
- ❌ **DON'T**: Show partial navigation (flash)
- ❌ **DON'T**: Block entire header on category fetch
- ❌ **DON'T**: Show empty navigation menu

## 🚀 **Recommended Next Steps**

### For Production:

1. **Refactor Header to accept categories as props**
   ```typescript
   interface HeaderProps {
     categories?: Category[];
   }
   ```

2. **Fetch categories server-side in layout/page**
   ```typescript
   // app/layout.tsx or app/(shop)/layout.tsx
   const categories = await getAllCategories();
   ```

3. **Pass categories to Header component**
   ```typescript
   <Header categories={categories} />
   ```

4. **Keep client-side fetch as fallback**
   ```typescript
   const [localCategories, setLocalCategories] = useState(props.categories || []);
   ```

### For Current Implementation:

- Current solution (hide until ready) is acceptable
- Works well for development/testing
- Consider server-side for production

## 📝 **Code Example: Server-Side Approach**

```typescript
// app/(shop)/layout.tsx
import { getAllCategories } from "@/lib/data/categories";
import { Header } from "@/components/layout/Header";

export default async function ShopLayout({ children }) {
  const categories = await getAllCategories();

  return (
    <>
      <Header categories={categories} />
      {children}
    </>
  );
}
```

```typescript
// components/layout/Header.tsx
interface HeaderProps {
  categories?: Category[];
}

export function Header({ categories: initialCategories }: HeaderProps) {
  const [categories, setCategories] = useState(initialCategories || []);
  const [categoriesLoading, setCategoriesLoading] = useState(!initialCategories);

  useEffect(() => {
    if (!initialCategories) {
      getAllCategories()
        .then(setCategories)
        .finally(() => setCategoriesLoading(false));
    }
  }, [initialCategories]);

  // ... rest of component
}
```

## 🎯 **Key Takeaways**

1. **Flash of Incomplete Content** = Bad UX
2. **Server-side rendering** = Best solution for navigation
3. **Show complete or not at all** = Golden rule
4. **Skeletons** = Better than empty
5. **Current fix** = Works, but server-side is better long-term
