import type {
  HeroSlide,
  ComparisonBattleSlide,
} from "@/lib/types/heroSlides.types";

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "battle-2026-laptops",
    type: "COMPARISON_BATTLE",
    priority: 120, // Highest priority to show first
    isActive: true,
    headline: "The 2026 Flagship Battle",
    description:
      "Witness the clash of engineering titans. Raw power meets architectural elegance in our most anticipated comparison yet.",
    badgeText: "ULTIMATE FACE-OFF",
    leftProductSlug: "iphone-15-pro-max",
    rightProductSlug: "samsung-galaxy-s24-ultra",
    comparisonPoints: [
      {
        label: "Processor",
        leftValue: "A17 Pro Chip",
        rightValue: "Snapdragon 8 Gen 3",
      },
      {
        label: "Display",
        leftValue: "ProMotion OLED",
        rightValue: "120Hz AMOLED",
      },
      { label: "Battery", leftValue: "29 Hours", rightValue: "30 Hours" },
      { label: "Design", leftValue: "Titanium", rightValue: "Titanium/Glass" },
    ],
    ctaPrimary: {
      label: "Select Challenger",
      href: "/products",
    },
    media: {
      kind: "none",
    },
  },
  {
    id: "landscape-clean-modern",
    type: "LANDSCAPE_IMAGE",
    priority: 110,
    isActive: true,
    theme: "clean-modern",
    content: {
      badge: "The Future of Retail",
      headline: "Absolute",
      highlight: "Minimalism",
      description:
        "Experience a new standard of digital shopping. Clean lines, lightning speed, and a curated selection of world-class tech.",
    },
    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1510511459019-5dee995d3ff4?w=1600&h=900&fit=crop",
      alt: "Clean high-tech aesthetic workspace",
    },
    actionButton: {
      label: "Shop Collection",
      href: "/collections/modern",
    },
  },
  {
    id: "landscape-glass-red",
    type: "LANDSCAPE_IMAGE",
    priority: 100,
    isActive: true,
    theme: "glass-red",
    content: {
      badge: "Winter Collection 2026",
      headline: "The Art of",
      highlight: "Pure Performance",
      description:
        "Discover our most advanced engineering yet. A perfect fusion of breathtaking aesthetics and raw power.",
    },
    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&h=900&fit=crop",
      alt: "Performance tech with red glow",
    },
    actionButton: {
      label: "Explore Now",
      href: "/categories/performance",
    },
  },
  {
    id: "landscape-minimal-white",
    type: "LANDSCAPE_IMAGE",
    priority: 95,
    isActive: true,
    theme: "minimal-white",
    content: {
      badge: "Exclusive Release",
      headline: "Elegance in",
      highlight: "Every Detail",
      description:
        "Minimalist design language meets high-fidelity sound. Redefining what premium looks like in 2026.",
    },
    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1600&h=900&fit=crop",
      alt: "Minimalist white electronics",
    },
    actionButton: {
      label: "Discover",
      href: "/categories/premium",
    },
  },
  {
    id: "landscape-bold-dark",
    type: "LANDSCAPE_IMAGE",
    priority: 90,
    isActive: true,
    theme: "bold-dark",
    content: {
      badge: "Limited Edition",
      headline: "Power Without",
      highlight: "Compromise",
      description:
        "Built for those who demand the impossible. Experience the pinnacle of technological achievement.",
    },
    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&h=900&fit=crop",
      alt: "Bold dark tech gear",
    },
    actionButton: {
      label: "Get Access",
      href: "/offers/limited",
    },
  },
  {
    id: "landscape-centered-glass",
    type: "LANDSCAPE_IMAGE",
    priority: 85,
    isActive: true,
    theme: "centered-glass",
    content: {
      badge: "Innovation Hub",
      headline: "Design the",
      highlight: "Future Today",
      description:
        "Join a new era of creators using tools designed for the next decade. Experience unmatched precision and speed.",
    },
    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop",
      alt: "Futuristic digital landscape",
    },
    actionButton: {
      label: "Start Creating",
      href: "/categories/innovation",
    },
  },
  {
    id: "landscape-right-industrial",
    type: "LANDSCAPE_IMAGE",
    priority: 80,
    isActive: true,
    theme: "right-industrial",
    content: {
      badge: "Industrial Grade",
      headline: "Built for",
      highlight: "Extreme Tasks",
      description:
        "Military-spec hardware for those who work in the toughest environments. Reliability that never sleeps.",
    },
    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&h=900&fit=crop",
      alt: "Industrial machinery with technical interface",
    },
    actionButton: {
      label: "View Specs",
      href: "/categories/industrial",
    },
  },
  {
    id: "product-spotlight-1",
    type: "PRODUCT_SPOTLIGHT",
    priority: 30,
    isActive: true,
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
  },
  {
    id: "offer-slide-1",
    type: "OFFER",
    priority: 15,
    isActive: true,
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
      alt: "Vibrant holiday sale banner",
    },
  },
  {
    id: "testimonial-slide-1",
    type: "TESTIMONIAL",
    priority: 20,
    isActive: true,
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
      alt: "Happy customer",
    },
  },
  {
    id: "category-spotlight-laptops",
    type: "CATEGORY_SPOTLIGHT",
    priority: 75,
    isActive: true,
    badgeText: "Tech Spotlight 2026",
    headline: "Premium Laptops",
    description:
      "Elite performance hardware for the next generation of digital excellence. Discover our curated collection of gaming and business laptops.",
    ctaPrimary: {
      label: "Explore Laptops",
      href: "/products?category=laptops",
    },
    ctaSecondary: {
      label: "View All Categories",
      href: "/categories",
    },
    categorySlug: "laptops",
    categoryBullets: [
      "MacBook Pro M3 Max",
      "ASUS ROG Zephyrus G14",
      "Dell XPS 15 OLED",
    ],
    media: {
      kind: "none",
    },
  },
  {
    id: "editors-pick-2026",
    type: "EDITORS_PICK",
    priority: 70,
    isActive: true,
    badgeText: "Staff Favorites",
    headline: "The Best of",
    highlight: "2026 Selection",
    description:
      "Our team has tested hundreds of products. These are the ones we personally use and love.",
    editorNote:
      "This selection focuses on durability and minimalist design. Each piece represents the best value in its category.",
    productSlugs: [
      "iphone-15-pro-max",
      "ipad-pro-12-9-m4",
      "macbook-pro-16-m3-max",
      "sony-wf-1000xm5-premium",
    ],
    ctaPrimary: {
      label: "View All Picks",
      href: "/collections/editors-picks",
    },
    media: {
      kind: "none",
    },
  },
];

export const mockHeroSlides = HERO_SLIDES;

export function getHeroSlides(): Promise<HeroSlide[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockHeroSlides), 100);
  });
}
