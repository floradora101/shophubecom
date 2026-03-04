export const announcementKeys = {
  all: ["announcements"] as const,
  lists: () => [...announcementKeys.all, "list"] as const,
  list: (filters?: any) => [...announcementKeys.lists(), filters] as const,
  details: () => [...announcementKeys.all, "detail"] as const,
  detail: (id: string) => [...announcementKeys.details(), id] as const,
  active: () => [...announcementKeys.all, "active"] as const,
};
