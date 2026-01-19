/**
 * SpecificationsTab Component
 *
 * Displays product specifications with icons.
 */

import { Settings } from "lucide-react";
import { getSpecIcon } from "../utils/getSpecIcon";
import type { Product } from "@/features/products/types";

interface SpecificationsTabProps {
  product: Product;
}

export function SpecificationsTab({ product }: SpecificationsTabProps) {
  if (!product.specs || product.specs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-6">
          <Settings className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">
          No Specifications Available
        </h3>
        <p className="text-muted-foreground max-w-xs mx-auto text-sm">
          Technical specifications for this product are not currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12">
        {product.specs.map((spec, index) => (
          <div
            key={index}
            className="flex items-start gap-4 transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-muted-fg shrink-0 group-hover:bg-primary-500/10 group-hover:text-primary-600 transition-colors duration-300">
              {getSpecIcon(spec.label)}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[10px] font-black text-muted-fg uppercase tracking-[0.2em] mb-1.5 opacity-50">
                {spec.label}
              </p>
              <p className="text-sm sm:text-base font-bold text-fg truncate">
                {spec.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
