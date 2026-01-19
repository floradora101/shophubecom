/**
 * useStickyBar Hook
 *
 * Manages sticky purchase bar visibility using Intersection Observer.
 */

import { useState, useEffect } from "react";

interface UseStickyBarReturn {
  showStickyBar: boolean;
}

/**
 * Hook for managing sticky purchase bar visibility
 */
export function useStickyBar(): UseStickyBarReturn {
  const [showStickyBar, setShowStickyBar] = useState(false);

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

  return { showStickyBar };
}
