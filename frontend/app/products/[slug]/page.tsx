// Product detail page resolved by slug.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/features/products/components/ProductCard";
import { useProductQuery, useProductsQuery } from "@/features/products/queries";
import {
  getEffectiveStock,
  LOW_STOCK_THRESHOLD,
} from "@/features/products/utils/inventory";
import { useCart } from "@/features/cart/hooks";
import { formatPrice } from "@/lib/utils";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect fill='%23f3f4f6' width='600' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='20' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductDetailPage() {
  const params = useParams();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  // Fetch product by slug
  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
  } = useProductQuery(slug || "");

  // Fetch related products (same category, excluding current)
  const { data: relatedData } = useProductsQuery({
    page: 1,
    limit: 5,
    categoryId: product?.categoryId || undefined,
  });
  const relatedProducts = useMemo(() => {
    if (!relatedData?.data) return [];
    return relatedData.data.filter((p) => p.slug !== slug).slice(0, 5);
  }, [relatedData, slug]);
  const [userImageIndex, setUserImageIndex] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [transitionKey, setTransitionKey] = useState(0);
  const [previousImageIndex, setPreviousImageIndex] = useState<number>(0);
  const [autoSwitchMsg, setAutoSwitchMsg] = useState<string | null>(null);
  const AUTO_SWITCH_MSG_MS = 4500;
  const autoSwitchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const { addItem, toggleCart } = useCart();
  const error = productError
    ? "We couldn't load this product right now. Please try again."
    : null;
  const isLoading = productLoading;

  // Cleanup on unmount (prevents leaks)
  useEffect(() => {
    return () => {
      if (autoSwitchTimeoutRef.current)
        clearTimeout(autoSwitchTimeoutRef.current);
    };
  }, []);

  const variantsWithOptions = useMemo(() => {
    if (!product?.variants?.length) return [];
    return product.variants.map((variant) => {
      const options: Record<string, string> = { ...(variant.options ?? {}) };
      return { ...variant, options };
    });
  }, [product]);

  const optionKeys = useMemo(() => {
    const keys = new Set<string>();
    variantsWithOptions.forEach((variant) => {
      Object.keys(variant.options ?? {}).forEach((key) => keys.add(key));
    });
    const prioritized = ["color", "storage"];
    const rest = Array.from(keys)
      .filter((key) => !prioritized.includes(key))
      .sort();
    return [...prioritized.filter((key) => keys.has(key)), ...rest];
  }, [variantsWithOptions]);

  const allOptionValues = useMemo(() => {
    // All values per key across ALL variants (so UI can show them)
    const map = new Map<string, Map<string, number>>();

    for (const variant of variantsWithOptions) {
      const stock = variant.stock ?? 0;
      for (const [key, value] of Object.entries(variant.options ?? {})) {
        if (!map.has(key)) map.set(key, new Map());
        const valueMap = map.get(key)!;
        valueMap.set(value, (valueMap.get(value) ?? 0) + stock);
      }
    }

    const out: Record<string, { value: string; totalStock: number }[]> = {};
    for (const key of optionKeys) {
      const valueMap = map.get(key) ?? new Map();
      out[key] = Array.from(valueMap.entries()).map(([value, totalStock]) => ({
        value,
        totalStock,
      }));
    }
    return out;
  }, [optionKeys, variantsWithOptions]);

  const getMatchesCount = (
    variant: { options?: Record<string, string> },
    current: Record<string, string>,
    skipKey: string
  ) => {
    let score = 0;
    for (const [k, v] of Object.entries(current)) {
      if (!v || k === skipKey) continue;
      if (variant.options?.[k] === v) score++;
    }
    return score;
  };

  const findBestVariantForChange = (key: string, value: string) => {
    const candidates = variantsWithOptions.filter(
      (v) => v.options?.[key] === value
    );
    if (!candidates.length) return null;

    const ranked = candidates
      .map((v) => ({
        variant: v,
        inStock: (v.stock ?? 0) > 0,
        score: getMatchesCount(v, selectedOptions, key),
      }))
      .sort(
        (a, b) => Number(b.inStock) - Number(a.inStock) || b.score - a.score
      );

    return ranked[0]?.variant ?? null;
  };

  const selectionEntries = useMemo(
    () => Object.entries(selectedOptions).filter(([, v]) => Boolean(v)),
    [selectedOptions]
  );

  const candidateVariants = useMemo(() => {
    if (!variantsWithOptions.length) return [];
    return variantsWithOptions.filter((variant) =>
      selectionEntries.every(([key, value]) => variant.options?.[key] === value)
    );
  }, [selectionEntries, variantsWithOptions]);

  const isUserSelectionComplete = useMemo(() => {
    if (!optionKeys.length) return false;
    return optionKeys.every((k) => Boolean(selectedOptions[k]));
  }, [optionKeys, selectedOptions]);

  const isInvalidSelection =
    isUserSelectionComplete && candidateVariants.length === 0;

  const selectedVariant = useMemo(() => {
    if (!variantsWithOptions.length) return null;
    if (isInvalidSelection) return null;

    // Prefer in-stock among candidates
    const inStockCandidate = candidateVariants.find((v) => (v.stock ?? 0) > 0);
    if (inStockCandidate) return inStockCandidate;

    // Otherwise any candidate
    if (candidateVariants[0]) return candidateVariants[0];

    // Fallback: first in-stock overall, else first
    return (
      variantsWithOptions.find((v) => (v.stock ?? 0) > 0) ??
      variantsWithOptions[0] ??
      null
    );
  }, [candidateVariants, isInvalidSelection, variantsWithOptions]);

  const resolvedSelections = useMemo(() => {
    if (selectedVariant?.options) {
      return { ...selectedVariant.options, ...selectedOptions };
    }
    return { ...selectedOptions };
  }, [selectedVariant, selectedOptions]);

  const collectVariantImages = (
    variant: { image?: string; images?: string[] } | null | undefined
  ) => {
    const imgs: string[] = [];
    if (!variant) return imgs;
    if (variant.image) imgs.push(variant.image);
    if (Array.isArray(variant.images)) imgs.push(...variant.images);
    return imgs;
  };

  const galleryImages = useMemo(() => {
    const imgs: string[] = [];

    // 1) Selected variant images only
    imgs.push(...collectVariantImages(selectedVariant));

    // 2) If invalid selection or no variant, fallback to FIRST variant only (never all)
    if (imgs.length === 0 && product?.variants?.length) {
      imgs.push(...collectVariantImages(product.variants[0]));
    }

    const urls = Array.from(new Set(imgs)).filter(Boolean);
    return urls.length ? urls : [PLACEHOLDER_IMAGE];
  }, [product, selectedVariant]);

  const primaryImage = useMemo(() => {
    if (selectedVariant?.image) return selectedVariant.image;
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images[0];
    }
    // Fallback to first variant
    if (product?.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      if (firstVariant.image) return firstVariant.image;
      if (firstVariant.images && firstVariant.images.length > 0) {
        return firstVariant.images[0];
      }
    }
    return PLACEHOLDER_IMAGE;
  }, [selectedVariant, product]);

  const activeImageIndex = useMemo(() => {
    const fallbackIndex = 0;
    if (userImageIndex === null) return fallbackIndex;
    return galleryImages[userImageIndex] ? userImageIndex : fallbackIndex;
  }, [galleryImages, userImageIndex]);

  const activeImage =
    galleryImages[activeImageIndex] ?? galleryImages[0] ?? PLACEHOLDER_IMAGE;

  const effectivePrice = selectedVariant?.price ?? product?.price ?? 0;
  const variantStock = selectedVariant?.stock ?? 0;

  const isOutOfStock = Boolean(selectedVariant) && variantStock <= 0;
  const isUnavailable = isInvalidSelection;

  const effectiveStock = selectedVariant
    ? variantStock
    : product?.variants?.length
    ? 0
    : getEffectiveStock(product, undefined);

  const isLowStock =
    !isOutOfStock && !isUnavailable && effectiveStock < LOW_STOCK_THRESHOLD;

  const safeQuantity =
    selectedVariant && variantStock > 0
      ? Math.min(quantity, variantStock)
      : quantity;

  const canAddToCart = Boolean(
    selectedVariant && variantStock > 0 && !isUnavailable
  );

  const formatOptionLabel = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const applyOption = (key: string, value: string) => {
    // 1) Try keeping other picks
    const next = { ...selectedOptions, [key]: value };

    const stillValid = variantsWithOptions.some((v) =>
      Object.entries(next).every(([k, val]) => !val || v.options?.[k] === val)
    );

    if (stillValid) {
      setSelectedOptions(next);
      setUserImageIndex(null);
      return;
    }

    // 2) Auto-repair: jump to best variant that has (key=value)
    const best = findBestVariantForChange(key, value);

    if (best?.options) {
      // Detect what changed (excluding the clicked key) to build auto-switch message
      const previousSelections = { ...selectedOptions };
      const newSelections = { ...best.options };
      const changedOptions: string[] = [];

      for (const [k, v] of Object.entries(newSelections)) {
        if (k !== key && previousSelections[k] !== v && v) {
          changedOptions.push(`${formatOptionLabel(k)} updated to ${v}`);
        }
      }

      setSelectedOptions({ ...best.options }); // now it's a real combo

      // Show auto-switch message if any other options changed
      if (changedOptions.length > 0) {
        const msg = changedOptions.join(", ");

        setAutoSwitchMsg(msg);

        // clear any previous timer so it doesn't cut your message early
        if (autoSwitchTimeoutRef.current) {
          clearTimeout(autoSwitchTimeoutRef.current);
        }

        autoSwitchTimeoutRef.current = setTimeout(() => {
          setAutoSwitchMsg(null);
          autoSwitchTimeoutRef.current = null;
        }, AUTO_SWITCH_MSG_MS);
      }
    } else {
      // fallback: allow just this key (should rarely happen)
      setSelectedOptions({ [key]: value });
    }

    setUserImageIndex(null);
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant || !selectedVariant.id) return;
    if (!canAddToCart) return;
    // Always send variantId (required)
    addItem(product, {
      quantity: safeQuantity,
      priceOverride: effectivePrice,
      image: selectedVariant.image ?? primaryImage,
      variantId: selectedVariant.id,
      variantSku: selectedVariant.sku ?? null,
      color: resolvedSelections?.color ?? null,
      storage: resolvedSelections?.storage ?? null,
    });
    toggleCart(true);
  };

  const handlePreviousImage = () => {
    if (isAnimating) return;
    const current = activeImageIndex ?? 0;
    const previousIndex =
      current === 0 ? galleryImages.length - 1 : current - 1;
    setPreviousImageIndex(current);
    setDirection(-1);
    setIsAnimating(true);
    setUserImageIndex(previousIndex);
    setTransitionKey((prev) => prev + 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleNextImage = () => {
    if (isAnimating) return;
    const current = activeImageIndex ?? 0;
    const nextIndex = current === galleryImages.length - 1 ? 0 : current + 1;
    setPreviousImageIndex(current);
    setDirection(1);
    setIsAnimating(true);
    setUserImageIndex(nextIndex);
    setTransitionKey((prev) => prev + 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (effectiveStock > 0 && value > effectiveStock) return;
    setQuantity(value);
  };

  const handleThumbnailClick = (index: number) => {
    if (isAnimating) return;
    const current = activeImageIndex ?? 0;
    if (index === current) return;
    setPreviousImageIndex(current);
    setDirection(index > current ? 1 : -1);
    setIsAnimating(true);
    setUserImageIndex(index);
    setTransitionKey((prev) => prev + 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const breadcrumbName =
    product?.name ?? (isLoading ? "Loading..." : "Product details");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-2 h-12 text-sm">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                HOME
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <Link
                href="/products"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                PRODUCTS
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 font-semibold uppercase line-clamp-1">
                {breadcrumbName}
              </span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
              <div className="space-y-4">
                <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
                <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-24 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-12 w-40 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Unable to load this product.</p>
                  <p className="text-sm text-red-700">{error}</p>
                  <div className="mt-4">
                    <Link
                      href="/products"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Back to products
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : !product ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Product not found.</p>
              <Link
                href="/products"
                className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-2 mt-2"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-2">
              {/* Gallery */}
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="relative aspect-square bg-white overflow-hidden">
                    {/* Previous image (exiting) */}
                    {isAnimating && (
                      <div
                        className="absolute inset-0 transition-all duration-300 ease-out"
                        style={{
                          transform:
                            direction === 1
                              ? "translateX(-100%)"
                              : "translateX(100%)",
                          opacity: 0,
                        }}
                      >
                        <Image
                          src={
                            galleryImages[previousImageIndex] ??
                            PLACEHOLDER_IMAGE
                          }
                          alt={product.name}
                          fill
                          className="object-contain p-6"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          unoptimized={(
                            galleryImages[previousImageIndex] ?? ""
                          ).startsWith("data:")}
                        />
                      </div>
                    )}
                    {/* Current image (entering) */}
                    <div
                      key={transitionKey}
                      className="absolute inset-0"
                      style={
                        isAnimating
                          ? {
                              animation:
                                direction === 1
                                  ? "slideInFromRight 0.3s ease-out forwards"
                                  : "slideInFromLeft 0.3s ease-out forwards",
                            }
                          : {}
                      }
                    >
                      <Image
                        src={activeImage ?? PLACEHOLDER_IMAGE}
                        alt={product.name}
                        fill
                        className="object-contain p-6"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized={(activeImage ?? "").startsWith("data:")}
                      />
                    </div>
                    {(isUnavailable || isOutOfStock) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <span className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white uppercase tracking-wide">
                          {isUnavailable ? "Not Available" : "Out of Stock"}
                        </span>
                      </div>
                    )}

                    {galleryImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePreviousImage}
                          disabled={isAnimating}
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white focus-visible:outline focus-visible:outline-primary-500 disabled:opacity-50 z-20"
                          aria-label="Previous image"
                          suppressHydrationWarning
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronRight className="h-5 w-5 rotate-180 text-gray-700" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextImage}
                          disabled={isAnimating}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white focus-visible:outline focus-visible:outline-primary-500 disabled:opacity-50 z-20"
                          aria-label="Next image"
                          suppressHydrationWarning
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5 text-gray-700" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                  {galleryImages.map((image, index) => {
                    const isActive = activeImage === image;
                    return (
                      <button
                        key={`${image}-${index}`}
                        onClick={() => handleThumbnailClick(index)}
                        disabled={isAnimating}
                        className={`relative aspect-square rounded-xl border transition-all duration-200 bg-white overflow-hidden ${
                          isActive
                            ? "border-primary-500 ring-2 ring-primary-100 scale-[1.03]"
                            : "border-gray-200 hover:border-primary-200 hover:scale-[1.02]"
                        } ${
                          isAnimating ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        aria-label="Select product image"
                        suppressHydrationWarning
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-contain p-2"
                          sizes="120px"
                          unoptimized={image.startsWith("data:")}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div className="space-y-2">
                  {product.category && (
                    <Link
                      href={`/products?category=${product.category.slug}`}
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700 uppercase tracking-wide"
                    >
                      {product.category.name}
                    </Link>
                  )}
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                    {product.name}
                  </h1>
                </div>

                <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(effectivePrice)}
                    </span>
                    {isLowStock && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                        Low stock
                      </span>
                    )}
                    {isUnavailable && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        Not available
                      </span>
                    )}
                    {isOutOfStock && !isUnavailable && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        Out of stock
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    {isUnavailable ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">Not available</span>
                      </>
                    ) : isOutOfStock ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-700">Out of stock</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-700">
                          In stock ({effectiveStock} available)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {optionKeys.map((key) => {
                  const values = allOptionValues[key] ?? [];
                  if (!values.length) return null;
                  const activeValue = resolvedSelections[key];
                  const label = formatOptionLabel(key);
                  return (
                    <div key={key} className="space-y-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {values.map(({ value }) => {
                          const existsAnywhere = variantsWithOptions.some(
                            (v) => v.options?.[key] === value
                          );

                          // compatible variants with current selection EXCLUDING key
                          const compatible = variantsWithOptions.filter((v) => {
                            if (v.options?.[key] !== value) return false;
                            return Object.entries(selectedOptions).every(
                              ([k, selVal]) => {
                                if (!selVal || k === key) return true;
                                return v.options?.[k] === selVal;
                              }
                            );
                          });

                          const compatibleStock = compatible.reduce(
                            (sum, v) => sum + (v.stock ?? 0),
                            0
                          );
                          const isCompatibleNow = compatible.length > 0;
                          const isSoldOutNow =
                            isCompatibleNow && compatibleStock <= 0;

                          // Map to 4 states:
                          // - active: selected
                          // - available: compatible now
                          // - switch: incompatible now but clickable → will auto-adjust other option
                          // - soldOut: disabled
                          const isDisabled = isSoldOutNow || !existsAnywhere;
                          const isIncompatible =
                            existsAnywhere && !isCompatibleNow;
                          const isSwitch = isIncompatible && !isDisabled;
                          const isActive = activeValue === value;

                          return (
                            <button
                              key={`${key}-${value}`}
                              type="button"
                              disabled={isDisabled}
                              aria-disabled={isDisabled}
                              onClick={() => {
                                if (isDisabled) return;
                                applyOption(key, value);
                                setUserImageIndex(null);
                              }}
                              className={[
                                "relative rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200",
                                "focus-visible:outline-2 focus-visible:outline-primary-500",
                                isActive &&
                                  "border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-100",
                                !isActive &&
                                  !isDisabled &&
                                  !isSwitch &&
                                  "border-gray-200 hover:border-primary-200 hover:bg-primary-50/40 text-gray-800",
                                isSwitch &&
                                  !isActive &&
                                  "border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50/30 text-gray-800 cursor-pointer",
                                isDisabled &&
                                  "cursor-not-allowed bg-gray-100 text-gray-400 line-through opacity-70",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              suppressHydrationWarning
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {autoSwitchMsg && (
                  <div
                    className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm transition-opacity duration-200"
                    role="status"
                    aria-live="polite"
                  >
                    <p>
                      <span className="font-semibold text-gray-900">
                        Updated:
                      </span>{" "}
                      {autoSwitchMsg}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setAutoSwitchMsg(null);
                        if (autoSwitchTimeoutRef.current) {
                          clearTimeout(autoSwitchTimeoutRef.current);
                          autoSwitchTimeoutRef.current = null;
                        }
                      }}
                      className="text-gray-600 hover:text-gray-900"
                      aria-label="Dismiss update message"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Quantity
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-full border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(safeQuantity - 1)}
                        className="p-2 text-gray-600 hover:text-primary-600 disabled:opacity-40"
                        disabled={
                          safeQuantity <= 1 || isOutOfStock || isUnavailable
                        }
                        aria-label="Decrease quantity"
                        suppressHydrationWarning
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-gray-900">
                        {safeQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(safeQuantity + 1)}
                        className="p-2 text-gray-600 hover:text-primary-600 disabled:opacity-40"
                        disabled={
                          isOutOfStock ||
                          isUnavailable ||
                          (effectiveStock > 0 && safeQuantity >= effectiveStock)
                        }
                        aria-label="Increase quantity"
                        suppressHydrationWarning
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                        !canAddToCart
                          ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                          : "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                      }`}
                      disabled={!canAddToCart}
                      onClick={handleAddToCart}
                      suppressHydrationWarning
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Product details
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                    {product.description || "No description provided."}
                  </p>
                </div>

                {product.specs?.length ? (
                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      Specifications
                    </h2>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-800">
                      {product.specs.map((spec, index) => (
                        <div
                          key={`${spec.label}-${index}`}
                          className="flex items-center justify-between gap-4"
                        >
                          <dt className="font-medium text-gray-700">
                            {spec.label}
                          </dt>
                          <dd className="text-right text-gray-900">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* You may also like */}
        {!isLoading && !error && relatedProducts.length > 0 ? (
          <div className="bg-gray-50 border-t border-gray-100 py-10">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  You may also like
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {relatedProducts.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
