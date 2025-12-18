-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "accessTokenHash" VARCHAR(64),
ADD COLUMN     "guestEmail" VARCHAR(320),
ADD COLUMN     "guestPhone" VARCHAR(32);

-- CreateIndex
CREATE INDEX "Order_guestEmail_idx" ON "public"."Order"("guestEmail");
