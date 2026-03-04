-- CreateEnum
CREATE TYPE "HeroSlideType" AS ENUM ('PRODUCT_SPOTLIGHT', 'OFFER', 'TESTIMONIAL', 'LANDSCAPE_IMAGE', 'CATEGORY_SPOTLIGHT', 'EDITORS_PICK', 'COMPARISON_BATTLE');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('PRODUCT', 'IMAGE', 'VIDEO', 'NONE');

-- CreateEnum
CREATE TYPE "LandscapeTheme" AS ENUM ('GLASS_RED', 'MINIMAL_WHITE', 'BOLD_DARK', 'CENTERED_GLASS', 'RIGHT_INDUSTRIAL', 'CLEAN_MODERN');

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "type" "HeroSlideType" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "badgeText" TEXT,
    "headline" TEXT NOT NULL,
    "highlight" TEXT,
    "description" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "ctaHref" TEXT NOT NULL,
    "mediaKind" "MediaKind" NOT NULL DEFAULT 'NONE',
    "productSlug" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "mediaAlt" TEXT,
    "mediaPosition" VARCHAR(20),
    "mediaAspect" VARCHAR(20),
    "typeSpecificData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroSlide_isActive_priority_idx" ON "HeroSlide"("isActive", "priority");

-- CreateIndex
CREATE INDEX "HeroSlide_type_idx" ON "HeroSlide"("type");

-- CreateIndex
CREATE INDEX "HeroSlide_priority_idx" ON "HeroSlide"("priority");

-- CreateIndex
CREATE INDEX "HeroSlide_startsAt_endsAt_idx" ON "HeroSlide"("startsAt", "endsAt");
