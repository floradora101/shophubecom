// Rating component for product reviews
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

function Rating({
  value,
  max = 5,
  size = "md",
  showValue = false,
  className,
  ...props
}: RatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const stars = Array.from({ length: max }, (_, i) => {
    const starValue = i + 1;
    const isFilled = starValue <= value;
    const isPartial = starValue > value && starValue - 1 < value;

    return (
      <Star
        key={i}
        className={cn(
          sizeClasses[size],
          isFilled
            ? "fill-yellow-400 text-yellow-400"
            : isPartial
            ? "fill-yellow-200 text-yellow-400"
            : "fill-neutral-200 text-neutral-300"
        )}
      />
    );
  });

  return (
    <div className={cn("inline-flex items-center gap-1", className)} {...props}>
      {stars}
      {showValue && (
        <span className="ml-2 text-sm text-neutral-600 font-medium">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export { Rating };
