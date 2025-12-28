import { Background } from "@/components/ui/background";

interface BackgroundGradientsProps {
  variant?: "default" | "decorative" | "minimal";
  className?: string;
}

export function BackgroundGradients({
  variant = "default",
  className = "",
}: BackgroundGradientsProps) {
  if (variant === "minimal") {
    return null;
  }

  if (variant === "decorative") {
    return (
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      >
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gray-200 rounded-full blur-3xl opacity-20"></div>
      </div>
    );
  }

  // Default variant - use centralized Background component
  return <Background className={className} />;
}
