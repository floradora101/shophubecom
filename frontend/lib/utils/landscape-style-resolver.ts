import type {
  LandscapeTextVariant,
  LandscapeBadgeVariant,
} from "@/lib/types/heroSlides.types";

// Landscape overlay styling configurations
const OVERLAY_VARIANTS = {
  solid: {
    defaultOpacity: 0.4,
    className: "bg-black",
  },
  gradient: {
    defaultOpacity: 0.5,
    className: "bg-gradient-to-t from-black/60 via-black/20 to-transparent",
  },
} as const;

// Landscape text styling configurations (without alignment)
const TEXT_VARIANTS = {
  minimal: {
    container: "",
    badge:
      "inline-flex items-center px-4 py-2 text-sm font-bold tracking-wide uppercase mb-4",
    subtitle: "text-lg font-medium text-white mb-3",
    headline:
      "text-4xl md:text-5xl lg:text-6xl font-display font-bold italic text-white leading-tight mb-4",
    highlight:
      "text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-white leading-tight",
    description: "text-xl text-white mt-6 max-w-xl leading-relaxed",
    buttons: "mt-8 flex flex-col sm:flex-row gap-4",
  },
  glass: {
    container:
      "backdrop-blur-sm bg-white/10 rounded-2xl p-8 border border-white/20",
    badge:
      "inline-flex items-center px-4 py-2 text-sm font-bold tracking-wide uppercase mb-4",
    subtitle: "text-lg font-medium text-white mb-3",
    headline:
      "text-4xl md:text-5xl lg:text-6xl font-display font-bold italic text-white leading-tight mb-4",
    highlight:
      "text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-white leading-tight",
    description: "text-xl text-white mt-6 max-w-xl leading-relaxed",
    buttons: "mt-10 flex flex-col sm:flex-row gap-4",
  },
  editorial: {
    container: "",
    badge:
      "inline-flex items-center px-4 py-2 text-sm font-bold tracking-wide uppercase mb-4",
    subtitle: "text-lg font-medium text-white/80 mb-3",
    headline:
      "text-4xl md:text-5xl lg:text-6xl font-display font-bold italic text-white leading-tight mb-4",
    highlight:
      "text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-white/90 leading-tight",
    description: "text-xl text-white/70 mt-6 max-w-xl leading-relaxed",
    buttons: "mt-10 flex flex-row gap-6",
  },
  neon: {
    container: "",
    badge:
      "inline-flex items-center px-4 py-2 text-sm font-bold tracking-wide border-2 uppercase mb-4",
    subtitle: "text-lg font-semibold text-cyan-300 mb-3 drop-shadow-lg",
    headline:
      "text-4xl md:text-5xl lg:text-6xl font-display italic font-bold text-white leading-tight mb-4 drop-shadow-xl",
    highlight:
      "text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-cyan-300 leading-tight drop-shadow-xl",
    description:
      "text-xl text-white mt-6 max-w-xl leading-relaxed drop-shadow-md",
    buttons: "mt-10 flex flex-col sm:flex-row gap-4",
  },
} as const;

// Badge variant configurations
const BADGE_VARIANTS: Record<LandscapeBadgeVariant, string> = {
  solid: "bg-white/20 text-white backdrop-blur-sm",
  outline: "border-white/30 text-white bg-transparent backdrop-blur-sm",
  pill: "bg-white/10 text-white backdrop-blur-sm rounded-full px-6",
};

// Placement configurations - Grid-based positioning for content blocks
const PLACEMENT_CLASSES = {
  left: "justify-self-start ml-[max(0px,6vw)]", // Left third-ish zone
  center: "justify-self-center",
  right: "justify-self-end mr-[max(0px,6vw)]", // Right zone
} as const;

// Text alignment configurations - Internal text alignment within blocks
const TEXT_ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

// Button alignment configurations - Flex justification for button containers
const BUTTON_ALIGN_CLASSES = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const;

// Block element alignment configurations - For descriptions and other block elements
const BLOCK_ALIGN_CLASSES = {
  left: "text-left",
  center: "mx-auto text-center max-w-none", // Override max-w-xl for centering
  right: "ml-auto text-right max-w-none", // Override max-w-xl for right alignment
} as const;

// Max width configurations
const MAX_WIDTH_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
} as const;

// Headline decoration configurations using CSS variables
const HEADLINE_DECORATION_CLASSES = {
  none: "",
  underline:
    "underline decoration-2 underline-offset-4 decoration-[var(--hero-landscape-accent)]",
  gradient:
    "bg-gradient-to-r from-white via-[var(--hero-landscape-accent)] to-white bg-clip-text text-transparent",
  accentBar:
    "relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-1 before:bg-[var(--hero-landscape-accent)] before:rounded-sm",
  outline: "text-white outline-text",
  outlineFill: "text-[var(--hero-landscape-accent)] outline-fill-text",
  glow: "text-white drop-shadow-[0_0_10px_var(--hero-landscape-accent)] drop-shadow-[0_0_20px_var(--hero-landscape-accent)]",
  redAccent: "text-white red-accent-text",
  neon: "text-white drop-shadow-[0_0_5px_var(--hero-landscape-accent)] drop-shadow-[0_0_10px_var(--hero-landscape-accent)] drop-shadow-[0_0_15px_var(--hero-landscape-accent)]",
  redNeonGlow:
    "text-white drop-shadow-[0_0_8px_#ff0000] drop-shadow-[0_0_16px_#ff0000] drop-shadow-[0_0_24px_#ff0000] drop-shadow-[0_0_32px_#ff0000]",
};

