import type { HeroSlide } from "@/lib/types/heroSlides.types";

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "product-spotlight-1",
    type: "PRODUCT_SPOTLIGHT",
    priority: 10,
    isActive: true,
    // startsAt: undefined (always active)
    // No endsAt - no expiry

    badgeText: "Limited Time Deal",
    headline: "Experience",
    highlight: "Next-Gen Performance",
    description:
      "The latest flagship smartphone delivers incredible speed with its A17 Pro chip, stunning camera system, and all-day battery life. Don't miss out on this premium device.",

    ctaPrimary: {
      label: "Shop Now",
      href: "/products/iphone-15-pro-max",
    },
    ctaSecondary: {
      label: "Compare Models",
      href: "/categories/smartphones",
    },

    media: {
      kind: "product",
      productSlug: "iphone-15-pro-max",
      alt: "iPhone 15 Pro Max in Natural Titanium",
    },

    theme: {
      accentToken: "primary",
    },
  },
  {
    id: "category-spotlight-1",
    type: "CATEGORY_SPOTLIGHT",
    priority: 8,
    isActive: true,
    // startsAt: undefined (always active)
    // No endsAt - no expiry

    badgeText: "Shop by Category",
    headline: "Gaming",
    highlight: "Perfection Awaits",
    description:
      "Level up your gaming experience with our curated selection of high-performance laptops designed for gamers who demand the best.",

    categoryBullets: [
      "Latest RTX 40-series graphics cards",
      "144Hz+ displays with ultra-low latency",
      "Premium cooling systems for marathon sessions",
    ],

    ctaPrimary: {
      label: "Explore Gaming Laptops",
      href: "/categories/gaming-laptops",
    },
    ctaSecondary: {
      label: "View All Categories",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-27.jpg",
      alt: "High-performance Honor phone with premium features",
    },

    theme: {
      accentToken: "blue",
    },
  },
  {
    id: "offer-slide-1",
    type: "OFFER",
    priority: 15, // High priority for offers
    isActive: true,
    // startsAt: undefined (always active)
    endsAt: "2026-12-31T23:59:59Z",

    badgeText: "Flash Sale",
    headline: "Holiday",
    highlight: "Savings Event",
    description:
      "Get up to 50% off on select electronics and accessories. This exclusive offer ends soon - shop now and save big on premium tech!",

    offerLabel: "UP TO 50% OFF",
    offerEndsAt: "2026-12-31T23:59:59Z",
    promoCode: "HOLIDAY50",

    ctaPrimary: {
      label: "Shop Sale Now",
      href: "/categories/electronics?onSale=true",
    },
    ctaSecondary: {
      label: "View All Deals",
      href: "/offers",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      alt: "Vibrant holiday sale banner with festive decorations and shopping discounts",
    },

    theme: {
      accentToken: "green",
    },
  },
  {
    id: "testimonial-slide-1",
    type: "TESTIMONIAL",
    priority: 20,
    isActive: true,
    // startsAt: undefined (always active)
    // No endsAt - no expiry

    badgeText: "Customer Stories",
    headline: "Trusted by",
    highlight: "Thousands ",
    description:
      "Join our community of satisfied customers who choose quality, reliability, and exceptional service for all their tech needs.",

    quote:
      '"The customer service is outstanding, and the product quality exceeds expectations. I\'ve been a loyal customer for years and recommend this store to everyone."',
    authorName: "Sarah M.",
    rating: 5,
    stats: [
      { label: "Happy Customers", value: "50K+" },
      { label: "Products Sold", value: "100K+" },
      { label: "Average Rating", value: "4.9/5" },
    ],

    ctaPrimary: {
      label: "Join Our Community",
      href: "/register",
    },
    ctaSecondary: {
      label: "Read Reviews",
      href: "/reviews",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Natural-Titanium.jpg",
      alt: "Happy customer with iPhone 16 Pro",
    },

    theme: {
      accentToken: "primary",
    },
  },
];

// Legacy export for backward compatibility
export const mockHeroSlides = HERO_SLIDES;

// Mock function to simulate backend API
export function getHeroSlides(): Promise<HeroSlide[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockHeroSlides), 100); // Simulate network delay
  });
}
