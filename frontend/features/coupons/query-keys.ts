export const couponKeys = {
  all: ["coupons"] as const,
  lists: () => [...couponKeys.all, "list"] as const,
  list: (filters?: { search?: string; isActive?: boolean; page?: number; limit?: number }) =>
    [...couponKeys.lists(), filters] as const,
  details: () => [...couponKeys.all, "detail"] as const,
  detail: (id: string) => [...couponKeys.details(), id] as const,
};
