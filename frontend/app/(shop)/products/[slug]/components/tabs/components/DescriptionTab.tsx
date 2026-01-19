/**
 * DescriptionTab Component
 *
 * Displays product description with feature highlights.
 */

import { FileText, CheckCircle } from "lucide-react";
import type { Product } from "@/features/products/types";

interface DescriptionTabProps {
  product: Product;
}

export function DescriptionTab({ product }: DescriptionTabProps) {
  const description = product.description;

  if (!description) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-fg mx-auto mb-4" />
        <h3 className="text-lg font-medium text-fg mb-2">
          No Description Available
        </h3>
        <p className="text-muted-fg">
          A description for this product is not currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="space-y-10">
        <div className="prose prose-slate prose-sm md:prose-base max-w-none">
          <p className="text-muted-fg leading-relaxed whitespace-pre-line text-sm sm:text-base">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-4 pt-10 border-t border-border/40">
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-fg uppercase tracking-widest">
            <CheckCircle className="h-3.5 w-3.5 text-muted-fg opacity-60" />
            <span>Premium Quality</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-fg uppercase tracking-widest">
            <CheckCircle className="h-3.5 w-3.5 text-muted-fg opacity-60" />
            <span>Expertly Crafted</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-fg uppercase tracking-widest">
            <CheckCircle className="h-3.5 w-3.5 text-muted-fg opacity-60" />
            <span>Modern Design</span>
          </div>
        </div>
      </div>
    </div>
  );
}
