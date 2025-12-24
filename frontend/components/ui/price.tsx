// Price component for consistent price display
import { cn } from "@/lib/utils/cn";

interface PriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "sale";
}

function Price({
  amount,
  currency = "$",
  size = "md",
  variant = "default",
  className,
  ...props
}: PriceProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const variantClasses = {
    default: "text-neutral-900 font-medium",
    sale: "text-red-600 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-baseline",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <span className="text-xs mr-0.5">{currency}</span>
      {amount.toFixed(2)}
    </span>
  );
}

interface PriceRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  min: number;
  max: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
}

function PriceRange({
  min,
  max,
  currency = "$",
  size = "md",
  className,
  ...props
}: PriceRangeProps) {
  return (
    <div
      className={cn("inline-flex items-baseline gap-1", className)}
      {...props}
    >
      <Price amount={min} currency={currency} size={size} />
      <span className="text-neutral-400">-</span>
      <Price amount={max} currency={currency} size={size} />
    </div>
  );
}

export { Price, PriceRange };
