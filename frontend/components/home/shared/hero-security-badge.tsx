import { memo } from "react";
import { Shield } from "lucide-react";

interface HeroSecurityBadgeProps {
  className?: string;
}

export const HeroSecurityBadge = memo(function HeroSecurityBadge({
  className,
}: HeroSecurityBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-white border border-white/22 ${
        className || ""
      }`}
      style={{
        background:
          "linear-gradient(90deg, var(--hero-theme-from), var(--hero-theme-to))",
      }}
    >
      <Shield className="h-3.5 w-3.5" />
      <span>Secure & Trusted</span>
    </div>
  );
});
