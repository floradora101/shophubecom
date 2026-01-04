import type { HeroSlide } from "@/lib/types/heroSlides.types";

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "landscape-hero-1",
    type: "LANDSCAPE_IMAGE",
    priority: 40, // Higher priority = earlier in carousel (above PRODUCT_SPOTLIGHT at 30)
    isActive: true,
    // startsAt: undefined (always active)
    // No endsAt - no expiry

    badgeText: "🌄 Landscape Hero",
    subtitle: "Full-frame landscape image experience",
    headline: "Welcome to the",
    highlight: "Landscape Era",
    description:
      "Experience cutting-edge innovation with our curated selection of premium electronics. From the latest smartphones to professional-grade accessories, discover products that blend performance, style, and reliability.",

    ctaPrimary: {
      label: "Explore Collection",
      href: "/categories",
    },
    ctaSecondary: {
      label: "Shop Deals",
      href: "/offers",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=1200&h=800&fit=crop&crop=center",
      alt: "Minimalist technology workspace with essential devices",
      position: "center", // Optional: center|top|bottom|left|right for deliberate cropping
    },

    theme: {
      accentToken: "red-black",
    },

    // Landscape hero specific properties
    textPosition: "center",
    overlayOpacity: 0.4,
  },
  {
    id: "product-spotlight-1",
    type: "PRODUCT_SPOTLIGHT",
    priority: 30, // Highest priority
    isActive: true,
    // startsAt: undefined (always active)
    // No endsAt - no expiry

    badgeText: "Mega Sale - 33% Off",
    headline: "Premium Audio",
    highlight: "Redefined",
    description:
      "Experience industry-leading noise cancellation with crystal clear sound quality. Available in 5 stunning colors with premium comfort and 30-hour battery life.",

    ctaPrimary: {
      label: "Shop Premium Audio",
      href: "/products/sony-wf-1000xm5-premium",
    },
    ctaSecondary: {
      label: "View All Earbuds",
      href: "/categories/earphones",
    },

    media: {
      kind: "product",
      productSlug: "sony-wf-1000xm5-premium",
      alt: "Sony WF-1000XM5 Premium Edition Wireless Earbuds",
    },

    theme: {
      accentToken: "red-blue",
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
    headline: "iPhone",
    highlight: "Perfection Awaits",
    description:
      "Discover the latest iPhone models with cutting-edge technology, stunning cameras, and premium performance that sets the standard for smartphones.",

    categoryBullets: [
      "Latest A17 Pro chip for incredible speed",
      "Advanced camera systems with ProRAW",
      "All-day battery life with fast charging",
    ],

    ctaPrimary: {
      label: "Explore iPhones",
      href: "/categories/phones",
    },
    ctaSecondary: {
      label: "View All Categories",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      alt: "Latest iPhone 16 Pro in Natural Titanium",
      aspect: "landscape", // Optional: landscape|default - landscape uses wider aspect ratios and always object-cover
    },

    theme: {
      accentToken: "red-burgundy",
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
      accentToken: "red-gray",
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
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      alt: "Happy customer with iPhone 16 Pro",
    },

    theme: {
      accentToken: "red-orange",
    },
  },
  {
    id: "delivery-payment-slide-1",
    type: "CATEGORY_SPOTLIGHT",
    priority: 12,
    isActive: true,
    // startsAt: undefined (always active)
    // No endsAt - no expiry

    badgeText: "Fast & Reliable",
    headline: "Free Delivery",
    highlight: "Across Lebanon",
    description:
      "Shop with confidence knowing your orders arrive safely and quickly, with flexible payment options.",

    categoryBullets: [
      "FREE DELIVERY ALL OVER LEBANON",
      "Same-day delivery in Beirut",
      "3-day exchange policy",
      "Secure payment processing",
    ],

    ctaPrimary: {
      label: "Start Shopping",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      alt: "Fast delivery service with secure packaging for electronics",
    },

    theme: {
      accentToken: "blue-green",
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
