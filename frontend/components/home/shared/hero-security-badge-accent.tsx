import { memo } from "react";
import { Shield } from "lucide-react";

interface HeroSecurityBadgeAccentProps {
  className?: string;
}

export const HeroSecurityBadgeAccent = memo(function HeroSecurityBadgeAccent({
  className,
}: HeroSecurityBadgeAccentProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold border ${
        className || ""
      }`}
      style={{
        borderColor: "#fa0603",
        color: "#fa0603",
        backgroundColor: "rgba(250, 6, 3, 0.12)",
      }}
    >
      <Shield className="h-3.5 w-3.5" />
      <span>Secure & Trusted</span>
    </div>
  );
});
