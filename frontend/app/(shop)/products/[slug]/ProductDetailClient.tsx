// Modern Product Detail Page - 2026 Editorial Style
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AlertTriangle, Settings, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { useCart } from "@/features/cart/hooks";
import { getProductImageWithPlaceholder } from "@/lib/utils/products";
import { ProductGallery } from "./components/ProductGallery";
import { ProductPurchasePanel } from "./components/ProductPurchasePanel";
import { ProductDetailsTabs } from "./components/ProductDetailsTabs";
import { StickyPurchaseBar } from "./components/StickyPurchaseBar";
import { ProductBreadcrumb } from "./components/ProductBreadcrumb";
import {
  ProductDetailSkeleton,
  ProductGallerySkeleton,
  ProductPurchasePanelSkeleton,
  ProductDetailsAccordionSkeleton,
  YouMayAlsoLikeSkeleton,
} from "./components/ProductDetailSkeletons";
import { useStickyBar } from "./hooks/useStickyBar";
import { useProductGallery } from "./hooks/useProductGallery";
import { useProductDetail } from "./hooks/useProductDetail";
import { useVariantSelection } from "./hooks/useVariantSelection";
import { useVariantLogic } from "./hooks/useVariantLogic";
import { useProductPricing } from "./hooks/useProductPricing";

// Dynamically import below-the-fold components to reduce initial bundle size
const YouMayAlsoLike = dynamic(
  () =>
    import("./components/YouMayAlsoLike").then((mod) => ({
      default: mod.YouMayAlsoLike,
    })),
  {
    loading: () => <YouMayAlsoLikeSkeleton />,
    ssr: false, // Client-only recommendation component
  }
);

