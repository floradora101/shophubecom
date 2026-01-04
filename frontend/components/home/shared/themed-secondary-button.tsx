import { memo } from "react";
import Link from "next/link";

interface ThemedSecondaryButtonProps {
  label: string;
  href: string;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ThemedSecondaryButton = memo(function ThemedSecondaryButton({
  label,
  href,
  className,
  onMouseEnter,
  onMouseLeave,
}: ThemedSecondaryButtonProps) {
  return (
    <Link href={href} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <button
        className={`inline-flex items-center justify-center gap-2 px-6 py-2 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-auto min-h-10 text-white border border-white/22 ${
          className || ""
        }`}
        style={{
          background:
            "linear-gradient(90deg, var(--hero-theme-from), var(--hero-theme-to))",
        }}
      >
        <span className="flex items-center gap-2">{label}</span>
      </button>
    </Link>
  );
});
