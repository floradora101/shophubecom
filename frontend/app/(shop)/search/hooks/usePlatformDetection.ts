/**
 * usePlatformDetection Hook
 *
 * Detects user's platform (Mac/Windows) and mobile devices
 * for keyboard shortcut hints and responsive behavior.
 */

import { useState, useEffect } from "react";

interface UsePlatformDetectionReturn {
  isMac: boolean;
  isMobile: boolean;
}

/**
 * Hook for detecting platform and device type
 */
export function usePlatformDetection(): UsePlatformDetectionReturn {
  const [isMac, setIsMac] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Platform detection for keyboard shortcut hint
    const macCheck =
      typeof navigator !== "undefined" &&
      navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    setIsMac(macCheck);

    // Mobile detection - hide keyboard shortcuts on touch devices
    const mobileCheck =
      typeof navigator !== "undefined" &&
      (navigator.maxTouchPoints > 0 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) ||
        window.innerWidth < 768);
    setIsMobile(mobileCheck);
  }, []);

  return { isMac, isMobile };
}
