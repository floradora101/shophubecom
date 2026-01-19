/**
 * useScreenSize Hook
 *
 * Detects screen size for responsive tab sizing.
 */

import { useState, useEffect } from "react";

interface ScreenSize {
  isMobile: boolean;
  isLarge: boolean;
}

/**
 * Hook for detecting screen size (mobile and large breakpoints)
 */
export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    isMobile: false,
    isLarge: false,
  });

  useEffect(() => {
    // Check screen size immediately and on resize
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640,
        isLarge: width >= 1280, // xl breakpoint
      });
    };

    // Use requestAnimationFrame for better performance
    const handleResize = () => {
      requestAnimationFrame(checkScreenSize);
    };

    // Check immediately
    checkScreenSize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenSize;
}
