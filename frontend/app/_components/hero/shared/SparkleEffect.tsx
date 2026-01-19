"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

interface Particle {
  id: number;
  left: string;
  top: string;
  size: string;
  duration: string;
  delay: string;
  opacity: number;
  type: "star" | "flower" | "dot";
  rotation: string;
}

interface SparkleEffectProps {
  count?: number;
  className?: string;
  isActive?: boolean;
  variant?: "default" | "glitter";
}

export const SparkleEffect = memo(function SparkleEffect({
  count = 30,
  className = "",
  isActive = true,
  variant = "default",
}: SparkleEffectProps) {
  const particles = useMemo(() => {
    const finalCount = variant === "glitter" ? count * 2 : count;
    return Array.from({ length: finalCount }).map((_, i) => {
      const typeRand = Math.random();
      let type: "star" | "flower" | "dot" = "dot";

      if (variant === "glitter") {
        // More stars and flowers for glitter effect
        if (typeRand > 0.5) type = "star";
        else type = "flower";
      } else {
        if (typeRand > 0.7) type = "star";
        else if (typeRand > 0.4) type = "flower";
      }

      return {
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: variant === "glitter"
          ? `${Math.random() * 6 + 2}px` // Smaller for glitter
          : `${Math.random() * 8 + 2}px`,
        duration: variant === "glitter"
          ? `${Math.random() * 3 + 2}s` // Faster for glitter
          : `${Math.random() * 5 + 4}s`,
        delay: `${Math.random() * 10}s`,
        opacity: variant === "glitter"
          ? Math.random() * 0.5 + 0.2 // Brighter for glitter
          : Math.random() * 0.3 + 0.1,
        type,
        rotation: `${Math.random() * 360}deg`,
      };
    });
  }, [count, variant]);

  if (!isActive) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-20 ${className}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-sparkle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
            transform: `rotate(${p.rotation})`,
          }}
        >
          {p.type === "star" && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={cn(
                "w-full h-full",
                variant === "glitter"
                  ? "text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.8)]"
                  : "text-white/80 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]"
              )}
            >
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          )}
          {p.type === "flower" && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={cn(
                "w-full h-full",
                variant === "glitter"
                  ? "text-amber-300 drop-shadow-[0_0_2px_rgba(251,191,36,0.6)]"
                  : "text-white/60 drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]"
              )}
            >
              <path d="M12,2L13.1,5.1C13.5,6.1 14.5,6.7 15.5,6.5L18.7,5.9L17.1,8.7C16.6,9.5 16.6,10.5 17.1,11.3L18.7,14.1L15.5,13.5C14.5,13.3 13.5,13.9 13.1,14.9L12,18L10.9,14.9C10.5,13.9 9.5,13.3 8.5,13.5L5.3,14.1L6.9,11.3C7.4,10.5 7.4,9.5 6.9,8.7L5.3,5.9L8.5,6.5C9.5,6.7 10.5,6.1 10.9,5.1L12,2Z" />
            </svg>
          )}
          {p.type === "dot" && (
            <div className={cn(
              "w-full h-full rounded-full blur-[1px]",
              variant === "glitter" ? "bg-yellow-200/60" : "bg-white/40"
            )} />
          )}
        </div>
      ))}
    </div>
  );
});
