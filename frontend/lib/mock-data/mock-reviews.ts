// Mock Review Data for Product Reviews - 2026 Design Trends
// This data can be easily replaced with real API data later

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5 stars
  title: string;
  content: string;
  date: Date;
  verified: boolean;
  helpful: number;
  images?: string[];
  productVariant?: string; // e.g., "Color: Midnight Black, Storage: 256GB"
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedReviews: number;
  averageHelpful: number;
}

// Mock review data - designed to be realistic and diverse
export const mockReviews: Review[] = [
  {
    id: "rev-001",
    userId: "user-001",
    userName: "Sarah Chen",
    userAvatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    title: "Absolutely perfect for my workflow",
    content:
      "I've been using this for 3 months now and it's exceeded all my expectations. The build quality is premium, the performance is lightning fast, and the battery life lasts me through full workdays. The display is stunning - colors are vibrant and accurate. If you're looking for a professional-grade device that doesn't compromise on portability, this is it.",
    date: new Date("2024-12-20"),
    verified: true,
    helpful: 24,
    productVariant: "Color: Space Gray, Storage: 512GB",
  },
  {
    id: "rev-002",
    userId: "user-002",
    userName: "Marcus Rodriguez",
    userAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4,
    title: "Great device with minor software quirks",
    content:
      "Hardware is top-notch - keyboard feels premium, screen is gorgeous, and the overall design is sleek. Performance is excellent for both work and entertainment. The only reason I'm not giving 5 stars is that I've experienced some occasional software glitches that required restarts. Hoping for software updates to address this.",
    date: new Date("2024-12-15"),
    verified: true,
    helpful: 18,
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1587614295999-6c1bd4c1c5f8?w=400&h=300&fit=crop",
    ],
  },
  {
    id: "rev-003",
    userId: "user-003",
    userName: "Emily Watson",
    userAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    title: "Worth every penny - best purchase this year",
    content:
      "Coming from an older model, this upgrade was night and day. The speed improvements are incredible - apps launch instantly, multitasking is smooth even with heavy workloads. The camera quality is professional-grade, perfect for both photos and video calls. Battery life is exceptional - easily gets me through 12+ hours of mixed use.",
    date: new Date("2024-12-10"),
    verified: true,
    helpful: 31,
    productVariant: "Color: Silver, Storage: 1TB",
  },
  {
    id: "rev-004",
    userId: "user-004",
    userName: "David Kim",
    userAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 3,
    title: "Good but overpriced for the features",
    content:
      "Don't get me wrong - this is a solid device with excellent build quality and performance. The screen is beautiful and the battery life is impressive. However, at this price point, I expected more innovative features or better value. Similar specs can be found elsewhere for significantly less money.",
    date: new Date("2024-12-08"),
    verified: false,
    helpful: 12,
  },
  {
    id: "rev-005",
    userId: "user-005",
    userName: "Lisa Thompson",
    userAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    title: "Perfect for content creators",
    content:
      "As a freelance photographer and video editor, this device handles everything I throw at it. Adobe Creative Suite runs smoothly, rendering times are fast, and the color accuracy is spot-on. The portability means I can work from anywhere, and the battery lasts through long editing sessions. Highly recommend for creative professionals!",
    date: new Date("2024-12-05"),
    verified: true,
    helpful: 27,
    images: [
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop",
    ],
    productVariant: "Color: Space Gray, Storage: 1TB",
  },
  {
    id: "rev-006",
    userId: "user-006",
    userName: "James Wilson",
    userAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 4,
    title: "Excellent for students and light professionals",
    content:
      "Got this for my college courses and it's been fantastic. Handles multiple browser tabs, Zoom calls, and note-taking apps without breaking a sweat. The keyboard is comfortable for long typing sessions, and the webcam quality makes video lectures clear. Only wish it had more USB ports, but that's a minor complaint.",
    date: new Date("2024-12-01"),
    verified: true,
    helpful: 15,
  },
  {
    id: "rev-007",
    userId: "user-007",
    userName: "Anna Martinez",
    userAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    title: "Love the design and functionality",
    content:
      "The aesthetic is gorgeous - clean lines, premium materials, and that perfect balance of being powerful yet portable. Setup was seamless, and everything just works. The touchpad is incredibly responsive, and the speakers sound better than expected. This is the kind of device that makes you excited to use technology again.",
    date: new Date("2024-11-28"),
    verified: true,
    helpful: 19,
    productVariant: "Color: Gold, Storage: 512GB",
  },
  {
    id: "rev-008",
    userId: "user-008",
    userName: "Robert Davis",
    userAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    rating: 4,
    title: "Solid performance, great battery life",
    content:
      "After a week of use, I'm impressed with the battery life - easily gets 10+ hours with mixed usage. Performance is excellent for everyday tasks and some light gaming. The build feels premium and the screen is vibrant. No major complaints, though the fan can get a bit loud under heavy load.",
    date: new Date("2024-11-25"),
    verified: true,
    helpful: 8,
  },
];

// Calculate review statistics
export const calculateReviewStats = (reviews: Review[]): ReviewStats => {
  const totalReviews = reviews.length;
  const verifiedReviews = reviews.filter((r) => r.verified).length;

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  const averageHelpful =
    reviews.reduce((sum, review) => sum + review.helpful, 0) / totalReviews;

  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    totalReviews,
    ratingDistribution,
    verifiedReviews,
    averageHelpful: Math.round(averageHelpful),
  };
};

// Pre-calculated stats for mock data
export const mockReviewStats: ReviewStats = calculateReviewStats(mockReviews);

// Utility function to get reviews for a specific product (future backend integration)
export const getReviewsForProduct = (
  productId: string
): { reviews: Review[]; stats: ReviewStats } => {
  // For now, return all mock reviews. In future, filter by productId
  return {
    reviews: mockReviews,
    stats: mockReviewStats,
  };
};
