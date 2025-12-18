/*
  Warnings:

  - You are about to drop the column `label` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `street2` on the `Address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Address" DROP COLUMN "label",
DROP COLUMN "street2";
