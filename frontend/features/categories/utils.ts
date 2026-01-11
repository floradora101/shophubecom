import type { Category } from "@/features/products/types";

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

/**
 * Builds a hierarchical tree structure from a flat list of categories
 */
export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];

  // First pass: create map of all categories with empty children arrays
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Second pass: build hierarchy
  categories.forEach(cat => {
    const categoryWithChildren = categoryMap.get(cat.id)!;

    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(categoryWithChildren);
      }
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });

  // Sort children by sortOrder
  const sortChildren = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };

  sortChildren(rootCategories);
  return rootCategories;
}

/**
 * Gets all descendant category IDs for a given category
 * Used for cycle prevention when setting parent categories
 */
export function getDescendantIds(categories: Category[], categoryId: string): string[] {
  const descendants: string[] = [];
  const stack = [categoryId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    const children = categories.filter(cat => cat.parentId === currentId);

    children.forEach(child => {
      descendants.push(child.id);
      stack.push(child.id);
    });
  }

  return descendants;
}

/**
 * Flattens a category tree into a flat array with depth information
 */
export function flattenCategoryTree(
  nodes: CategoryTreeNode[],
  depth = 0
): Array<CategoryTreeNode & { depth: number }> {
  const result: Array<CategoryTreeNode & { depth: number }> = [];

  nodes.forEach(node => {
    result.push({ ...node, depth });
    if (node.children && node.children.length > 0) {
      result.push(...flattenCategoryTree(node.children, depth + 1));
    }
  });

  return result;
}

/**
 * Gets the full path for a category (e.g., "Electronics › Laptops › Gaming")
 */
export function getCategoryPath(
  categories: Category[],
  categoryId: string,
  separator = " › "
): string {
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return "";

  const path: string[] = [category.name];
  let currentParentId = category.parentId;

  while (currentParentId) {
    const parent = categories.find(cat => cat.id === currentParentId);
    if (parent) {
      path.unshift(parent.name);
      currentParentId = parent.parentId;
    } else {
      break;
    }
  }

  return path.join(separator);
}

/**
 * Checks if setting a parent would create a cycle
 */
export function wouldCreateCycle(
  categories: Category[],
  categoryId: string,
  parentId: string | null
): boolean {
  if (!parentId) return false; // Root category is always valid

  // Cannot be parent of itself
  if (parentId === categoryId) return true;

  // Cannot be parent of any descendant
  const descendants = getDescendantIds(categories, categoryId);
  return descendants.includes(parentId);
}