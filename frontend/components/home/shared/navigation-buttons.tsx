import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationButtonsProps {
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
  className?: string;
}

export function NavigationButtons({
  onPrev,
  onNext,
  disabled = false,
  className = "",
}: NavigationButtonsProps) {
  if (disabled) return null;

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={onPrev}
        className="p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5 text-primary-600" />
      </button>
      <button
        onClick={onNext}
        className="p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5 text-primary-600" />
      </button>
    </div>
  );
}


