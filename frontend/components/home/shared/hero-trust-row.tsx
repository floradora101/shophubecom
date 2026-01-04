import { memo } from "react";
import { LucideIcon } from "lucide-react";

interface TrustItem {
  icon?: LucideIcon;
  text: string;
  useDot?: boolean; // Use a colored dot instead of icon
}

interface HeroTrustRowProps {
  items: TrustItem[];
  className?: string;
  // For landscape hero with different styling
  variant?: "default" | "overlay";
}

export const HeroTrustRow = memo(function HeroTrustRow({
  items,
  className,
  variant = "default",
}: HeroTrustRowProps) {
  const getItemClasses = () => {
    if (variant === "overlay") {
      return "flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg border border-white/20";
    }
    return "flex items-center gap-3 px-3 py-2 bg-surface-muted rounded-lg border border-border";
  };

  const getIconClasses = () => {
    if (variant === "overlay") {
      return "h-4 w-4 text-white";
    }
    return "h-4 w-4 text-muted-fg";
  };

  const getTextClasses = () => {
    if (variant === "overlay") {
      return "text-sm text-white font-(--font-inter)";
    }
    return "text-sm text-muted-fg font-(--font-inter)";
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 ${
        className || ""
      }`}
    >
      {items.map((item, index) => (
        <div key={index} className={getItemClasses()}>
          {item.icon ? (
            <item.icon className={getIconClasses()} />
          ) : item.useDot ? (
            <div
              className={`w-2 h-2 ${
                variant === "overlay" ? "bg-white" : "bg-[var(--hero-accent)]"
              } rounded-full`}
            />
          ) : null}
          <span className={getTextClasses()}>{item.text}</span>
        </div>
      ))}
    </div>
  );
});
