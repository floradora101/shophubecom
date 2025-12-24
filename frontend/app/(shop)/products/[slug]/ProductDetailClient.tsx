// Modern Product Detail Page - 2026 Editorial Style
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  mockProducts,
  mockProductToProduct,
  mockCategories,
  mockCategoryToCategory,
} from "@/lib/mock-data/mock-data";
import { getEffectiveStock } from "@/features/products/utils/inventory";
import { useCart } from "@/features/cart/hooks";
import { ProductGallery } from "./components/ProductGallery";
import { ProductPurchasePanel } from "./components/ProductPurchasePanel";
import { QualityMiniStrip } from "./components/QualityMiniStrip";
import { ProductDetailsAccordion } from "./components/ProductDetailsAccordion";
import { YouMayAlsoLike } from "./components/YouMayAlsoLike";
import { StickyPurchaseBar } from "./components/StickyPurchaseBar";

interface ProductDetailClientProps {
  slug: string;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect fill='%23f3f4f6' width='600' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='20' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

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

    const purchaseSection = document.getElementById("purchase-section");
    if (purchaseSection) observer.observe(purchaseSection);

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
  const hasDiscount =
    product?.originalPrice && product.originalPrice > effectivePrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - effectivePrice) / product.originalPrice!) *
          100
      )
    : 0;

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
    if (!selectedVariant)
      return product.defaultVariant?.images || [PLACEHOLDER_IMAGE];

    const images = [];
    if (selectedVariant.image) images.push(selectedVariant.image);
    if (selectedVariant.images?.length) images.push(...selectedVariant.images);
    return images.length
      ? images
      : product.defaultVariant?.images || [PLACEHOLDER_IMAGE];
  }, [selectedVariant, product]);

  // Handlers
  const handleOptionSelect = useCallback(
    (key: string, value: string) => {
      const next = { ...selectedOptionsState, [key]: value };
      setSelectedOptionsState(next);
      updateUrlWithSelections(next);
      setShowSelectionError(false); // Clear error on selection
    },
    [selectedOptionsState, updateUrlWithSelections]
  );

  const handleQuantityChange = useCallback(
    (value: number) => {
      if (value < 1) return;
      if (effectiveStock > 0 && value > effectiveStock) return;
      setQuantity(value);
    },
    [effectiveStock]
  );

  const handleAddToCart = useCallback(() => {
    // Check if selection is required but not complete
    if (optionKeys.length > 0 && !isUserSelectionComplete) {
      setShowSelectionError(true);
      // Scroll to purchase section
      const purchaseSection = document.getElementById("purchase-section");
      if (purchaseSection) {
        purchaseSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!canAddToCart || !selectedVariant || !product) return;

    addItem(product, {
      quantity: Math.min(quantity, effectiveStock),
      priceOverride: effectivePrice,
      image: selectedVariant.image ?? product.defaultVariant?.image,
      variantId: selectedVariant.id,
      variantSku: selectedVariant.sku,
      color: selectedOptionsState.color ?? null,
      storage: selectedOptionsState.storage ?? null,
    });
    toggleCart(true);
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
    optionKeys.length,
    isUserSelectionComplete,
  ]);

  // Product not found - clean error state
  if (!product) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-cream-50 to-primary-100/50 relative flex items-center">
        <div className="fixed inset-0 bg-linear-to-br from-primary-50 via-cream-50 to-primary-100/50 opacity-60 -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.1),transparent_50%)] -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.08),transparent_50%)] -z-10" />
        <Container className="py-16 relative z-0">
          <div className="text-center max-w-md mx-auto">
            <AlertTriangle className="h-16 w-16 text-slate-400 mx-auto mb-6" />
            <h1 className="text-2xl font-semibold text-slate-900 mb-3">
              Product Not Found
            </h1>
            <p className="text-slate-600 mb-8">
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

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-cream-50 to-primary-100/50 relative">
      {/* Background layers - consistent with homepage */}
      <div className="fixed inset-0 bg-linear-to-br from-primary-50 via-cream-50 to-primary-100/50 opacity-60 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.1),transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.08),transparent_50%)] -z-10" />

      {/* Breadcrumb */}
      <div className="border-b border-slate-200/60">
        <Container className="py-4">
          <nav
            className="flex items-center gap-2 text-sm"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <Link
              href="/products"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Products
            </Link>
            {category && (
              <>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <Link
                  href={`/products/category/${category.slug}`}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <span className="text-slate-900 font-medium truncate max-w-xs">
              {product.name}
            </span>
          </nav>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:gap-16">
          {/* Gallery */}
          <div className="order-2 lg:order-1 lg:sticky lg:top-24 self-start">
            <ProductGallery
              images={galleryImages}
              productName={product.name}
              isOutOfStock={!!isOutOfStock}
              isUnavailable={!!isUnavailable}
            />
          </div>

          {/* Purchase Panel + Accordions */}
          <div className="order-1 lg:order-2 space-y-8">
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

            {/* Quality Strip */}
            <QualityMiniStrip />

            {/* Product Details */}
            <ProductDetailsAccordion product={product} />
          </div>
        </div>

        {/* You May Also Like Section */}
        <YouMayAlsoLike currentProduct={product} />
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