// Highlight effect configurations
const HIGHLIGHT_EFFECT_CLASSES = {
  none: "",
  underlineGlow: "landscape-highlight-underline",
};

export interface LandscapeOverlayClasses {
  className: string;
  style?: { opacity?: number };
}

export interface LandscapeTextClasses {
  wrapper: string; // Container positioning and max-width
  container: string; // Internal styling (backdrop, padding, etc.)
  textAlign: string; // Text alignment within container
  badge: string;
  subtitle: string;
  headline: string;
  highlight: string;
  description: string;
  buttons: string;
}

/**
 * Get overlay classes for landscape slides
 */
export function getLandscapeOverlayClasses(overlay?: {
  opacity?: number;
  type?: "solid" | "gradient";
}): LandscapeOverlayClasses {
  const type = overlay?.type || "solid";
  const variant = OVERLAY_VARIANTS[type];

  if (type === "solid") {
    return {
      className: variant.className,
      style: { opacity: overlay?.opacity ?? variant.defaultOpacity },
    };
  }

  // For gradient overlays, use the gradient class directly (opacity is baked in)
  return {
    className: variant.className,
    style: overlay?.opacity ? { opacity: overlay.opacity } : undefined,
  };
}

/**
 * Get text styling classes for landscape slides
 */
export function getLandscapeTextClasses(textStyle?: {
  variant?: LandscapeTextVariant;
  placement?: "left" | "center" | "right";
  textAlign?: "left" | "center" | "right";
  align?: "left" | "center" | "right"; // Backward compatibility
  maxWidth?: "sm" | "md" | "lg";
  headlineDecoration?: keyof typeof HEADLINE_DECORATION_CLASSES;
  highlightEffect?: keyof typeof HIGHLIGHT_EFFECT_CLASSES;
  badgeVariant?: LandscapeBadgeVariant;
}): LandscapeTextClasses {
  const variant = textStyle?.variant || "minimal";

  // Handle placement - backward compatibility with old align field
  const placement = textStyle?.placement || textStyle?.align || "center";

  // For left/right placement, default textAlign to center (zone centering behavior)
  // For center placement, default textAlign to center
  const textAlign =
    textStyle?.textAlign ||
    (placement === "left" || placement === "right" ? "center" : "center");

  const maxWidth = textStyle?.maxWidth;
  const headlineDecoration = textStyle?.headlineDecoration || "none";
  const highlightEffect = textStyle?.highlightEffect || "none";
  const badgeVariant = textStyle?.badgeVariant || "solid";

  const variantClasses = TEXT_VARIANTS[variant];
  const placementClass = PLACEMENT_CLASSES[placement];
  const textAlignClass = TEXT_ALIGN_CLASSES[textAlign];
  const maxWidthClass = maxWidth ? MAX_WIDTH_CLASSES[maxWidth] : "";
  const decorationClass = HEADLINE_DECORATION_CLASSES[headlineDecoration];
  const highlightFxClass = HIGHLIGHT_EFFECT_CLASSES[highlightEffect];
  const badgeClass = BADGE_VARIANTS[badgeVariant];

  // Wrapper: positioning + maxWidth + placement (grid positioning)
  const wrapperClasses = [placementClass, maxWidthClass]
    .filter(Boolean)
    .join(" ");

  // Container: variant styling + text alignment
  const containerClasses = [variantClasses.container, textAlignClass]
    .filter(Boolean)
    .join(" ");

  // Combine headline classes with decoration
  const headlineClasses = [variantClasses.headline, decorationClass]
    .filter(Boolean)
    .join(" ");

  // Combine highlight classes with effect
  const highlightClasses = [variantClasses.highlight, highlightFxClass]
    .filter(Boolean)
    .join(" ");

  return {
    wrapper: wrapperClasses,
    container: containerClasses,
    textAlign: textAlignClass,
    badge: `${variantClasses.badge} ${badgeClass} ${textAlignClass}`,
    subtitle: `${variantClasses.subtitle} ${textAlignClass}`,
    headline: headlineClasses,
    highlight: highlightClasses,
    description: `${variantClasses.description} ${BLOCK_ALIGN_CLASSES[textAlign]}`,
    buttons: `${variantClasses.buttons} ${BUTTON_ALIGN_CLASSES[textAlign]}`,
  };
}
