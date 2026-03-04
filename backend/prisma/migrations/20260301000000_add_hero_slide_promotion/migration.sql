-- AlterEnum
ALTER TYPE "HeroSlideType" ADD VALUE 'PROMOTION';

-- AlterTable
ALTER TABLE "HeroSlide" ADD COLUMN "promotionId" TEXT;

-- CreateIndex
CREATE INDEX "HeroSlide_promotionId_idx" ON "HeroSlide"("promotionId");

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
