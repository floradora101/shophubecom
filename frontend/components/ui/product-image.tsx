// ProductImage component for consistent product image display
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface ProductImageProps
  extends Omit<React.ComponentProps<typeof Image>, "src" | "alt"> {
  src: string;
  alt: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "auto";
  priority?: boolean;
  quality?: number;
}

const ProductImage = forwardRef<HTMLImageElement, ProductImageProps>(
  (
    {
      src,
      alt,
      aspectRatio = "square",
      priority = false,
      quality = 85,
      className,
      ...props
    },
    ref
  ) => {
    const aspectClasses = {
      square: "aspect-square",
      portrait: "aspect-[3/4]",
      landscape: "aspect-[4/3]",
      auto: "",
    };

    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-neutral-100",
          aspectClasses[aspectRatio],
          className
        )}
      >
        <Image
          ref={ref}
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          priority={priority}
          quality={quality}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          {...props}
        />
      </div>
    );
  }
);

ProductImage.displayName = "ProductImage";

export { ProductImage };
