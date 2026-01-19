import { DotIndicator } from "@/components/ui/dot-indicator";

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
  return (
    <DotIndicator
      count={count}
      activeIndex={activeIndex}
      onSelect={onSelect}
      shape="circle"
      size="md"
      disabled={disabled}
    />
  );
}
