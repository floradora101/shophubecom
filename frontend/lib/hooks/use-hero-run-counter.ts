import { useState, useEffect, useRef } from "react";

/**
 * Hook for managing animation run counter for hero elements
 *
 * Increments run counter when active becomes true, allowing animations to
 * retrigger without remounting components.
 */
export function useHeroRunCounter(active: boolean) {
  const [run, setRun] = useState(active ? 1 : 0); // Start at 1 if initially active
  const [animationKey, setAnimationKey] = useState(active ? 1 : 0); // Separate key for animation restart
  const wasActiveRef = useRef(active);

  useEffect(() => {
    // Only increment run counter when becoming active (active goes from false to true)
    if (active && !wasActiveRef.current) {
      setRun((prev) => prev + 1);
      setAnimationKey((prev) => prev + 1); // Force animation restart
    }
    wasActiveRef.current = active;
  }, [active]);

  return { run, animationKey };
}
