"use client";

import { useRef, useEffect, useCallback } from "react";

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

interface SwipeConfig {
  threshold?: number; // Minimum distance in pixels to trigger swipe
  velocityThreshold?: number; // Minimum velocity for swipe recognition
  maxVerticalMovement?: number; // Maximum allowed vertical movement before blocking swipe
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

interface SwipeState {
  startPos: TouchPosition | null;
  currentPos: TouchPosition | null;
  isSwiping: boolean;
  isHorizontalIntent: boolean;
}

export function useSwipe({
  threshold = 40,
  velocityThreshold = 0.3,
  maxVerticalMovement = 50,
  onSwipeLeft,
  onSwipeRight,
  onSwipeStart,
  onSwipeEnd,
}: SwipeConfig) {
  const elementRef = useRef<HTMLElement | null>(null);
  const swipeStateRef = useRef<SwipeState>({
    startPos: null,
    currentPos: null,
    isSwiping: false,
    isHorizontalIntent: false,
  });

  const getTouchPosition = useCallback(
    (touch: Touch): TouchPosition => ({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }),
    []
  );

  const calculateVelocity = useCallback(
    (start: TouchPosition, end: TouchPosition): number => {
      const distance = Math.abs(end.x - start.x);
      const time = end.time - start.time;
      return time > 0 ? distance / time : 0;
    },
    []
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      const startPos = getTouchPosition(touch);
      swipeStateRef.current = {
        startPos,
        currentPos: startPos,
        isSwiping: true,
        isHorizontalIntent: false,
      };

      onSwipeStart?.();
    },
    [getTouchPosition, onSwipeStart]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch || !swipeStateRef.current.startPos) return;

      const currentPos = getTouchPosition(touch);
      swipeStateRef.current.currentPos = currentPos;

      const deltaX = Math.abs(currentPos.x - swipeStateRef.current.startPos.x);
      const deltaY = Math.abs(currentPos.y - swipeStateRef.current.startPos.y);

      // Determine horizontal intent - if horizontal movement exceeds vertical
      // and is greater than a small threshold, consider it horizontal intent
      const isHorizontalIntent = deltaX > deltaY && deltaX > 10;

      swipeStateRef.current.isHorizontalIntent = isHorizontalIntent;

      // If horizontal intent is detected and vertical movement is within limits,
      // prevent default (block vertical scroll)
      if (isHorizontalIntent && deltaY <= maxVerticalMovement) {
        e.preventDefault();
      }
    },
    [getTouchPosition, maxVerticalMovement]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const state = swipeStateRef.current;
      if (!state.startPos || !state.currentPos || !state.isSwiping) {
        onSwipeEnd?.();
        return;
      }

      const deltaX = state.currentPos.x - state.startPos.x;
      const deltaY = state.currentPos.y - state.startPos.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Only trigger swipe if:
      // 1. Horizontal movement exceeds threshold
      // 2. Horizontal movement is greater than vertical movement
      // 3. Velocity meets threshold
      // 4. Not too much vertical movement
      if (
        absDeltaX >= threshold &&
        absDeltaX > absDeltaY &&
        absDeltaY <= maxVerticalMovement &&
        state.isHorizontalIntent
      ) {
        const velocity = calculateVelocity(state.startPos, state.currentPos);

        if (velocity >= velocityThreshold) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      }

      // Reset state
      swipeStateRef.current = {
        startPos: null,
        currentPos: null,
        isSwiping: false,
        isHorizontalIntent: false,
      };

      onSwipeEnd?.();
    },
    [
      threshold,
      maxVerticalMovement,
      velocityThreshold,
      calculateVelocity,
      onSwipeLeft,
      onSwipeRight,
      onSwipeEnd,
    ]
  );

  const setElementRef = useCallback(
    (element: HTMLElement | null) => {
      // Remove previous event listeners
      if (elementRef.current) {
        elementRef.current.removeEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
        elementRef.current.removeEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        elementRef.current.removeEventListener("touchend", handleTouchEnd, {
          passive: false,
        });
      }

      elementRef.current = element;

      // Add new event listeners
      if (element) {
        element.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
        element.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        element.addEventListener("touchend", handleTouchEnd, {
          passive: false,
        });
      }
    },
    [handleTouchStart, handleTouchMove, handleTouchEnd]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener("touchstart", handleTouchStart);
        elementRef.current.removeEventListener("touchmove", handleTouchMove);
        elementRef.current.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { setElementRef };
}
