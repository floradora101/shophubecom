import { cn } from "@/lib/utils";

interface BackgroundProps {
  className?: string;
  variant?: "default" | "minimal" | "vibrant" | "subtle";
  intensity?: "low" | "medium" | "high";
}

/**
 * Unified background system using CSS custom properties for easy theming
 * Supports multiple variants and intensities for different contexts
 */
export function Background({
  className = "",
  variant = "default",
  intensity = "medium",
}: BackgroundProps) {
  if (variant === "minimal") {
    return null;
  }

  // Define background styles based on variant and intensity
  const getBackgroundClasses = () => {
    const baseClasses = "fixed inset-0 -z-10";

    switch (variant) {
      case "vibrant":
        return {
          main: cn(
            baseClasses,
            "bg-linear-to-br from-gray-50 via-gray-100 to-gray-200/40"
          ),
          accent1: cn(
            baseClasses,
            "bg-[radial-gradient(circle_at_25%_25%,rgba(156,163,175,0.08),transparent_70%)]"
          ),
          accent2: cn(
            baseClasses,
            "bg-[radial-gradient(circle_at_75%_75%,rgba(156,163,175,0.06),transparent_70%)]"
          ),
        };

      case "subtle":
        return {
          main: cn(
            baseClasses,
            "bg-linear-to-br from-gray-50 via-gray-100 to-gray-200/30"
          ),
          accent1: cn(
            baseClasses,
            "bg-[radial-gradient(circle_at_30%_20%,rgba(107,114,128,0.06),transparent_50%)]"
          ),
          accent2: cn(
            baseClasses,
            "bg-[radial-gradient(circle_at_70%_80%,rgba(107,114,128,0.04),transparent_50%)]"
          ),
        };

      case "default":
      default:
        return {
          main: cn(
            baseClasses,
            "bg-linear-to-br from-gray-100 via-gray-200 to-gray-300/60"
          ),
          accent1: cn(
            baseClasses,
            "bg-[radial-gradient(circle_at_30%_20%,rgba(107,114,128,0.08),transparent_50%)]"
          ),
          accent2: cn(
            baseClasses,
            "bg-[radial-gradient(circle_at_70%_80%,rgba(107,114,128,0.06),transparent_50%)]"
          ),
        };
    }
  };

  const backgrounds = getBackgroundClasses();

  return (
    <>
      {/* Main gradient background */}
      <div className={cn(backgrounds.main, className)} />

      {/* Accent gradients for depth */}
      <div className={backgrounds.accent1} />
      <div className={backgrounds.accent2} />
    </>
  );
}

// Global background provider for app-wide theming
interface BackgroundProviderProps {
  children: React.ReactNode;
  variant?: BackgroundProps["variant"];
  intensity?: BackgroundProps["intensity"];
}

export function BackgroundProvider({
  children,
  variant = "default",
  intensity = "medium",
}: BackgroundProviderProps) {
  return (
    <div className="relative min-h-screen">
      <Background variant={variant} intensity={intensity} />
      {children}
    </div>
  );
}
