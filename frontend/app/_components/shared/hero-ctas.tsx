import { memo } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroCTAsProps {
  primary: {
    label: string;
    href: string;
  };
  secondary?: {
    label: string;
    href: string;
  };
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const HeroCTAs = memo(function HeroCTAs({
  primary,
  secondary,
  className,
  onMouseEnter,
  onMouseLeave,
}: HeroCTAsProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start ${
        className || ""
      }`}
    >
      <Link href={primary.href} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <Button className="group w-auto">
          <span className="flex items-center gap-2">
            {primary.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
      </Link>
      {secondary && (
        <Link href={secondary.href} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          <button
            className="inline-flex items-center justify-center gap-2 px-6 py-2 border font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-auto min-h-10"
            style={{
              borderColor: "#fa0603",
              color: "#fa0603",
              backgroundColor: "rgba(250, 6, 3, 0.12)",
            }}
          >
            <span className="flex items-center gap-2">{secondary.label}</span>
          </button>
        </Link>
      )}
    </div>
  );
});
