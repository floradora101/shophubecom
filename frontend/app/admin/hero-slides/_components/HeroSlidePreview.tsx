"use client";

import React from "react";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import { SlideBodyRenderer } from "@/components/home/hero/SlideBodyRenderer";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { useProductQuery } from "@/features/products/queries";

interface HeroSlidePreviewProps {
  slide: HeroSlide;
}

export function HeroSlidePreview({ slide }: HeroSlidePreviewProps) {
  // Try to resolve product for preview if it's a product-focused slide
  const productSlug =
    slide.type === "PRODUCT_SPOTLIGHT"
      ? slide.media.productSlug
      : slide.type === "OFFER"
      ? slide.media.productSlug
      : slide.type === "TESTIMONIAL"
      ? slide.media.productSlug
      : undefined;

  const { data: product } = useProductQuery(productSlug || "");

  return (
    <Card className="overflow-hidden border-2 border-primary/20 shadow-lg bg-surface">
      <div className="p-3 border-b border-primary/10 bg-surface-muted/50 flex justify-between items-center">
        <Text variant="caption" className="font-semibold text-primary-600">
          Live Preview
        </Text>
        <Text variant="caption" className="text-muted-fg">
          Mobile/Desktop View
        </Text>
      </div>
      <div className="relative aspect-[21/9] w-full bg-bg overflow-hidden group border-b border-primary/5">
        <div className="absolute top-0 left-0 w-[300%] h-[300%] origin-top-left scale-[0.333333] pointer-events-none">
          <SlideBodyRenderer
            slide={slide}
            product={product}
            isActive={true}
            index={0}
          />
        </div>
      </div>
      <div className="p-3 bg-surface-muted/30 flex justify-between items-center">
        <Text variant="caption" className="text-muted-fg italic">
          * Desktop view scaled (1:3)
        </Text>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-primary/20" />
          <div className="w-2 h-2 rounded-full bg-primary/20" />
        </div>
      </div>
    </Card>
  );
}
