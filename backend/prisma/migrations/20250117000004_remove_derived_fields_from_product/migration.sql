-- Remove derived fields from Product table
-- These fields (price, minPrice, maxPrice, effectiveStock) are now calculated on-the-fly from variants

ALTER TABLE "Product" DROP COLUMN IF EXISTS "price";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "minPrice";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "maxPrice";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "effectiveStock";

-- Drop indexes for removed fields
DROP INDEX IF EXISTS "Product_effectiveStock_idx";
DROP INDEX IF EXISTS "Product_minPrice_idx";
DROP INDEX IF EXISTS "Product_maxPrice_idx";
