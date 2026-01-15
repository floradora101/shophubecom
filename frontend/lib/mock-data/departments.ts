export interface MockDepartment {
  id: string;
  name: string;
  parentCategoryId: string;
  highlightedSubCategoryIds: string[];
  isActive: boolean;
  createdAt: string;
}

export const mockDepartments: MockDepartment[] = [
  {
    id: "dept-1",
    name: "Laptops Series",
    parentCategoryId: "laptops",
    highlightedSubCategoryIds: ["macbook", "gaming-laptops", "business-laptops"],
    isActive: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "dept-2",
    name: "Mobile Hub",
    parentCategoryId: "phones",
    highlightedSubCategoryIds: ["iphone", "samsung-phones"],
    isActive: true,
    createdAt: "2025-01-05T00:00:00.000Z",
  },
];

export function getAllDepartments(): MockDepartment[] {
  return mockDepartments;
}
