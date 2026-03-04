export class CategoryResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  description!: string | null;
  image!: string | null;
  parentId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  // Product count - number of products in this category (included when available)
  productCount?: number;
  // Optional: parent category info (included when requested)
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  // Optional: children categories (included when requested)
  children?: CategoryResponseDto[];
}
