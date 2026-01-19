import { ReactNode } from "react";
import { LucideIcon, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ui } from "@/lib/ui-tokens";
import { cn } from "@/lib/utils/cn";

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
  centered?: boolean;
  dark?: boolean;
}

/**
 * SectionTitle component for consistent title styling across all home sections
 */
interface SectionTitleProps {
  variant?: "standard" | "hero" | "large";
  italic: string;
  bold: string;
  className?: string;
  centered?: boolean;
  dark?: boolean;
}

export function SectionTitle({
  variant = "standard",
  italic,
  bold,
  className = "",
  centered = false,
  dark = false,
}: SectionTitleProps) {
  const baseClasses = "leading-tight font-display";
  const textColor = dark ? "text-white" : "text-warm-gray-900";

  if (variant === "hero") {
    return (
      <h1
        className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold ${textColor} tracking-tight ${className}`}
      >
        {italic}{" "}
        <span className="italic font-normal text-primary-600">{bold}</span>
      </h1>
    );
  }

  if (variant === "large") {
    return (
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-display font-bold ${textColor} tracking-tight ${className}`}
      >
        {italic}{" "}
        <span className="italic font-normal text-primary-600">{bold}</span>
      </h2>
    );
  }

  // Standard variant (default) - Matches All Products Page styling
  return (
    <h2
      className={`text-3xl sm:text-4xl font-display font-bold ${textColor} tracking-tight ${className}`}
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
  centered = false,
  dark = false,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered
          ? "items-center text-center"
          : "md:flex-row items-start md:items-center justify-between"
      )}
    >
      <div
        className={cn(
          "space-y-4 flex-1",
          centered ? "text-center" : "text-center md:text-left"
        )}
      >
        {badge && (
          <Badge
            variant="primary"
            size="default"
            className={cn(
              "mb-2 animate-in fade-in slide-in-from-left-4 duration-700",
              centered && "mx-auto"
            )}
          >
            <badge.icon className="h-3 w-3" />
            <span>{badge.text}</span>
          </Badge>
        )}
        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          <SectionTitle italic={title.italic} bold={title.bold} dark={dark} />
        </div>
        {description && (
          <p
            className={cn(
              "max-w-2xl text-sm md:text-lg font-body font-light leading-relaxed animate-in fade-in slide-in-from-left-4 duration-700 delay-200",
              dark ? "text-gray-300" : "text-warm-gray-600",
              centered && "mx-auto"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div
          className={cn(
            "flex gap-2 animate-in fade-in duration-700 delay-300",
            centered ? "justify-center" : "slide-in-from-right-4"
          )}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
