import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

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
            <span className="text-sm font-semibold text-primary-700 font-[var(--font-poppins)]">
              {badge.text}
            </span>
          </div>
        )}
        <h2 className="text-3xl md:text-4xl lg:text-5xl text-warm-gray-900 leading-tight">
          <span className="font-[var(--font-playfair)] font-bold italic">
            {title.italic}
          </span>
          <span className="font-[var(--font-poppins)] font-bold text-primary-600 ml-2">
            {title.bold}
          </span>
        </h2>
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
