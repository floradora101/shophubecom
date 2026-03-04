-- Remove unnecessary fields from Product table
-- colors: Only used in mock data, not in actual backend services
-- image and images: Product-level images removed, images should come from variants/defaultVariant

ALTER TABLE "Product" DROP COLUMN IF EXISTS "colors";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "image";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "images";
