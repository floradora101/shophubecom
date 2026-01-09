import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";

/**
 * LazySection - Component that lazy loads content when it enters the viewport
 * Uses IntersectionObserver for better performance than just next/dynamic
 */

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function LazySection({
  children,
  fallback,
  rootMargin = "50px",
  threshold = 0.1,
  className,
  as: Component = "div",
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return (
    <Component ref={ref} className={className}>
      {isVisible ? children : fallback}
    </Component>
  );
}

/**
 * createLazySection - Higher-order component for wrapping sections with lazy loading
 */
export function createLazySection<T extends object>(
  Component: ComponentType<T>,
  LoadingComponent?: ComponentType<any>
) {
  return function LazyWrappedComponent(props: T) {
    return (
      <LazySection fallback={LoadingComponent ? <LoadingComponent /> : null}>
        <Component {...props} />
      </LazySection>
    );
  };
}
