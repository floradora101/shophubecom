interface SlideIndicatorsProps {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function SlideIndicators({
  count,
  activeIndex,
  onSelect,
  disabled = false,
}: SlideIndicatorsProps) {
  if (disabled || count <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            activeIndex === index
              ? "w-2.5 h-2.5 bg-primary-600"
              : "w-2 h-2 bg-primary-200 hover:bg-primary-400"
          }`}
          aria-label={`Go to slide ${index + 1} of ${count}`}
          aria-current={activeIndex === index ? "true" : "false"}
        />
      ))}
    </div>
  );
}
