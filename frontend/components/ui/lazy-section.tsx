"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";

/**
 * LazySection - Component that lazy loads content when it enters the viewport
 * Uses IntersectionObserver for better performance than just next/dynamic
 */

type LazySectionElement = HTMLDivElement | HTMLElement;

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  /** Only intrinsic elements that accept a ref like div/section; custom components must forward refs */
  as?: keyof JSX.IntrinsicElements;
}

const LazySection = forwardRef<LazySectionElement, LazySectionProps>(
  function LazySection(
    {
      children,
      fallback,
      rootMargin = "50px",
      threshold = 0.1,
      className,
      as: Component = "div",
    },
    ref
  ) {
    const [isVisible, setIsVisible] = useState(false);
    const innerRef = useRef<LazySectionElement>(null);
    const resolvedRef = (ref ?? innerRef) as React.RefObject<LazySectionElement>;

    useEffect(() => {
      const element = resolvedRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin, threshold }
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }, [rootMargin, threshold]);

    return (
      <Component
        ref={resolvedRef as React.Ref<HTMLElement>}
        className={className}
      >
        {isVisible ? children : fallback}
      </Component>
    );
  }
);

export { LazySection };

/**
 * createLazySection - Higher-order component for wrapping sections with lazy loading
 */
export function createLazySection<T extends object>(
  Component: React.ComponentType<T>,
  LoadingComponent?: React.ComponentType
) {
  return function LazyWrappedComponent(props: T) {
    return (
      <LazySection fallback={LoadingComponent ? <LoadingComponent /> : null}>
        <Component {...props} />
      </LazySection>
    );
  };
}
