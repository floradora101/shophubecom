export const departmentKeys = {
  all: ["departments"] as const,
  list: (params?: unknown) => [...departmentKeys.all, "list", params] as const,
  detail: (id: string) => [...departmentKeys.all, "detail", id] as const,
};

