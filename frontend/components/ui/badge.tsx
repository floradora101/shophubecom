// Badge component for tags, categories, and status indicators
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-lg px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 border",
  {
    variants: {
      variant: {
        default:
          "bg-surface-muted text-fg border-warm-gray-200 shadow-sm hover:bg-surface",
        primary: "bg-red-600 text-white border-white/20 shadow-lg",
        secondary:
          "bg-surface-muted text-muted-fg border-gray-200 hover:bg-surface",
        success: "bg-green-50 text-green-600 border-green-100/50",
        destructive:
          "bg-gray-900 text-white border-white/10 shadow-2xl hover:bg-black",
        outline:
          "bg-transparent text-fg border-warm-gray-300 hover:bg-warm-gray-50",
        glass:
          "bg-white/10 backdrop-blur-md border-white/10 text-white shadow-xl",
      },
      size: {
        sm: "px-2 py-0.5 text-[9px] tracking-[0.15em]",
        default: "px-3 py-1",
        lg: "px-4 py-1.5 text-xs tracking-[0.25em]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
