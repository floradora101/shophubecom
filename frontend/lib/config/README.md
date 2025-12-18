# Site Configuration

This directory contains site-wide configuration settings that can be managed by admins.

## Current Configuration

### Hero Carousel Background Color

The hero carousel background color can be changed by editing `site.config.ts`:

```typescript
export const siteConfig: SiteConfig = {
  heroCarousel: {
    backgroundColor: "#f3f4f6", // Change this to any color (hex, rgb, hsl, etc.)
    textColor: "#171717",
  },
};
```

### How to Change the Background Color

1. Open `frontend/lib/config/site.config.ts`
2. Modify the `backgroundColor` value in the `heroCarousel` section
3. Save the file - changes will be reflected immediately

**Example colors:**

- Light gray: `#f3f4f6`
- White: `#ffffff`
- Light blue: `#e0f2fe`
- Cream: `#fef3c7`
- Light pink: `#fce7f3`

## Future: Admin API Integration

This configuration can be easily extended to fetch from an admin API endpoint:

```typescript
// Example future implementation
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const response = await fetch("/api/admin/config");
    return await response.json();
  } catch (error) {
    // Fallback to default config
    return siteConfig;
  }
}
```

Then create an admin panel where admins can:

- Change hero carousel background color
- Update other site settings
- Save changes to database
- See preview of changes

## Database Schema (Future)

When implementing admin API, consider adding a `SiteSettings` table:

```prisma
model SiteSettings {
  id        String   @id @default(uuid())
  key       String   @unique
  value     String   @db.Text
  updatedAt DateTime @updatedAt
  updatedBy String   // User ID who made the change
}
```

