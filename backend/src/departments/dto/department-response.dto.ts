export interface CategoryRefDto {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export class DepartmentResponseDto {
  id!: string;
  name!: string;
  isActive!: boolean;
  parentCategory!: CategoryRefDto;
  highlightedSubcategories!: CategoryRefDto[];
  createdAt!: Date;
  updatedAt!: Date;
}

