import { ReactNode } from "react";

interface HeroItemProps {
  children: ReactNode;
  run?: number;
  animationKey?: number;
  className?: string;
}

/**
 * Layout-preserving wrapper for hero animations
 *
 * Uses `display: contents` to maintain layout neutrality while providing
 * animation scope. Only animates opacity and transform: translate3d(0,12px,0).
 */
export function HeroItem({
  children,
  run = 0,
  animationKey,
  className,
}: HeroItemProps) {
  return (
    <div
      key={animationKey} // Force re-mount to restart animation
      className={className}
      style={{ display: "contents" }}
      data-run={run}
    >
      {children}
    </div>
  );
}
