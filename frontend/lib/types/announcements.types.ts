export type AnnouncementIconType = "Truck" | "Sparkles" | "Zap" | "Info" | "Bell" | "Tag" | "Gift";

export interface Announcement {
  id: string;
  text: string;
  highlight: string;
  icon: AnnouncementIconType;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementInput {
  text: string;
  highlight: string;
  icon: AnnouncementIconType;
  isActive: boolean;
  priority: number;
}
