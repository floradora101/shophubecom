"use client";

import React from "react";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import { SlideBodyRenderer } from "@/app/_components/hero/SlideBodyRenderer";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { useProductQuery, useProductsQuery } from "@/features/products/queries";
import { useCategoriesQuery } from "@/features/categories/queries";
import type { Category, Product } from "@/features/products/types";

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

  // Resolve products for comparison battle
  const leftProductSlug =
    slide.type === "COMPARISON_BATTLE" ? slide.leftProductSlug : undefined;
  const rightProductSlug =
    slide.type === "COMPARISON_BATTLE" ? slide.rightProductSlug : undefined;

  const { data: leftProduct } = useProductQuery(leftProductSlug || "");
  const { data: rightProduct } = useProductQuery(rightProductSlug || "");

  // Fetch categories and products for preview (reduced limits for performance)
  const { data: categoriesResponse } = useCategoriesQuery({ limit: 100 });
  const categories = React.useMemo(() => {
    return categoriesResponse?.data || [];
  }, [categoriesResponse?.data]);

  const { data: productsResponse } = useProductsQuery({ limit: 100, page: 1 });
  const allProducts = React.useMemo(() => {
    return productsResponse?.data || [];
  }, [productsResponse?.data]);

  // Create productsBySlug mapping for EDITORS_PICK and other slides
  const productsBySlug = React.useMemo(() => {
    const mapping: Record<string, Product> = {};
    allProducts.forEach((product) => {
      mapping[product.slug] = product;
    });
    return mapping;
  }, [allProducts]);

  // Create productsByCategory mapping for preview
  const productsByCategory = React.useMemo(() => {
    if (slide.type !== "CATEGORY_SPOTLIGHT") return {};

    const mapping: Record<string, Product[]> = {};

    // Use DB data - map products by category slug
    allProducts.forEach((product) => {
      const category = categories.find((c) => c.id === product.categoryId);
      const categorySlug = category?.slug || "uncategorized";
      if (!mapping[categorySlug]) {
        mapping[categorySlug] = [];
      }
      mapping[categorySlug].push(product);
    });

    return mapping;
  }, [slide.type, allProducts, categories]);

  // Find the selected category for preview
  const categorySlug =
    slide.type === "CATEGORY_SPOTLIGHT"
      ? (slide as { categorySlug?: string }).categorySlug
      : undefined;
  const category = React.useMemo(() => {
    if (slide.type !== "CATEGORY_SPOTLIGHT" || !categorySlug) return undefined;
    return categories.find((cat) => cat.slug === categorySlug);
  }, [slide.type, categorySlug, categories]);


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
      <div className="relative aspect-21/9 w-full bg-bg overflow-hidden group border-b border-primary/5">
        <div className="absolute top-0 left-0 w-[300%] h-[300%] origin-top-left scale-[0.333333] pointer-events-none">
          <SlideBodyRenderer
            slide={slide}
            product={product ?? undefined}
            leftProduct={leftProduct ?? undefined}
            rightProduct={rightProduct ?? undefined}
            category={category}
            categories={categories}
            productsByCategory={productsByCategory}
            productsBySlug={productsBySlug}
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
