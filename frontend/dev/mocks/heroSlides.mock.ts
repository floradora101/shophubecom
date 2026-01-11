import type { HeroSlide } from "@/lib/types/heroSlides.types";

export const HERO_SLIDES: HeroSlide[] = [
  // Text Decoration Showcase Slides - All 9 Decoration Types
  {
    id: "decoration-none",
    type: "LANDSCAPE_IMAGE",
    priority: 60, // Highest priority
    isActive: true,

    content: {
      badgeText: "Plain Text",
      headline: "No Decoration",
      highlight: "Default Style",
      description:
        "Clean, plain white text without any special effects or decorations.",
    },

    textStyle: {
      variant: "minimal",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "none",
      badgeVariant: "solid",
    },

    ctaPrimary: {
      label: "View Plain",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=1200&h=800&fit=crop&crop=center",
      alt: "Clean minimal workspace with laptop",
      position: "center",
    },

    overlay: {
      opacity: 0.4,
      type: "solid",
    },
  },
  {
    id: "decoration-underline",
    type: "LANDSCAPE_IMAGE",
    priority: 59,
    isActive: true,

    content: {
      badgeText: "Underline",
      headline: "Red Underline",
      highlight: "Decoration",
      description:
        "Text features a prominent red underline beneath the headline.",
    },

    textStyle: {
      variant: "editorial",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "underline",
      badgeVariant: "pill",
    },

    ctaPrimary: {
      label: "See Underline",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=800&fit=crop&crop=center",
      alt: "Modern office workspace with technology",
      position: "center",
    },

    overlay: {
      opacity: 0.3,
      type: "solid",
    },
  },
  {
    id: "decoration-gradient",
    type: "LANDSCAPE_IMAGE",
    priority: 58,
    isActive: true,

    content: {
      badgeText: "Gradient",
      headline: "Gradient Text",
      highlight: "Effect",
      description:
        "Beautiful gradient text flowing from white through red to white again.",
    },

    textStyle: {
      variant: "glass",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "gradient",
      badgeVariant: "outline",
    },

    ctaPrimary: {
      label: "View Gradient",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=800&fit=crop&crop=center",
      alt: "Clean circuit board pattern",
      position: "center",
    },

    overlay: {
      opacity: 0.4,
      type: "gradient",
    },
  },
  {
    id: "decoration-accent-bar",
    type: "LANDSCAPE_IMAGE",
    priority: 57,
    isActive: true,

    content: {
      badgeText: "Accent Bar",
      headline: "Red Accent Bar",
      highlight: "Beneath Text",
      description:
        "A solid red bar appears beneath the headline text for emphasis.",
    },

    textStyle: {
      variant: "editorial",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "underline",
      badgeVariant: "solid",
    },

    ctaPrimary: {
      label: "See Accent Bar",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=800&fit=crop&crop=center",
      alt: "Modern tech workspace",
      position: "center",
    },

    overlay: {
      opacity: 0.3,
      type: "solid",
    },
  },
  {
    id: "decoration-outline",
    type: "LANDSCAPE_IMAGE",
    priority: 56,
    isActive: true,

    content: {
      badgeText: "Outline",
      headline: "Red Outline",
      highlight: "Stroke Effect",
      description:
        "White text with a striking red outline stroke for high contrast.",
    },

    textStyle: {
      variant: "minimal",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "outline",
      badgeVariant: "solid",
    },

    ctaPrimary: {
      label: "View Outline",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=1200&h=800&fit=crop&crop=center",
      alt: "Clean workspace with laptop and coffee",
      position: "center",
    },

    overlay: {
      opacity: 0.5,
      type: "solid",
    },
  },
  {
    id: "decoration-outline-fill",
    type: "LANDSCAPE_IMAGE",
    priority: 55,
    isActive: true,

    content: {
      badgeText: "Outline Fill",
      headline: "Red Outline",
      highlight: "Fill Effect",
      description:
        "Red outline with transparent fill creating a unique layered effect.",
    },

    textStyle: {
      variant: "glass",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "outlineFill",
      badgeVariant: "outline",
    },

    ctaPrimary: {
      label: "See Outline Fill",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=800&fit=crop&crop=center",
      alt: "Abstract circuit board design",
      position: "center",
    },

    overlay: {
      opacity: 0.4,
      type: "solid",
    },
  },
  {
    id: "decoration-glow",
    type: "LANDSCAPE_IMAGE",
    priority: 54,
    isActive: true,

    content: {
      badgeText: "Glow Effect",
      headline: "Red Glow",
      highlight: "Text Effect",
      description: "White text with a soft red glow effect around the letters.",
    },

    textStyle: {
      variant: "editorial",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "glow",
      badgeVariant: "pill",
    },

    ctaPrimary: {
      label: "View Glow",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=800&fit=crop&crop=center",
      alt: "Modern desk with laptop and gadgets",
      position: "center",
    },

    overlay: {
      opacity: 0.6,
      type: "solid",
    },
  },
  {
    id: "decoration-red-accent",
    type: "LANDSCAPE_IMAGE",
    priority: 53,
    isActive: true,

    content: {
      badgeText: "Red Accent",
      headline: "Red Accent",
      highlight: "Overlay Effect",
      description:
        "White text with a red accent overlay creating depth and contrast.",
    },

    textStyle: {
      variant: "minimal",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "redAccent",
      badgeVariant: "solid",
    },

    ctaPrimary: {
      label: "See Red Accent",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=1200&h=800&fit=crop&crop=center",
      alt: "Clean modern workspace setup",
      position: "center",
    },

    overlay: {
      opacity: 0.4,
      type: "solid",
    },
  },
  {
    id: "decoration-neon",
    type: "LANDSCAPE_IMAGE",
    priority: 52,
    isActive: true,

    content: {
      badgeText: "Neon Glow",
      headline: "Neon Effect",
      highlight: "Red Glow",
      description:
        "Dramatic neon-style red glow effects around the white text.",
    },

    textStyle: {
      variant: "editorial",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "glow",
      badgeVariant: "solid",
    },

    ctaPrimary: {
      label: "View Neon",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=800&fit=crop&crop=center",
      alt: "Modern tech workspace with neon elements",
      position: "center",
    },

    overlay: {
      opacity: 0.7,
      type: "solid",
    },
  },
  // New trendy decoration showcase slides
  {
    id: "decoration-double-underline",
    type: "LANDSCAPE_IMAGE",
    priority: 65,
    isActive: true,

    content: {
      badgeText: "Double Underline",
      headline: "Double",
      highlight: "Underline",
      description:
        "Bold double underline effect with primary and secondary lines for maximum impact.",
    },

    textStyle: {
      variant: "minimal",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "doubleUnderline",
      highlightEffect: "bounce",
      badgeVariant: "solid",
    },

    ctaPrimary: {
      label: "See Double Underline",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=1200&h=800&fit=crop&crop=center",
      alt: "Clean workspace with double underline text",
      position: "center",
    },

    overlay: {
      opacity: 0.4,
      type: "solid",
    },
  },
  {
    id: "decoration-wavy-underline",
    type: "LANDSCAPE_IMAGE",
    priority: 66,
    isActive: true,

    content: {
      badgeText: "Wavy",
      headline: "Wavy",
      highlight: "Underline",
      description:
        "Animated wavy underline that flows and pulses beneath the text.",
    },

    textStyle: {
      variant: "glass",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "wavyUnderline",
      highlightEffect: "pulse",
      badgeVariant: "pill",
    },

    ctaPrimary: {
      label: "See Wavy Underline",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=800&fit=crop&crop=center",
      alt: "Modern office with wavy underline text",
      position: "center",
    },

    overlay: {
      opacity: 0.5,
      type: "gradient",
    },
  },
  {
    id: "decoration-boxed",
    type: "LANDSCAPE_IMAGE",
    priority: 67,
    isActive: true,

    content: {
      badgeText: "Boxed",
      headline: "Boxed",
      highlight: "Text",
      description:
        "Text contained within a stylish red border box with subtle background blur.",
    },

    textStyle: {
      variant: "editorial",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "boxed",
      highlightEffect: "shimmer",
      badgeVariant: "outline",
    },

    ctaPrimary: {
      label: "See Boxed Text",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=800&fit=crop&crop=center",
      alt: "Circuit board with boxed text",
      position: "center",
    },

    overlay: {
      opacity: 0.3,
      type: "solid",
    },
  },
  {
    id: "decoration-shadow",
    type: "LANDSCAPE_IMAGE",
    priority: 68,
    isActive: true,

    content: {
      badgeText: "Shadow",
      headline: "Dramatic",
      highlight: "Shadow",
      description: "Multi-layered shadow effects creating depth and dimension.",
    },

    textStyle: {
      variant: "minimal",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "shadow",
      highlightEffect: "pulse",
      badgeVariant: "solid",
    },

    ctaPrimary: {
      label: "See Shadow Effect",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=800&fit=crop&crop=center",
      alt: "Modern workspace with shadow text",
      position: "center",
    },

    overlay: {
      opacity: 0.8,
      type: "solid",
    },
  },
  {
    id: "decoration-metallic",
    type: "LANDSCAPE_IMAGE",
    priority: 69,
    isActive: true,

    content: {
      badgeText: "Metallic",
      headline: "Metallic",
      highlight: "Finish",
      description: "Chrome-like metallic gradient with reflective red accents.",
    },

    textStyle: {
      variant: "glass",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "metallic",
      highlightEffect: "pulse",
      badgeVariant: "pill",
    },

    ctaPrimary: {
      label: "See Metallic Text",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=1200&h=800&fit=crop&crop=center",
      alt: "Clean workspace with metallic text",
      position: "center",
    },

    overlay: {
      opacity: 0.6,
      type: "gradient",
    },
  },
  {
    id: "decoration-glitch",
    type: "LANDSCAPE_IMAGE",
    priority: 70,
    isActive: true,

    content: {
      badgeText: "Glitch",
      headline: "Glitch",
      highlight: "Effect",
      description:
        "Cyberpunk glitch animation with red and pink color distortions.",
    },

    textStyle: {
      variant: "editorial",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "glitch",
      highlightEffect: "bounce",
      badgeVariant: "outline",
    },

    ctaPrimary: {
      label: "See Glitch Effect",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=800&fit=crop&crop=center",
      alt: "Modern office with glitch text",
      position: "center",
    },

    overlay: {
      opacity: 0.4,
      type: "solid",
    },
  },
  // Silver/metallic style showcase slides
  {
    id: "decoration-silver-glow",
    type: "LANDSCAPE_IMAGE",
    priority: 71,
    isActive: true,

    content: {
      badgeText: "Silver Glow",
      headline: "Silver",
      highlight: "Glow",
      description: "Elegant silver glow effect with soft metallic radiance.",
    },

    textStyle: {
      variant: "glass",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "silverGlow",
      highlightEffect: "shimmer",
      badgeVariant: "pill",
    },

    ctaPrimary: {
      label: "See Silver Glow",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=800&fit=crop&crop=center",
      alt: "Circuit board with silver glow text",
      position: "center",
    },

    overlay: {
      opacity: 0.8,
      type: "solid",
    },
  },
  {
    id: "decoration-chrome",
    type: "LANDSCAPE_IMAGE",
    priority: 72,
    isActive: true,

    content: {
      badgeText: "Chrome",
      headline: "Chrome",
      highlight: "Finish",
      description: "Polished chrome gradient with reflective metallic sheen.",
    },

    textStyle: {
      variant: "minimal",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "chrome",
      highlightEffect: "pulse",
      badgeVariant: "outline",
    },

    ctaPrimary: {
      label: "See Chrome Effect",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=800&fit=crop&crop=center",
      alt: "Modern workspace with chrome text",
      position: "center",
    },

    overlay: {
      opacity: 0.6,
      type: "gradient",
    },
  },
  {
    id: "decoration-platinum",
    type: "LANDSCAPE_IMAGE",
    priority: 73,
    isActive: true,

    content: {
      badgeText: "Platinum",
      headline: "Platinum",
      highlight: "Luxury",
      description:
        "Premium platinum gradient with sophisticated metallic depth.",
    },

    textStyle: {
      variant: "editorial",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "platinum",
      highlightEffect: "bounce",
      badgeVariant: "solid",
    },

    ctaPrimary: {
      label: "See Platinum Effect",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=1200&h=800&fit=crop&crop=center",
      alt: "Clean workspace with platinum text",
      position: "center",
    },

    overlay: {
      opacity: 0.5,
      type: "solid",
    },
  },
  {
    id: "landscape-hero-left-aligned",
    type: "LANDSCAPE_IMAGE",
    priority: 49, // High priority for demo
    isActive: true,

    content: {
      badgeText: "Left Aligned",
      headline: "Far Left",
      highlight: "Positioning",
      description:
        "This text is positioned at the far left of the container with outline decoration.",
    },

    textStyle: {
      variant: "editorial",
      placement: "left",
      maxWidth: "lg",
      headlineDecoration: "outlineFill",
      badgeVariant: "solid",
    },

    ctaPrimary: {
      label: "Explore",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=800&fit=crop&crop=center",
      alt: "Modern tech workspace",
      position: "center",
    },

    overlay: {
      opacity: 0.3,
      type: "solid",
    },
  },
  {
    id: "landscape-hero-right-aligned",
    type: "LANDSCAPE_IMAGE",
    priority: 48, // High priority for demo
    isActive: true,

    content: {
      badgeText: "Right Aligned",
      headline: "Far Right",
      highlight: "Positioning",
      description:
        "This text is positioned at the far right of the container with red accent effect.",
    },

    textStyle: {
      variant: "editorial",
      placement: "right",
      maxWidth: "lg",
      headlineDecoration: "redAccent",
      badgeVariant: "solid",
    },

    ctaPrimary: {
      label: "Discover",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=1200&h=800&fit=crop&crop=center",
      alt: "Clean modern workspace",
      position: "center",
    },

    overlay: {
      opacity: 0.3,
      type: "solid",
    },
  },
  {
    id: "landscape-hero-minimal",
    type: "LANDSCAPE_IMAGE",
    priority: 50, // Highest priority for demo
    isActive: true,

    content: {
      badgeText: "New Collection",
      headline: "Minimal",
      highlight: "Design",
      description:
        "Clean, focused, and essential. Experience the power of simplicity.",
    },

    textStyle: {
      variant: "minimal",
      placement: "center",
      maxWidth: "md",
      badgeVariant: "solid",
      headlineDecoration: "outline",
    },

    ctaPrimary: {
      label: "View Collection",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=800&fit=crop&crop=center",
      alt: "Minimalist tech workspace with clean design",
      position: "center",
    },

    overlay: {
      opacity: 0.3,
      type: "solid",
    },
  },
  {
    id: "landscape-hero-glass",
    type: "LANDSCAPE_IMAGE",
    priority: 45, // Second highest for demo
    isActive: true,

    content: {
      badgeText: "Premium Experience",
      subtitle: "Glass Effect",
      headline: "Crystal Clear",
      highlight: "Innovation",
      description:
        "Immerse yourself in our premium glass aesthetic with blurred backgrounds and elegant typography.",
    },

    textStyle: {
      variant: "glass",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "glow",
      badgeVariant: "outline",
    },

    ctaPrimary: {
      label: "Discover Premium",
      href: "/categories",
    },
    ctaSecondary: {
      label: "Learn More",
      href: "/about",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=800&fit=crop&crop=center",
      alt: "Modern tech architecture with clean design",
      position: "center",
    },

    overlay: {
      opacity: 0.4,
      type: "gradient",
    },
  },
  {
    id: "landscape-hero-neon",
    type: "LANDSCAPE_IMAGE",
    priority: 42, // Third highest for demo
    isActive: true,

    content: {
      badgeText: "Electric",
      subtitle: "Neon Style",
      headline: "Future",
      highlight: "Forward",
      description:
        "Bold, vibrant, and electrifying. Step into the neon-lit future of technology.",
    },

    textStyle: {
      variant: "editorial",
      placement: "center",
      maxWidth: "md",
      badgeVariant: "solid",
      headlineDecoration: "glow",
    },

    ctaPrimary: {
      label: "Go Electric",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=800&fit=crop&crop=center",
      alt: "Futuristic tech cityscape with neon elements",
      position: "center",
    },

    overlay: {
      opacity: 0.5,
      type: "solid",
    },
  },
  {
    id: "landscape-hero-1",
    type: "LANDSCAPE_IMAGE",
    priority: 40, // Higher priority = earlier in carousel (above PRODUCT_SPOTLIGHT at 30)
    isActive: true,
    // startsAt: undefined (always active)
    // No endsAt - no expiry

    // New structured content (takes precedence over legacy fields)
    content: {
      badgeText: "Landscape Hero",
      subtitle: "Full-frame landscape image experience",
      headline: "Welcome to the",
      highlight: "Landscape Era",
      description:
        "Experience cutting-edge innovation with our curated selection of premium electronics. From the latest smartphones to professional-grade accessories, discover products that blend performance, style, and reliability.",
    },

    // New text styling configuration
    textStyle: {
      variant: "editorial",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "gradient",
      badgeVariant: "pill",
    },

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

    // Overlay configuration (new structured approach)
    overlay: {
      opacity: 0.4,
      type: "solid",
    },

    // Theme is optional for landscape slides and not used in rendering
    // theme: { accentToken: "red-black" },
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

  // New refactored landscape slide with placement left + underlineGlow + maskReveal
  {
    id: "landscape-hero-new-features-demo",
    type: "LANDSCAPE_IMAGE",
    priority: 65, // Higher priority to show new features
    isActive: true,

    content: {
      badgeText: "New Features",
      subtitle: "Refactored Layout System",
      headline: "Modern Hero",
      highlight: "Experience",
      description:
        "Left placement with centered text, highlight underline glow, and mask reveal animation.",
    },

    textStyle: {
      variant: "glass",
      placement: "left", // Block sits on left, text centered within block
      textAlign: "center", // Explicit center alignment (default for left/right)
      maxWidth: "lg",
      headlineDecoration: "none",
      highlightEffect: "underlineGlow", // New highlight underline effect
      animation: {
        maskReveal: true, // Text mask reveal animation
        stagger: true, // Staggered element animations
      },
      badgeVariant: "solid",
    },

    overlay: {
      opacity: 0.3,
      type: "solid",
    },

    ctaPrimary: {
      label: "Discover More",
      href: "/products",
    },
    ctaSecondary: {
      label: "Learn About Us",
      href: "/about",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&crop=center",
      alt: "Modern workspace with laptop and coffee showing new hero features",
      position: "center",
    },

    theme: {
      accentToken: "red-black",
    },
  },
  // Red Neon Glow Effect Demo
  {
    id: "red-neon-glow-demo",
    type: "LANDSCAPE_IMAGE",
    priority: 64, // High priority for demo
    isActive: true,

    content: {
      badgeText: "NEON GLOW",
      subtitle: "Dramatic Red Effect",
      headline: "Red Neon",
      highlight: "Glow",
      description:
        "Dramatic red neon-style glow effects around white text for maximum impact.",
    },

    textStyle: {
      variant: "minimal",
      placement: "center",
      maxWidth: "lg",
      headlineDecoration: "redNeonGlow",
      badgeVariant: "outline",
    },

    ctaPrimary: {
      label: "Experience Neon",
      href: "/categories",
    },

    media: {
      kind: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=800&fit=crop&crop=center",
      alt: "Dark tech landscape perfect for neon glow effects",
      position: "center",
    },

    overlay: {
      opacity: 0.5,
      type: "solid",
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
