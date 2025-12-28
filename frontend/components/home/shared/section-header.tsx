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
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl ${baseClasses} ${className}`}
      >
        <span className="block bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent font-black tracking-tight">
          {italic}
        </span>
        <span className="block bg-primary-600 bg-clip-text text-transparent font-black tracking-tight">
          {bold}
        </span>
      </h1>
    );
  }

  if (variant === "large") {
    return (
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl ${baseClasses} ${className}`}
      >
        <span className="block bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent font-black tracking-tight">
          {italic}
        </span>
        <span className="block bg-primary-600 bg-clip-text text-transparent font-black tracking-tight">
          {bold}
        </span>
      </h2>
    );
  }

  // Standard variant (default) - Enhanced with proper typography scale
  return (
    <h2
      className={`text-3xl md:text-4xl lg:text-5xl text-slate-900 ${baseClasses} ${className}`}
    >
      <span className="font-[var(--font-dm-sans)] font-bold italic">
        {italic}
      </span>
      <span
        className={`font-[var(--font-inter)] font-bold text-primary-600 ${ui.typography.splitHeading}`}
      >
        {bold}
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
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${badgeGradient} mb-2`}
          >
            <badge.icon className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700 font-[var(--font-inter)]">
              {badge.text}
            </span>
          </div>
        )}
        <SectionTitle italic={title.italic} bold={title.bold} />
        {description && (
          <p className="text-warm-gray-600 max-w-2xl text-lg font-[var(--font-inter)] font-light leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
