-- Add usedCount to Coupon (track total usage)
ALTER TABLE "public"."Coupon" ADD COLUMN IF NOT EXISTS "usedCount" INTEGER NOT NULL DEFAULT 0;