interface ProductDetailClientProps {
  slug: string;
}

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem, toggleCart } = useCart();

  // Extract product and category loading to custom hook
  const { product, category } = useProductDetail({ slug });

  const [quantity, setQuantity] = useState(1);
  const [showSelectionError, setShowSelectionError] = useState(false);

  // Extract sticky bar logic to custom hook
  const { showStickyBar } = useStickyBar();

  // Extract variant selection logic to custom hook
  const {
    selectedOptions,
    selectedOptionsState,
    setSelectedOptionsState,
    updateUrlWithSelections,
  } = useVariantSelection({ slug });

  // Extract variant logic computation to custom hook
  const {
    selectedVariant,
    optionKeys,
    allOptionValues,
    isUserSelectionComplete,
    isInvalidSelection,
  } = useVariantLogic({
    product,
    selectedOptionsState,
  });

  // Extract pricing and stock calculations to custom hook
  const {
    effectivePrice,
    hasDiscount,
    discountPercent,
    originalPrice,
    isOutOfStock,
    isUnavailable,
    effectiveStock,
    canAddToCart,
  } = useProductPricing({
    product,
    selectedVariant,
    isInvalidSelection,
  });

  // Extract gallery images logic to custom hook
  const { galleryImages } = useProductGallery({
    product,
    selectedVariant,
  });

  // Handlers
  const handleOptionSelect = useCallback(
    (key: string, value: string) => {
      const next = { ...selectedOptionsState, [key]: value };
      setSelectedOptionsState(next);
      updateUrlWithSelections(next);
      // Clear error on selection - provides immediate feedback
      if (showSelectionError) {
        setShowSelectionError(false);
      }
    },
    [selectedOptionsState, updateUrlWithSelections, showSelectionError]
  );

  const handleQuantityChange = useCallback(
    (value: number) => {
      if (value < 1) return;
      if (effectiveStock > 0 && value > effectiveStock) return;
      setQuantity(value);
    },
    [effectiveStock]
  );

  const handleAddToCart = useCallback(async () => {
    // Check if selection is required but not complete
    if (optionKeys.length > 0 && !isUserSelectionComplete) {
      setShowSelectionError(true);
      // Scroll to purchase section with smooth animation
      const purchaseSection = document.getElementById("purchase-section");
      if (purchaseSection) {
        purchaseSection.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add a subtle highlight effect
        purchaseSection.classList.add(
          "ring-2",
          "ring-amber-300",
          "ring-opacity-50"
        );
        setTimeout(() => {
          purchaseSection.classList.remove(
            "ring-2",
            "ring-amber-300",
            "ring-opacity-50"
          );
        }, 2000);
      }
      // Provide specific feedback about what's missing
      const missingOptions = optionKeys.filter(
        (key) => !selectedOptionsState[key]
      );
      toast.error(`Please select: ${missingOptions.join(", ")}`);
      return;
    }

    if (!canAddToCart || !selectedVariant || !product) {
      toast.error("Unable to add item to cart. Please check your selection.");
      return;
    }

    try {
      await addItem(product, {
        quantity: Math.min(quantity, effectiveStock),
        priceOverride: effectivePrice,
        image: selectedVariant.image ?? getProductImageWithPlaceholder(product),
        variantId: selectedVariant.id,
        variantSku: selectedVariant.sku,
        color: selectedOptionsState.color ?? null,
        storage: selectedOptionsState.storage ?? null,
      });
      toast.success(`${product.name} added to cart!`, {
        description: `Quantity: ${Math.min(quantity, effectiveStock)}`,
      });
      toggleCart(true);
      // Clear any previous selection errors on successful add
      setShowSelectionError(false);
    } catch (error) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to add item to cart. Please try again."
      );
      toast.error(errorMessage);
      console.error("Add to cart error:", error);
    }
  }, [
    canAddToCart,
    selectedVariant,
    product,
    quantity,
    effectiveStock,
    effectivePrice,
    selectedOptionsState,
    addItem,
    toggleCart,
    optionKeys,
    isUserSelectionComplete,
    setShowSelectionError,
  ]);

  useEffect(() => {
    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      // If IntersectionObserver is not supported, show everything
      if (!("IntersectionObserver" in window)) {
        document.querySelectorAll(".animate-on-scroll").forEach((el) => {
          el.classList.remove("opacity-0");
        });
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate-fade-in-up");
              // Remove the initial hidden state
              entry.target.classList.remove("opacity-0");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.01, // Minimal threshold to trigger as soon as any part is visible
          rootMargin: "100px", // Trigger well before it enters viewport
        }
      );

      const animatedElements = document.querySelectorAll(".animate-on-scroll");
      animatedElements.forEach((el) => observer.observe(el));

      // Safety: If after 2 seconds nothing happened, force show
      setTimeout(() => {
        document.querySelectorAll(".animate-on-scroll").forEach((el) => {
          if (el.classList.contains("opacity-0")) {
            el.classList.remove("opacity-0");
            el.classList.add("animate-fade-in");
          }
        });
      }, 2000);

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [product]);

  // Product not found - clean error state
  if (!product) {
    return (
      <div className="min-h-screen relative flex items-center">
        <Container className="py-16 relative z-0">
          <div className="text-center max-w-md mx-auto">
            <AlertTriangle className="h-16 w-16 text-muted-fg mx-auto mb-6" />
            <h1 className="text-2xl font-semibold text-fg mb-3">
              Product Not Found
            </h1>
            <p className="text-muted-fg mb-8">
              The product you&apos;re looking for doesn&apos;t exist or may have
              been removed.
            </p>
            <Button onClick={() => router.push("/products")} variant="outline">
              Browse Products
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // Show skeleton while loading (we can add a loading state if needed)
  // For now, we render the full component since we have the product data

  return (
    <div className="min-h-screen relative">
      {/* Breadcrumb */}
      <ProductBreadcrumb product={product} category={category} />

      {/* Main Content */}
      <Container className="py-6 sm:py-8 lg:py-12 pb-24 lg:pb-0">
        {/* Product Title - Show first on small screens */}
        <div className="w-full mb-6 sm:mb-8 lg:hidden text-left">
          <Badge variant="primary" size="default" className="mb-3">
            MegaStore
          </Badge>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-fg leading-tight tracking-tight">
            {product.name}
          </h1>
        </div>

        {/* PDP Grid Section */}
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:gap-12 xl:gap-16 2xl:gap-20 min-w-0">
          {/* Left Column - Gallery Only */}
          <div id="product-gallery" className="order-2 lg:order-1 min-w-0">
            <div className="lg:sticky lg:top-(--sticky-top,96px) lg:self-start">
              <ProductGallery
                productId={product.id}
                images={galleryImages}
                productName={product.name}
                isOutOfStock={!!isOutOfStock}
                isUnavailable={!!isUnavailable}
              />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="order-3 lg:order-2 min-w-0">
            <div className="space-y-6 sm:space-y-8">
              {/* MegaStore Brand & Title - Inside scrollable container (hidden on lg+) */}
              <div className="w-full mb-6 sm:mb-8 lg:mb-10 text-left hidden lg:block">
                <Badge variant="primary" size="default" className="mb-3">
                  MegaStore
                </Badge>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-display font-bold text-fg leading-tight tracking-tight">
                  {product.name}
                </h1>
              </div>

              <div id="purchase-section">
                <ProductPurchasePanel
                  product={product}
                  category={category}
                  selectedVariant={selectedVariant}
                  effectivePrice={effectivePrice}
                  hasDiscount={!!hasDiscount}
                  discountPercent={discountPercent}
                  originalPrice={product.originalPrice}
                  isOutOfStock={!!isOutOfStock}
                  isUnavailable={!!isUnavailable}
                  effectiveStock={effectiveStock}
                  canAddToCart={!!canAddToCart}
                  quantity={quantity}
                  optionKeys={optionKeys}
                  allOptionValues={allOptionValues}
                  selectedOptions={selectedOptionsState}
                  isUserSelectionComplete={isUserSelectionComplete}
                  isInvalidSelection={isInvalidSelection}
                  showSelectionError={showSelectionError}
                  onOptionSelect={handleOptionSelect}
                  onQuantityChange={handleQuantityChange}
                  onAddToCart={handleAddToCart}
                />
              </div>

              {/* Technical Specifications - Only show on xl screens and up */}
              {product.specs && product.specs.length > 0 && (
                <div className="space-y-4 hidden xl:block">
                  <div className="border-t border-border/60 pt-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Settings className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-fg">
                          Specifications
                        </h3>
                      </div>
                    </div>

                    {/* Compact Specs Grid - Enhanced design with no background */}
                    <div className="overflow-hidden">
                      <div className="divide-y divide-border/40">
                        {product.specs.map((spec, index) => (
                          <div
                            key={index}
                            className="group py-3.5 transition-colors duration-200"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-sm font-medium text-muted-fg flex-1 min-w-0 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                {spec.label}
                              </span>
                              <span className="text-sm font-bold text-fg flex-1 min-w-0 text-right tracking-tight">
                                {spec.value}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-width sections below the grid */}
        <div className="mt-12 sm:mt-16 lg:mt-20 space-y-12 sm:space-y-16 lg:space-y-20">
          {/* Product Details Tabs */}
          <div className="space-y-8">
            <div className="w-full text-center mb-10 sm:mb-12">
              <Badge variant="primary" size="default" className="mb-4">
                <FileText className="h-3 w-3 shrink-0" />
                Product Details
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-warm-gray-900 tracking-tight">
                Design &{" "}
                <span className="italic font-normal text-primary-600">
                  Features
                </span>
              </h2>
            </div>
            <ProductDetailsTabs product={product} />
          </div>

          {/* You May Also Like Section */}
          <div>
            <YouMayAlsoLike currentProduct={product} />
          </div>
        </div>
      </Container>

      {/* Mobile Sticky Purchase Bar */}
      <StickyPurchaseBar
        show={showStickyBar}
        product={product}
        effectivePrice={effectivePrice}
        hasDiscount={!!hasDiscount}
        discountPercent={discountPercent}
        originalPrice={product.originalPrice}
        canAddToCart={!!canAddToCart}
        quantity={quantity}
        onQuantityChange={handleQuantityChange}
        onAddToCart={handleAddToCart}
        isOutOfStock={!!isOutOfStock}
        isUnavailable={!!isUnavailable}
        effectiveStock={effectiveStock}
      />
    </div>
  );
}
