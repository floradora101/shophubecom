import { Announcement } from "@/lib/types/announcements.types";

export const mockAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    text: "Free delivery in Lebanon on all orders over $50",
    highlight: "Free Delivery",
    icon: "Truck",
    isActive: true,
    priority: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ann-2",
    text: "Join our tech community for exclusive weekly deals",
    highlight: "Exclusive Deals",
    icon: "Sparkles",
    isActive: true,
    priority: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ann-3",
    text: "Premium technical support available 24/7 for you",
    highlight: "24/7 Support",
    icon: "Zap",
    isActive: true,
    priority: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ann-4",
    text: "New Year Sale: Up to 40% off on latest gadgets",
    highlight: "40% Off",
    icon: "Info",
    isActive: true,
    priority: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
