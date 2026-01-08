import { memo } from "react";
import { LucideIcon } from "lucide-react";

interface TrustItem {
  icon?: LucideIcon;
  text: string;
  useDot?: boolean; // Use a colored dot instead of icon
}

interface ThemedTrustRowProps {
  items: TrustItem[];
  className?: string;
}

export const ThemedTrustRow = memo(function ThemedTrustRow({
  items,
  className,
}: ThemedTrustRowProps) {
  return (
    <div
      className={`flex flex-nowrap items-center gap-1.5 sm:gap-3 md:gap-6 lg:gap-8 overflow-x-auto ${
        className || ""
      }`}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2 sm:gap-3 font-medium text-xs sm:text-sm"
          style={{
            background: "transparent",
          }}
        >
          {item.icon ? (
            <item.icon
              className="h-3 w-3 sm:h-4 sm:w-4"
              style={{
                color: "var(--hero-theme-from)",
              }}
            />
          ) : item.useDot ? (
            <div
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
              style={{
                backgroundColor: "var(--hero-theme-from)",
              }}
            />
          ) : null}
          <span
            style={{
              background:
                "linear-gradient(90deg, var(--hero-theme-from), var(--hero-theme-to))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
});
