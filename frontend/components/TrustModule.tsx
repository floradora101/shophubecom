// Trust Module Component - Modern 2026 ecommerce trust badges
import React from "react";
import {
  Truck,
  RotateCcw,
  Shield,
  Lock,
  CreditCard,
  Receipt,
} from "lucide-react";
import Link from "next/link";
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
    <div
      className={cn(
        "group relative p-4 rounded-lg border border-border/50 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all duration-500",
        className
      )}
    >
      {/* Content */}
      <div className="relative flex items-center gap-4">
        {/* Icon with minimal container */}
        <div className="relative shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-surface border border-border/50 group-hover:border-primary-500/20 group-hover:shadow-sm transition-all duration-500">
          <div className="text-primary-600/80 group-hover:text-primary-600 group-hover:scale-110 transition-all duration-500">
            {icon}
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-foreground group-hover:text-primary-600 transition-colors duration-300 tracking-tight leading-none mb-1.5">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            {description}
          </p>
          {learnMore && (
            <Link
              href={learnMore}
              className="text-[10px] font-bold text-primary-500 hover:text-primary-600 transition-colors duration-200 inline-block mt-1.5 uppercase tracking-widest"
            >
              Learn more
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function TrustModule() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fast Delivery */}
        <TrustItem
          icon={<Truck className="h-5 w-5" />}
          title="Fast Delivery"
          description="Same day in Beirut, 3-6 days Lebanon"
        />

        {/* Easy Returns */}
        <TrustItem
          icon={<RotateCcw className="h-5 w-5" />}
          title="Easy Returns"
          description="Within 3 days of purchase"
        />

        {/* Secure Checkout */}
        <TrustItem
          icon={<Shield className="h-5 w-5" />}
          title="Secure Checkout"
          description="Bank-level SSL encryption"
        />

        {/* Duties & Taxes */}
        <TrustItem
          icon={<Receipt className="h-5 w-5" />}
          title="Duties & Taxes"
          description="Non-refundable, included in price"
        />
      </div>
    </div>
  );
}
