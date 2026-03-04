"use client";

import Link from "next/link";
import { productRoutes } from "@/lib/routes";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/features/products/types";

interface CategoryCardProps {
  category: Category;
  index: number;
}

export function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <Link
      href={productRoutes.category(category.slug)}
      className="group relative flex flex-col h-full bg-white rounded-lg overflow-hidden border border-warm-gray-200 hover:border-primary-300 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10"
      style={{
        animation: `fade-in 0.7s ease-out ${index * 100}ms both, slide-in-from-bottom-4 0.7s ease-out ${index * 100}ms both`,
      }}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={category.image || "/images/placeholder.jpg"}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Category Name Overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <Sparkles className="h-3 w-3" />
            <span>Explore Now</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight leading-tight">
            {category.name}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 lg:p-4 xl:p-4 2xl:p-3 flex flex-col flex-1">
        {category.description && (
          <p className="text-sm lg:text-base xl:text-base 2xl:text-sm text-warm-gray-600 line-clamp-3 mb-3 xl:mb-2 2xl:mb-1">
            {category.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <span className="text-[10px] lg:text-xs xl:text-xs 2xl:text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 lg:px-3 xl:px-3 2xl:px-2 py-1 lg:py-1.5 xl:py-1.5 2xl:py-1 rounded-lg border border-red-100">
            View Collection
          </span>
          <div className="h-8 w-8 lg:h-10 lg:w-10 xl:h-10 2xl:h-9 2xl:w-9 rounded-full bg-warm-gray-100 flex items-center justify-center text-warm-gray-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
