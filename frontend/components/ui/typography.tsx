// Typography components for consistent text styling.
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const headingVariants = cva("font-bold text-warm-gray-900", {
  variants: {
    level: {
      1: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
      2: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
      3: "text-2xl md:text-3xl font-semibold tracking-tight",
      4: "text-xl md:text-2xl font-semibold",
      5: "text-lg md:text-xl font-semibold",
      6: "text-base md:text-lg font-semibold",
    },
  },
  defaultVariants: {
    level: 1,
  },
});

const textVariants = cva("text-warm-gray-700", {
  variants: {
    size: {
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    size: "base",
    weight: "normal",
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function Heading({ className, level = 1, as, ...props }: HeadingProps) {
  const Component =
    as || (`h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6");
  return (
    <Component
      className={cn(headingVariants({ level }), className)}
      {...props}
    />
  );
}

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div";
}

export function Text({
  className,
  size,
  weight,
  as = "p",
  ...props
}: TextProps) {
  const Component = as;
  return (
    <Component
      className={cn(textVariants({ size, weight }), className)}
      {...props}
    />
  );
}
