export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

/**
 * Department Spotlight configuration (Admin "Subcategories" section).
 * Backed by backend `Department` model.
 */
export interface Department {
  id: string;
  name: string;
  isActive: boolean;
  parentCategory: CategoryRef;
  highlightedSubcategories: CategoryRef[];
  createdAt: string;
  updatedAt: string;
}

