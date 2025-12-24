// ProductRevealSection: Swipe-to-reveal section with price drops and bundles
"use client";

import { useMemo } from "react";
import { Sparkles, Tag, Package } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SwipeRevealCard } from "./swipe-reveal-card";
import { SectionHeader } from "./shared/section-header";
import { BackgroundGradients } from "./shared/background-gradients";
import { getDiscountInfo } from "@/lib/utils";
import { ensureArray } from "@/lib/utils";
import type { Product, Category } from "@/features/products/types";

interface ProductRevealSectionProps {
  products: Product[];
  categories?: Category[];
}

interface RevealProduct {
  product: Product;
  revealType: "price" | "bundle";
  complementaryProducts?: Product[];
}

export function ProductRevealSection({ products }: ProductRevealSectionProps) {
  // Prepare reveal products: mix of price drops and bundles
  const revealProducts = useMemo<RevealProduct[]>(() => {
    const safeProducts = ensureArray(products);
    if (safeProducts.length === 0) return [];

    // Find products with significant discounts for price reveals (at least 10% off)
    const productsWithDiscounts = safeProducts.filter((p) => {
      const { hasDiscount, discountPercent, originalPrice } = getDiscountInfo(p);
      return hasDiscount && discountPercent >= 10 && originalPrice && originalPrice > p.price;
    });

    // Group products by category for bundle matching
    const productsByCategory = safeProducts.reduce((acc, product) => {
      const categoryId = product.categoryId || "uncategorized";
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    const reveals: RevealProduct[] = [];

    // Add exactly 2 price drop reveals
    productsWithDiscounts.slice(0, 2).forEach((product) => {
      reveals.push({
        product,
        revealType: "price",
      });
    });

    // Add exactly 2 bundle reveals
    // Find products that have other products in the same category
    const bundleCandidates = safeProducts.filter((product) => {
      const categoryId = product.categoryId;
      if (!categoryId) return false;
      const categoryProducts = productsByCategory[categoryId] || [];
      // Need at least 2 other products in the same category
      return categoryProducts.length >= 2;
    });

    bundleCandidates.slice(0, 2).forEach((product) => {
      const categoryId = product.categoryId;
      if (!categoryId) return;

      const categoryProducts = productsByCategory[categoryId] || [];
      // Get complementary products (same category, different product)
      const complementary = categoryProducts
        .filter((p) => p.id !== product.id)
        .slice(0, 4); // Max 4 complementary products

      if (complementary.length >= 2) {
        reveals.push({
          product,
          revealType: "bundle",
          complementaryProducts: complementary,
        });
      }
    });

    // Fallback: if not enough reveals found, create sale-like experiences
    if (reveals.length < 4) {
      const priceCount = reveals.filter((r) => r.revealType === "price").length;
      const bundleCount = reveals.filter(
        (r) => r.revealType === "bundle"
      ).length;

      // Fill missing price reveals with simulated discounts
      if (priceCount < 2) {
        const remainingProducts = safeProducts.filter(
          (p) => !reveals.some((r) => r.product.id === p.id)
        );
        remainingProducts.slice(0, 2 - priceCount).forEach((product) => {
          // Create a simulated discount for products without real discounts
          const simulatedProduct = {
            ...product,
            originalPrice: product.price * 1.25, // 25% higher "regular" price
            discount: {
              originalPrice: product.price * 1.25,
              discountPercent: 20,
              isOnSale: true
            }
          };
          reveals.push({
            product: simulatedProduct,
            revealType: "price",
          });
        });
      }

      // Fill missing bundle reveals
      if (bundleCount < 2) {
        const remainingProducts = safeProducts.filter(
          (p) => !reveals.some((r) => r.product.id === p.id)
        );
        remainingProducts.slice(0, 2 - bundleCount).forEach((product) => {
          const categoryId = product.categoryId || "uncategorized";
          const categoryProducts = productsByCategory[categoryId] || [];
          const complementary = categoryProducts
            .filter((p) => p.id !== product.id)
            .slice(0, 4);

          reveals.push({
            product,
            revealType: "bundle",
            complementaryProducts:
              complementary.length >= 2
                ? complementary
                : safeProducts.filter((p) => p.id !== product.id).slice(0, 4),
          });
        });
      }
    }

    // Return exactly 4 reveals: 2 price + 2 bundle
    const priceReveals = reveals
      .filter((r) => r.revealType === "price")
      .slice(0, 2);
    const bundleReveals = reveals
      .filter((r) => r.revealType === "bundle")
      .slice(0, 2);

    // Ensure one bundle shows 2 products, another shows 4
    if (bundleReveals.length >= 2) {
      // First bundle: limit to 1 complementary product (shows 2 total)
      if (bundleReveals[0].complementaryProducts) {
        bundleReveals[0].complementaryProducts =
          bundleReveals[0].complementaryProducts.slice(0, 1);
      }
      // Second bundle: keep 3 complementary products (shows 4 total)
      if (bundleReveals[1].complementaryProducts) {
        bundleReveals[1].complementaryProducts =
          bundleReveals[1].complementaryProducts.slice(0, 3);
      }
    } else if (bundleReveals.length === 1) {
      // If only one bundle, show 2 products
      if (bundleReveals[0].complementaryProducts) {
        bundleReveals[0].complementaryProducts =
          bundleReveals[0].complementaryProducts.slice(0, 1);
      }
    }

    return [...priceReveals, ...bundleReveals];
  }, [products]);

  if (revealProducts.length === 0) {
    return null;
  }

  return (
    <Section spacing="lg" className="relative overflow-hidden bg-transparent">
      <BackgroundGradients variant="decorative" />

      <Container className="relative z-10">
        <div className="space-y-8">
          {/* Header */}
          <SectionHeader
            badge={{
              icon: Sparkles,
              text: "Interactive Discovery",
              gradient: "from-primary-100 via-purple-100 to-primary-100",
            }}
            title={{ italic: "Swipe", bold: "to Reveal" }}
            description="Discover exclusive deals and frequently bought together items by dragging the handle"
          />

          {/* Reveal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {revealProducts.map((reveal) => (
              <SwipeRevealCard
                key={`${reveal.product.id}-${reveal.revealType}`}
                product={reveal.product}
                revealType={reveal.revealType}
                complementaryProducts={reveal.complementaryProducts}
              />
            ))}
          </div>

          {/* Helper Text */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary-500" />
              <span className="font-[var(--font-inter)]">
                Drag to reveal price drops
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-500" />
              <span className="font-[var(--font-inter)]">
                Drag to see frequently bought together
              </span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
