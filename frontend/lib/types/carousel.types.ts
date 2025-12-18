export interface CarouselType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  backgroundColor?: string; // For hero carousel background color
  textColor?: string; // For hero carousel text color
}

export interface CarouselSlide {
  id: string;
  carouselTypeId: string;
  title: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  productId?: string;
  productSlug?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  // For Offers/Promotional carousel
  badgeText?: string; // e.g., "Xmas Gifts", "Summer Sale"
  mainTitle?: string; // e.g., "Christmas Offer!"
  leftBackgroundColor?: string; // Left side background color
  rightBackgroundColor?: string; // Right side background color
  decorativeIcon?: string; // Emoji or icon (e.g., "🎅", "🎄")
  bundledItems?: string[]; // List of bundled/free items
  brandName?: string; // Override brand name extraction
}

export interface Carousel {
  id: string;
  type: CarouselType;
  slides: CarouselSlide[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomBanner {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  position: "top" | "middle" | "bottom" | "sidebar";
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
