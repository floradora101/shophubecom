/*
  Warnings:

  - You are about to drop the `CategoryProduct` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `categoryId` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."CategoryProduct" DROP CONSTRAINT "CategoryProduct_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CategoryProduct" DROP CONSTRAINT "CategoryProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "categoryId" SET NOT NULL;

-- DropTable
DROP TABLE "public"."CategoryProduct";

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "public"."Category"("parentId");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
