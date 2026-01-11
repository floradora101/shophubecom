"use client";

import React from "react";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import { SlideBodyRenderer } from "@/components/home/hero/SlideBodyRenderer";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";

interface HeroSlidePreviewProps {
  slide: HeroSlide;
}

export function HeroSlidePreview({ slide }: HeroSlidePreviewProps) {
  return (
    <Card className="overflow-hidden border-2 border-primary/20 shadow-lg bg-surface">
      <div className="p-3 border-b border-primary/10 bg-surface-muted/50 flex justify-between items-center">
        <Text variant="small" className="font-semibold text-primary-600">
          Live Preview
        </Text>
        <Text variant="small" className="text-muted-fg">
          Mobile/Desktop View
        </Text>
      </div>
      <div className="relative aspect-[21/9] w-full bg-bg overflow-hidden group">
        <div className="absolute inset-0 origin-top-left transform scale-[1] transition-transform duration-500">
          <SlideBodyRenderer
            slide={slide}
            isActive={true}
            index={0}
          />
        </div>
      </div>
      <div className="p-3 bg-surface-muted/30">
        <Text variant="small" className="text-muted-fg text-center italic">
          * Preview is scaled to fit. High-quality responsive rendering will apply on home page.
        </Text>
      </div>
    </Card>
  );
}
