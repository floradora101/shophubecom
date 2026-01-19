import * as yup from "yup";
import { Category } from "@/features/products/types";
import { categorySchema, CategoryFormData } from "./schemas";
import {
  mockCategories,
  mockCategoryToCategory,
} from "@/lib/mock-data/mock-data";
import { logError } from "@/lib/errors";

// Use mock data from frontend with local storage persistence
class CategoryRepository {
  private categories: Category[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
    }

    // If no data in storage, initialize with mock data
    if (this.categories.length === 0) {
      this.categories = mockCategories.map(mockCategoryToCategory);
      this.saveToStorage();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("admin_categories");
      if (stored) {
        this.categories = JSON.parse(stored);
      }
    } catch (error: unknown) {
      logError(error, {
        component: "CategoryRepository",
        action: "load_from_storage",
      });
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "admin_categories",
          JSON.stringify(this.categories)
        );
      } catch (error: unknown) {
        logError(error, {
          component: "CategoryRepository",
          action: "save_to_storage",
          metadata: {
            categoryCount: this.categories.length,
          },
        });
      }
    }
  }

  // Build category tree for hierarchy validation
  private buildCategoryTree(): Category[] {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // First pass: create map of all categories
    this.categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build hierarchy
    this.categories.forEach((cat) => {
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

    return rootCategories;
  }

  // Get all descendant IDs for a category (used for cycle prevention)
  private getDescendantIds(categoryId: string): string[] {
    const descendants: string[] = [];
    const stack = [categoryId];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const children = this.categories.filter(
        (cat) => cat.parentId === currentId
      );

      children.forEach((child) => {
        descendants.push(child.id);
        stack.push(child.id);
      });
    }

    return descendants;
  }

  // Validate slug uniqueness
  private async validateSlugUniqueness(
    slug: string,
    excludeId?: string
  ): Promise<boolean> {
    const existingCategory = this.categories.find(
      (cat) => cat.slug === slug && cat.id !== excludeId
    );
    return !existingCategory;
  }

  // Validate parent cycle prevention
  private validateParentCycle(
    categoryId: string,
    parentId: string | null
  ): boolean {
    if (!parentId) return true; // Root category is always valid

    // Cannot be parent of itself
    if (parentId === categoryId) return false;

    // Cannot be parent of any descendant
    const descendants = this.getDescendantIds(categoryId);
    return !descendants.includes(parentId);
  }

  async listCategories(): Promise<Category[]> {
    return [...this.categories];
  }

  async getCategory(id: string): Promise<Category | null> {
    return this.categories.find((cat) => cat.id === id) || null;
  }

  async createCategory(
    data: Omit<Category, "id" | "createdAt" | "updatedAt">
  ): Promise<Category> {
    // Validate with Yup schema
    await categorySchema.validate(data, { abortEarly: false });

    // Check slug uniqueness
    const isSlugUnique = await this.validateSlugUniqueness(data.slug);
    if (!isSlugUnique) {
      const error = new yup.ValidationError(
        "Slug must be unique",
        data.slug,
        "slug"
      );
      throw error;
    }

    // Check parent cycle prevention
    if (data.parentId && !this.validateParentCycle("", data.parentId)) {
      const error = new yup.ValidationError(
        "Invalid parent category",
        data.parentId,
        "parentId"
      );
      throw error;
    }

    const now = new Date().toISOString();
    const newCategory: Category = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    this.categories.push(newCategory);
    this.saveToStorage();

    return newCategory;
  }

  async updateCategory(
    id: string,
    data: Partial<Omit<Category, "id" | "createdAt">>
  ): Promise<Category | null> {
    const index = this.categories.findIndex((cat) => cat.id === id);
    if (index === -1) return null;

    const existingCategory = this.categories[index];
    const updatedData = { ...existingCategory, ...data };

    // Validate with Yup schema
    await categorySchema.validate(updatedData, { abortEarly: false });

    // Check slug uniqueness (exclude current category)
    if (data.slug !== undefined) {
      const isSlugUnique = await this.validateSlugUniqueness(data.slug, id);
      if (!isSlugUnique) {
        const error = new yup.ValidationError(
          "Slug must be unique",
          data.slug,
          "slug"
        );
        throw error;
      }
    }

    // Check parent cycle prevention
    const parentId =
      data.parentId !== undefined ? data.parentId : existingCategory.parentId;
    if (parentId && !this.validateParentCycle(id, parentId)) {
      const error = new yup.ValidationError(
        "Invalid parent category",
        parentId,
        "parentId"
      );
      throw error;
    }

    const updatedCategory: Category = {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    this.categories[index] = updatedCategory;
    this.saveToStorage();

    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const initialLength = this.categories.length;
    this.categories = this.categories.filter((cat) => cat.id !== id);

    if (this.categories.length < initialLength) {
      this.saveToStorage();
      return true;
    }

    return false;
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
