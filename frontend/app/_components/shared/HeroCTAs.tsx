import { memo } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroCTAsProps {
  primary: {
    label: string;
    href: string;
  };
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const HeroCTAs = memo(function HeroCTAs({
  primary,
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
    </div>
  );
});
