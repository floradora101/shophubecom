// Typography components for consistent text styling.
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const headingVariants = cva(
  "font-bold text-warm-gray-900 leading-tight tracking-tight",
  {
    variants: {
      level: {
        h1: "text-4xl md:text-5xl lg:text-6xl",
        h2: "text-3xl md:text-4xl lg:text-5xl",
        h3: "text-2xl md:text-3xl font-semibold",
        h4: "text-xl md:text-2xl font-semibold",
        h5: "text-lg md:text-xl font-semibold",
        h6: "text-base md:text-lg font-semibold",
      },
    },
    defaultVariants: {
      level: "h1",
    },
  }
);

const textVariants = cva("text-warm-gray-700 leading-normal", {
  variants: {
    variant: {
      body: "text-base",
      meta: "text-sm text-warm-gray-600",
      caption: "text-xs text-warm-gray-500",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    variant: "body",
    weight: "normal",
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function Heading({
  className,
  level = "h1",
  as,
  ...props
}: HeadingProps) {
  const Component = as || (level as "h1" | "h2" | "h3" | "h4" | "h5" | "h6");
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
  variant,
  weight,
  as = "p",
  ...props
}: TextProps) {
  const Component = as;
  return (
    <Component
      className={cn(textVariants({ variant, weight }), className)}
      {...props}
    />
  );
}
