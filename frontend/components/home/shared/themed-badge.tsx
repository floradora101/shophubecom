import { memo } from "react";
import { LucideIcon } from "lucide-react";

interface ThemedBadgeProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export const ThemedBadge = memo(function ThemedBadge({
  children,
  icon: Icon,
  className,
}: ThemedBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 mt-4 sm:mt-6 w-fit text-xs sm:text-sm font-semibold text-white border border-white/22 ${
        className || ""
      }`}
      style={{
        background:
          "linear-gradient(90deg, var(--hero-theme-from), var(--hero-theme-to))",
      }}
    >
      {Icon && <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
      <span>{children}</span>
    </div>
  );
});
