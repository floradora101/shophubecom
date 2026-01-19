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
      className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-[10px] sm:text-xs font-black text-white border border-white/20 shadow-lg uppercase tracking-[0.2em] ${
        className || ""
      }`}
      style={{
        background:
          "linear-gradient(90deg, #fa0603, #000000)",
      }}
    >
      <Shield className="h-3.5 w-3.5" />
      <span>Secure & Trusted</span>
    </div>
  );
});
