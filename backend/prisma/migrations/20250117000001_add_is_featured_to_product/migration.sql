-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_isFeatured_idx" ON "Product"("isFeatured");
