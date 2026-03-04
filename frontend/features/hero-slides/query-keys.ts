export const heroSlideKeys = {
  all: ["hero-slides"] as const,
  lists: () => [...heroSlideKeys.all, "list"] as const,
  list: (filters?: any) => [...heroSlideKeys.lists(), filters] as const,
  details: () => [...heroSlideKeys.all, "detail"] as const,
  detail: (id: string) => [...heroSlideKeys.details(), id] as const,
  active: () => [...heroSlideKeys.all, "active"] as const,
};
