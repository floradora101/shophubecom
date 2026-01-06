import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { ui } from "@/lib/ui-tokens";

interface SectionHeaderProps {
  badge?: {
    icon: LucideIcon;
    text: string;
    gradient?: string;
  };
  title: {
    italic: string;
    bold: string;
  };
  description?: string;
  actions?: ReactNode;
}

/**
 * SectionTitle component for consistent title styling across all home sections
 */
interface SectionTitleProps {
  variant?: "standard" | "hero" | "large";
  italic: string;
  bold: string;
  className?: string;
}

export function SectionTitle({
  variant = "standard",
  italic,
  bold,
  className = "",
}: SectionTitleProps) {
  const baseClasses = "leading-tight font-[var(--font-inter)]";

  if (variant === "hero") {
    return (
      <h1
        className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl ${baseClasses} line-clamp-2 ${className} group`}
      >
        <span className="block bg-linear-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent font-black tracking-tight relative">
          {italic}
          {/* Always visible partial underline + animated extension for hero italic part */}
          <span className="absolute -bottom-1 left-0 w-[20%] h-1 bg-gray-700/50 rounded-full"></span>
          <span className="absolute -bottom-1 left-0 w-[20%] h-1 bg-linear-to-r from-gray-700 via-gray-800 to-gray-900 rounded-full group-hover:w-full transition-all duration-800 ease-out"></span>
        </span>
        <span className="block bg-red-600 bg-clip-text text-transparent font-black tracking-tight relative">
          {bold}
          {/* Always visible partial underline + animated extension for hero bold part */}
          <span className="absolute -bottom-1 left-0 w-[25%] h-1 bg-red-600/60 rounded-full"></span>
          <span className="absolute -bottom-1 left-0 w-[25%] h-1 bg-linear-to-r from-red-600 via-red-700 to-red-800 rounded-full group-hover:w-full transition-all duration-800 ease-out delay-150"></span>
          {/* Enhanced glow effect for hero with red */}
          <span className="absolute -bottom-1 left-0 w-[25%] h-1.5 bg-linear-to-r from-red-600/50 via-red-700/70 to-red-800/50 rounded-full blur-[1px] group-hover:w-full transition-all duration-800 ease-out delay-150"></span>
        </span>
      </h1>
    );
  }

  if (variant === "large") {
    return (
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl ${baseClasses} ${className} group`}
      >
        <span className="block bg-linear-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent font-black tracking-tight relative">
          {italic}
          {/* Always visible partial underline + animated extension for large italic part */}
          <span className="absolute -bottom-2 left-0 w-[20%] h-1.5 bg-gray-600/50 rounded-full"></span>
          <span className="absolute -bottom-2 left-0 w-[20%] h-1.5 bg-linear-to-r from-gray-600 via-gray-700 to-gray-800 rounded-full group-hover:w-full transition-all duration-900 ease-out"></span>
        </span>
        <span className="block bg-red-600 bg-clip-text text-transparent font-black tracking-tight relative">
          {bold}
          {/* Always visible partial underline + animated extension for large bold part */}
          <span className="absolute -bottom-2 left-0 w-[25%] h-1.5 bg-red-600/60 rounded-full"></span>
          <span className="absolute -bottom-2 left-0 w-[25%] h-1.5 bg-linear-to-r from-red-600 via-red-700 to-red-800 rounded-full group-hover:w-full transition-all duration-900 ease-out delay-200"></span>
          {/* Enhanced glow effect for large variant with red */}
          <span className="absolute -bottom-2 left-0 w-[25%] h-2 bg-linear-to-r from-red-500/60 via-red-600/80 to-red-700/60 rounded-full blur-[1.5px] group-hover:w-full transition-all duration-900 ease-out delay-200"></span>
        </span>
      </h2>
    );
  }

  // Standard variant (default) - Enhanced with proper typography scale and animated red underlines
  return (
    <h2
      className={`text-3xl md:text-4xl lg:text-5xl text-slate-900 ${baseClasses} ${className} group`}
    >
      <span className="font-(--font-dm-sans) font-bold italic relative">
        {italic}
        {/* Always visible partial underline + animated extension for italic part */}
        <span className="absolute -bottom-1 left-0 w-[25%] h-0.5 bg-red-600/60 rounded-full"></span>
        <span className="absolute -bottom-1 left-0 w-[25%] h-0.5 bg-linear-to-r from-red-500 via-red-600 to-red-700 rounded-full group-hover:w-full transition-all duration-700 ease-out"></span>
      </span>
      <span
        className={`font-(--font-inter) font-bold text-red-600 ${ui.typography.splitHeading} relative`}
      >
        {bold}
        {/* Always visible partial underline + animated extension for bold part */}
        <span className="absolute -bottom-1 left-0 w-[30%] h-0.5 bg-red-600/70 rounded-full"></span>
        <span className="absolute -bottom-1 left-0 w-[30%] h-0.5 bg-linear-to-r from-red-600 via-red-700 to-red-800 rounded-full group-hover:w-full transition-all duration-700 ease-out delay-100"></span>
        {/* Enhanced glow effect with red on hover */}
        <span className="absolute -bottom-1 left-0 w-[30%] h-1 bg-linear-to-r from-red-600/40 via-red-700/60 to-red-800/40 rounded-full blur-[0.5px] group-hover:w-full transition-all duration-700 ease-out delay-100"></span>
      </span>
    </h2>
  );
}

export function SectionHeader({
  badge,
  title,
  description,
  actions,
}: SectionHeaderProps) {
  const badgeGradient =
    badge?.gradient || "from-primary-100 via-primary-100 to-primary-200";

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="text-center md:text-left space-y-4 flex-1">
        {badge && (
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r ${badgeGradient} mb-2`}
          >
            <badge.icon className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-600 font-(--font-inter)">
              {badge.text}
            </span>
          </div>
        )}
        <SectionTitle italic={title.italic} bold={title.bold} />
        {description && (
          <p className="text-warm-gray-600 max-w-2xl text-lg font-(--font-inter) font-light leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
