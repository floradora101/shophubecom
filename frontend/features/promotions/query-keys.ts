export const promotionKeys = {
  all: ["promotions"] as const,
  lists: () => [...promotionKeys.all, "list"] as const,
  list: (filters: any) => [...promotionKeys.lists(), { filters }] as const,
  details: () => [...promotionKeys.all, "detail"] as const,
  detail: (id: string) => [...promotionKeys.details(), id] as const,
};
