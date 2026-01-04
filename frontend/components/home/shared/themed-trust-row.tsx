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
      className={`flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 ${
        className || ""
      }`}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-3 font-medium text-sm"
          style={{
            background: "transparent",
          }}
        >
          {item.icon ? (
            <item.icon
              className="h-4 w-4"
              style={{
                color: "var(--hero-theme-from)",
              }}
            />
          ) : item.useDot ? (
            <div
              className="w-2 h-2 rounded-full"
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
