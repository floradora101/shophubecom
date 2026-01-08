// Trust Module Component - Modern 2026 ecommerce trust badges
import {
  Truck,
  RotateCcw,
  Shield,
  Lock,
  CreditCard,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface TrustItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  learnMore?: string;
  className?: string;
}

function TrustItem({
  icon,
  title,
  description,
  learnMore,
  className,
}: TrustItemProps) {
  return (
    <Card
      variant="default"
      padding="sm"
      className={cn(
        "group relative bg-muted/20 border-border/40 hover:bg-muted/30 hover:border-primary-200/60 transition-all duration-300 hover:shadow-sm hover:shadow-primary-500/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        className
      )}
    >
      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary-50/20 via-transparent to-primary-50/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

      {/* Content */}
      <div className="relative flex items-center gap-3">
        {/* Icon */}
        <div className="relative shrink-0">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 group-hover:scale-105 transition-all duration-300 border border-primary-100/50">
            <div className="text-primary-600">{icon}</div>
          </div>
          {/* Subtle shine effect */}
          <div className="absolute inset-0 rounded-lg bg-linear-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary-600 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground leading-tight">
            {description}
          </p>
          {learnMore && (
            <Link
              href={learnMore}
              className="text-xs text-primary-600 hover:text-primary-600 hover:underline transition-colors duration-200 inline-block"
            >
              Learn more
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

export function TrustModule() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3">
        {/* Fast Delivery */}
        <TrustItem
          icon={<Truck className="h-4 w-4" />}
          title="Fast Delivery"
          description="Same day in Beirut, 3-6 days Lebanon"
        />

        {/* Easy Returns */}
        <TrustItem
          icon={<RotateCcw className="h-4 w-4" />}
          title="Easy Returns"
          description="Within 3 days of purchase"
        />

        {/* Secure Checkout */}
        <TrustItem
          icon={<Shield className="h-4 w-4" />}
          title="Secure Checkout"
          description="Bank-level SSL encryption"
        />

        {/* Duties & Taxes */}
        <TrustItem
          icon={<Receipt className="h-4 w-4" />}
          title="Duties & Taxes"
          description="Non-refundable, included in price"
        />
      </div>

      {/* Security indicators - compact horizontal layout */}
      <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-border/20">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 text-success" />
          <span className="font-medium">SSL Protected</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CreditCard className="h-3 w-3 text-primary-500" />
          <span className="font-medium">All Cards</span>
        </div>
      </div>
    </div>
  );
}
