import { ReactNode } from "react";
import { LucideIcon, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const baseClasses = "leading-tight font-display";

  if (variant === "hero") {
    return (
      <h1
        className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-warm-gray-900 tracking-tight ${className}`}
      >
        {italic}{" "}
        <span className="italic font-normal text-primary-600">{bold}</span>
      </h1>
    );
  }

  if (variant === "large") {
    return (
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-warm-gray-900 tracking-tight ${className}`}
      >
        {italic}{" "}
        <span className="italic font-normal text-primary-600">{bold}</span>
      </h2>
    );
  }

  // Standard variant (default) - Matches All Products Page styling
  return (
    <h2
      className={`text-3xl sm:text-4xl font-display font-bold text-warm-gray-900 tracking-tight ${className}`}
    >
      {italic}{" "}
      <span className="italic font-normal text-primary-600">{bold}</span>
    </h2>
  );
}

export function SectionHeader({
  badge,
  title,
  description,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="text-center md:text-left space-y-4 flex-1">
        {badge && (
          <Badge
            variant="primary"
            size="default"
            className="mb-2 animate-in fade-in slide-in-from-left-4 duration-700"
          >
            <badge.icon className="h-3 w-3" />
            <span>{badge.text}</span>
          </Badge>
        )}
        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          <SectionTitle italic={title.italic} bold={title.bold} />
        </div>
        {description && (
          <p className="text-warm-gray-600 max-w-2xl text-sm md:text-lg font-body font-light leading-relaxed animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
          {actions}
        </div>
      )}
    </div>
  );
}
