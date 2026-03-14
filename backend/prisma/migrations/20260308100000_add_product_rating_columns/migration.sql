-- Add rating columns to Product (used by ProductReview and seed)
ALTER TABLE "public"."Product" ADD COLUMN IF NOT EXISTS "averageRating" DECIMAL(3,2);
ALTER TABLE "public"."Product" ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "Product_averageRating_idx" ON "public"."Product"("averageRating");
