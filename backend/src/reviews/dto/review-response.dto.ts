export class ReviewResponseDto {
  id!: string;
  productId!: string;
  userId!: string;
  userName!: string;
  rating!: number;
  title!: string | null;
  content!: string;
  verified!: boolean;
  helpful!: number;
  createdAt!: Date;
}
