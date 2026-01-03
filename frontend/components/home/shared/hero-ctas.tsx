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
}

export const HeroCTAs = memo(function HeroCTAs({
  primary,
  secondary,
  className,
}: HeroCTAsProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start ${
        className || ""
      }`}
    >
      <Link href={primary.href}>
        <Button className="group w-auto">
          <span className="flex items-center gap-2">
            {primary.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
      </Link>
      {secondary && (
        <Link href={secondary.href}>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[var(--hero-bg-from)] border border-[var(--hero-border)] text-[var(--hero-accent)] font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-auto min-h-10">
            <span className="flex items-center gap-2">{secondary.label}</span>
          </button>
        </Link>
      )}
    </div>
  );
});
