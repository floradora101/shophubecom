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
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20"></div>
      </div>
    );
  }

  // Default variant - unified smooth gradient background
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-cream-50 to-primary-100/50 opacity-60 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.1),transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.08),transparent_50%)] -z-10" />
    </>
  );
}


