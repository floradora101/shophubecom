// Modern Product Detail Page - 2026 Editorial Style
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, AlertTriangle, Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SkeletonBlock } from "@/components/ui/skeleton";
import {
  mockProducts,
  mockProductToProduct,
  mockCategories,
  mockCategoryToCategory,
} from "@/lib/mock-data/mock-data";
import { getEffectiveStock } from "@/features/products/utils/inventory";
import { useCart } from "@/features/cart/hooks";
import {
  getProductImageWithPlaceholder,
  PLACEHOLDER_IMAGE,
  getDiscountInfo,
} from "@/lib/utils/products";
import { getAllProductImages } from "@/features/products/utils/product-images";
import { ProductGallery } from "./components/ProductGallery";
import { ProductPurchasePanel } from "./components/ProductPurchasePanel";
import { TrustModule } from "@/components/TrustModule";
import { ProductDetailsTabs } from "./components/ProductDetailsTabs";
import { YouMayAlsoLike } from "./components/YouMayAlsoLike";
import { StickyPurchaseBar } from "./components/StickyPurchaseBar";

interface ProductDetailClientProps {
  slug: string;
}

/**
 * Product Gallery Skeleton - matches ProductGallery layout
 */
function ProductGallerySkeleton() {
  return (
    <div className="w-full">
      {/* Main image area */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border shadow-lg bg-surface">
        <SkeletonBlock className="absolute inset-0 rounded-none" />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border"
          >
            <SkeletonBlock className="w-full h-full rounded-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Product Purchase Panel Skeleton - matches ProductPurchasePanel layout
 */
function ProductPurchasePanelSkeleton() {
  return (
    <div className="space-y-6">
      {/* Price section */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <SkeletonBlock className="h-8 w-24" />
          <SkeletonBlock className="h-6 w-16" />
        </div>
        <SkeletonBlock className="h-4 w-32" />
      </div>

      {/* Variant selectors */}
      <div className="space-y-4">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="space-y-3">
            <SkeletonBlock className="h-4 w-20" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }, (_, j) => (
                <SkeletonBlock key={j} className="h-10 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quantity and add to cart */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-10 w-32" />
          <SkeletonBlock className="h-12 flex-1 rounded-lg" />
        </div>
      </div>

      {/* Stock info */}
      <SkeletonBlock className="h-4 w-40" />
    </div>
  );
}

/**
 * Product Details Accordion Skeleton - matches ProductDetailsAccordion layout
 */
function ProductDetailsAccordionSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="border border-border rounded-lg overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 bg-surface-muted">
            <SkeletonBlock className="h-5 w-48" />
            <SkeletonBlock className="w-5 h-5 rounded" />
          </div>
          <div className="p-4 space-y-3">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
            <SkeletonBlock className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * You May Also Like Skeleton - matches YouMayAlsoLike layout
 */
function YouMayAlsoLikeSkeleton() {
  return (
    <div className="space-y-8 mt-12 sm:mt-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-6 h-6 rounded" />
        <SkeletonBlock className="h-8 w-64" />
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="w-full">
            <div className="group flex flex-col w-full">
              {/* Image */}
              <SkeletonBlock className="relative aspect-square rounded-lg overflow-hidden border border-warm-gray-200" />

              {/* Info */}
              <div className="mt-3 space-y-1 min-h-16 flex flex-col justify-end">
                <SkeletonBlock className="h-4 md:h-5" />
                <SkeletonBlock className="h-4 md:h-5 w-3/4" />
                <SkeletonBlock className="h-3 w-1/2 mt-1" />
                <div className="flex items-baseline gap-2 flex-wrap mt-2">
                  <SkeletonBlock className="h-4 md:h-5 w-16" />
                  <SkeletonBlock className="h-3 w-12" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Product Detail Page Skeleton - full page loading state
 */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen relative">
      {/* Breadcrumb */}
      <div className="border-b border-border/60">
        <Container className="py-3 sm:py-4">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <SkeletonBlock className="h-4 w-12" />
            <div className="w-3.5 h-3.5 rounded" />
            <SkeletonBlock className="h-4 w-20" />
            <div className="w-3.5 h-3.5 rounded" />
            <SkeletonBlock className="h-4 w-16" />
            <div className="w-3.5 h-3.5 rounded" />
            <SkeletonBlock className="h-4 w-32" />
          </nav>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-6 sm:py-8 lg:py-12 pb-24 lg:pb-0">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:gap-12 xl:gap-16 2xl:gap-20 min-w-0">
          {/* Left Column - Gallery Only */}
          <div className="order-1 lg:order-1 min-w-0 lg:min-h-[calc(100vh-var(--sticky-top)-16px)]">
            <ProductGallerySkeleton />
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="order-2 lg:order-2 min-w-0 lg:sticky lg:top-(--sticky-top) self-start">
            <div className="space-y-6 sm:space-y-8 lg:h-[calc(100vh-var(--sticky-top)-16px)] lg:overflow-y-auto scrollbar-hide">
              {/* ShopHub Brand & Title - Inside scrollable container */}
              <div className="w-full mb-6 sm:mb-8 lg:mb-10 text-left">
                <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-medium mb-2">
                  <SkeletonBlock className="h-4 w-16" />
                </div>
                <SkeletonBlock className="h-10 w-full" />
              </div>

              <div id="purchase-section">
                <ProductPurchasePanelSkeleton />
              </div>

              {/* Quality Strip */}
              <div className="flex items-center justify-center gap-6 py-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <SkeletonBlock className="w-5 h-5 rounded" />
                    <SkeletonBlock className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width sections below the grid */}
        <div className="mt-12 sm:mt-16 lg:mt-20 space-y-12 sm:space-y-16 lg:space-y-20">
          {/* Product Details Accordion */}
          <ProductDetailsAccordionSkeleton />

          {/* You May Also Like Section */}
          <YouMayAlsoLikeSkeleton />
        </div>
      </Container>
    </div>
  );
}

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, toggleCart } = useCart();

  // Find product from mock data
  const product = useMemo(() => {
    const mockProduct = mockProducts.find((p) => p.slug === slug);
    if (!mockProduct) return null;

    const converted = mockProductToProduct(mockProduct);

    // Ensure defaultVariant exists for products without variants
    if (!converted.variants?.length) {
      converted.defaultVariant = {
        id: `${converted.id}-default`,
        image: PLACEHOLDER_IMAGE,
        images: [PLACEHOLDER_IMAGE],
      };
    }

    return converted;
  }, [slug]);

  // Parse URL variant selections
  const selectedOptions = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    const options: Record<string, string> = {};
    ["color", "size", "storage", "style"].forEach((key) => {
      const value = params.get(key);
      if (value) options[key] = value;
    });
    return options;
  }, [searchParams]);

  const [selectedOptionsState, setSelectedOptionsState] =
    useState(selectedOptions);
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showSelectionError, setShowSelectionError] = useState(false);

  // Update URL when selections change
  const updateUrlWithSelections = useCallback(
    (newSelections: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newSelections).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.replace(`/products/${slug}${newUrl}`, { scroll: false });
    },
    [router, searchParams, slug]
  );

  // Sync URL params to state
  useEffect(() => {
    setSelectedOptionsState(selectedOptions);
  }, [selectedOptions]);

  // Intersection observer for sticky bar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );

    const productGallery = document.getElementById("product-gallery");
    if (productGallery) observer.observe(productGallery);

    return () => observer.disconnect();
  }, []);

  // Get category for breadcrumbs
  const category = useMemo(() => {
    if (!product?.categoryId) return null;
    const mockCategory = mockCategories.find(
      (c) => c.slug === product.categoryId
    );
    return mockCategory ? mockCategoryToCategory(mockCategory) : null;
  }, [product]);

  // Compute variant logic
  const {
    selectedVariant,
    optionKeys,
    allOptionValues,
    isUserSelectionComplete,
    isInvalidSelection,
  } = useMemo(() => {
    if (!product)
      return {
        selectedVariant: null,
        optionKeys: [],
        allOptionValues: {},
        isUserSelectionComplete: false,
        isInvalidSelection: false,
      };

    const variants = product.variants || [];
    const keys = new Set<string>();

    variants.forEach((variant) => {
      Object.keys(variant.options || {}).forEach((key) => keys.add(key));
    });

    const prioritized = ["color", "storage", "size"];
    const rest = Array.from(keys)
      .filter((key) => !prioritized.includes(key))
      .sort();
    const optionKeys = [...prioritized.filter((key) => keys.has(key)), ...rest];

    // Calculate option values with stock
    const optionMap = new Map<string, Map<string, number>>();
    variants.forEach((variant) => {
      const stock = variant.stock ?? 0;
      Object.entries(variant.options || {}).forEach(([key, value]) => {
        if (!optionMap.has(key)) optionMap.set(key, new Map());
        const valueMap = optionMap.get(key)!;
        valueMap.set(value, (valueMap.get(value) ?? 0) + stock);
      });
    });

    const allOptionValues: Record<
      string,
      { value: string; totalStock: number }[]
    > = {};
    optionKeys.forEach((key) => {
      const valueMap = optionMap.get(key) ?? new Map();
      allOptionValues[key] = Array.from(valueMap.entries()).map(
        ([value, totalStock]) => ({
          value,
          totalStock,
        })
      );
    });

    // Find selected variant
    const selectionEntries = Object.entries(selectedOptionsState).filter(
      ([, v]) => Boolean(v)
    );
    const candidateVariants = variants.filter((variant) =>
      selectionEntries.every(([key, value]) => variant.options?.[key] === value)
    );

    const isUserSelectionComplete =
      optionKeys.length > 0 &&
      optionKeys.every((k) => Boolean(selectedOptionsState[k]));
    const isInvalidSelection =
      isUserSelectionComplete && candidateVariants.length === 0;

    let selectedVariant = null;
    if (variants.length > 0) {
      if (isInvalidSelection) {
        selectedVariant = null;
      } else {
        const inStockCandidate = candidateVariants.find(
          (v) => (v.stock ?? 0) > 0
        );
        if (inStockCandidate) selectedVariant = inStockCandidate;
        else if (candidateVariants[0]) selectedVariant = candidateVariants[0];
        else
          selectedVariant =
            variants.find((v) => (v.stock ?? 0) > 0) ?? variants[0] ?? null;
      }
    } else {
      // No variants - create a default variant for products without explicit variants
      selectedVariant = {
        id: `${product?.id}-default`,
        sku: `${product?.id}-default`,
        price: product?.price ?? 0,
        stock: product?.stock ?? 100,
        image: product?.defaultVariant?.image ?? PLACEHOLDER_IMAGE,
        images: product?.defaultVariant?.images ?? [PLACEHOLDER_IMAGE],
        options: {},
      };
    }

    return {
      selectedVariant,
      optionKeys,
      allOptionValues,
      isUserSelectionComplete,
      isInvalidSelection,
    };
  }, [product, selectedOptionsState]);

  // Price and stock calculations
  const effectivePrice = selectedVariant?.price ?? product?.price ?? 0;

  // Use getDiscountInfo for base product discount, then adjust for variant pricing
  const baseDiscountInfo = product
    ? getDiscountInfo(product)
    : {
        hasDiscount: false,
        discountPercent: 0,
        originalPrice: null,
        savings: 0,
      };

  // For variants, we need to calculate discount relative to the effective price
  // If variant has different pricing, adjust the discount calculation
  let hasDiscount = baseDiscountInfo.hasDiscount;
  let discountPercent = baseDiscountInfo.discountPercent;
  let originalPrice = baseDiscountInfo.originalPrice;

  // If we have a selected variant with different price, recalculate discount
  if (
    selectedVariant &&
    product?.originalPrice &&
    product.originalPrice > effectivePrice
  ) {
    originalPrice = product.originalPrice;
    discountPercent = Math.round(
      ((originalPrice - effectivePrice) / originalPrice) * 100
    );
    hasDiscount = true;
  }

  const variantStock = selectedVariant?.stock ?? 0;
  const isOutOfStock = selectedVariant && variantStock <= 0;
  const isUnavailable = isInvalidSelection;
  const effectiveStock = selectedVariant
    ? variantStock
    : product
    ? getEffectiveStock(product)
    : 0;
  const canAddToCart = selectedVariant && variantStock > 0 && !isUnavailable;

  // Gallery images
  const galleryImages = useMemo(() => {
    if (!product) return [PLACEHOLDER_IMAGE];

    // If a specific variant is selected, prioritize its images
    if (selectedVariant) {
      const images = [];
      if (selectedVariant.image) images.push(selectedVariant.image);
      if (selectedVariant.images?.length)
        images.push(...selectedVariant.images);
      if (images.length > 0) return images;
    }

    // Fallback to all product images using the proper utility
    const allImages = getAllProductImages(product);
    return allImages.length > 0 ? allImages : [PLACEHOLDER_IMAGE];
  }, [selectedVariant, product]);

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
      console.error("Failed to add item to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
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
      <div className="border-b border-border/60">
        <Container className="py-3 sm:py-4">
          <nav
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap shrink-0"
            >
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-fg shrink-0" />
            <Link
              href="/products"
              className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap shrink-0"
            >
              Products
            </Link>
            {category && (
              <>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-fg shrink-0" />
                <Link
                  href={`/products/category/${category.slug}`}
                  className="text-muted-fg hover:text-fg transition-colors whitespace-nowrap shrink-0"
                >
                  {category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-fg shrink-0" />
            <span className="text-fg font-medium truncate max-w-32 sm:max-w-xs">
              {product.name}
            </span>
          </nav>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-6 sm:py-8 lg:py-12 pb-24 lg:pb-0">
        {/* Product Title - Show first on small screens */}
        <div className="w-full mb-6 sm:mb-8 lg:hidden text-left">
          <div className="text-xs sm:text-sm text-muted-fg uppercase tracking-wide font-medium mb-2">
            ShopHub
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-fg leading-tight">
            {product.name}
          </h1>
        </div>

        {/* PDP Grid Section */}
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:gap-12 xl:gap-16 2xl:gap-20 min-w-0">
          {/* Left Column - Gallery Only */}
          <div id="product-gallery" className="order-2 lg:order-1 min-w-0">
            <div className="lg:sticky lg:top-(--sticky-top,96px) lg:self-start">
              <ProductGallery
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
              {/* ShopHub Brand & Title - Inside scrollable container (hidden on lg+) */}
              <div className="w-full mb-6 sm:mb-8 lg:mb-10 text-left hidden lg:block">
                <div className="text-xs sm:text-sm text-muted-fg uppercase tracking-wide font-medium mb-2">
                  ShopHub
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold text-fg leading-tight">
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

              {/* Technical Specifications - Hidden on small screens (moved to tabs) */}
              {product.specs && product.specs.length > 0 && (
                <div className="space-y-4 hidden sm:block">
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

                    {/* Compact Specs Grid */}
                    <div className="bg-surface rounded-xl border border-border/40 overflow-hidden">
                      <div className="divide-y divide-border/30">
                        {product.specs.map((spec, index) => (
                          <div
                            key={index}
                            className="group px-4 py-3 hover:bg-surface-muted/50 transition-colors duration-200"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-sm font-medium text-muted-fg flex-1 min-w-0">
                                {spec.label}
                              </span>
                              <span className="text-sm font-semibold text-fg flex-1 min-w-0 text-right">
                                {spec.value}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Compact footer accent */}
                      <div className="h-1 bg-linear-to-r from-primary/20 via-primary/40 to-primary/20" />
                    </div>
                  </div>
                </div>
              )}

              {/* Trust Module */}
              <TrustModule />
            </div>
          </div>
        </div>

        {/* Full-width sections below the grid */}
        <div className="mt-12 sm:mt-16 lg:mt-20 space-y-12 sm:space-y-16 lg:space-y-20">
          {/* Product Details Tabs */}
          <ProductDetailsTabs product={product} />

          {/* You May Also Like Section */}
          <YouMayAlsoLike currentProduct={product} />
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
