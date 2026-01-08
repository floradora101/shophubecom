export class CategoryResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  description!: string | null;
  parentId!: string | null;
  productCount?: number;
  createdAt!: Date;
  updatedAt!: Date;
}
