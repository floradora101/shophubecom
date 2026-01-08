// Professional coupon code input component with excellent UX
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils/cn";
import { Tag, X, Check, Loader2 } from "lucide-react";

interface CouponCodeInputProps {
  value?: string;
  onApply: (code: string) => Promise<void>;
  onRemove: () => void;
  isApplied?: boolean;
  appliedCode?: string;
  discountAmount?: number;
  error?: string;
  isValidating?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CouponCodeInput({
  value = "",
  onApply,
  onRemove,
  isApplied = false,
  appliedCode,
  discountAmount = 0,
  error,
  isValidating = false,
  disabled = false,
  className,
}: CouponCodeInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isExpanded, setIsExpanded] = useState(isApplied || !!error);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-expand when there's an error or applied coupon
  // Note: Using useEffect here is intentional to respond to prop changes
  useEffect(() => {
    if (error || isApplied) {
      setIsExpanded(true);
    }
  }, [error, isApplied]); // eslint-disable-line react-hooks/set-state-in-effect

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current && !isApplied) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded, isApplied]);

  const handleApply = async () => {
    const code = inputValue.trim().toUpperCase();
    if (!code) return;

    try {
      await onApply(code);
      setInputValue(""); // Clear input on success
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    } else if (e.key === "Escape") {
      setIsExpanded(false);
      setInputValue("");
    }
  };

  const handleRemove = () => {
    onRemove();
    setInputValue("");
    setIsExpanded(false);
  };

  if (isApplied && appliedCode) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Applied Coupon Badge */}
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 bg-green-600 rounded-full">
              <Check className="w-3 h-3 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 border-green-200"
              >
                <Tag className="w-3 h-3 mr-1" />
                {appliedCode}
              </Badge>
              {discountAmount > 0 && (
                <Text className="text-sm font-medium text-green-700">
                  -${discountAmount.toFixed(2)}
                </Text>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
            disabled={disabled}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Collapsed State - Show toggle button */}
      {!isExpanded && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsExpanded(true)}
          className="w-full justify-start text-warm-gray-600 hover:text-warm-gray-900 hover:bg-warm-gray-50"
          disabled={disabled}
        >
          <Tag className="w-4 h-4 mr-2" />
          Have a coupon code?
        </Button>
      )}

      {/* Expanded State - Show input form */}
      {isExpanded && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Enter coupon code"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                disabled={disabled || isValidating}
                className={cn(
                  "text-sm uppercase tracking-wide",
                  error &&
                    "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
              />
            </div>
            <Button
              type="button"
              onClick={handleApply}
              disabled={!inputValue.trim() || disabled || isValidating}
              size="sm"
              className="px-4"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <Text variant="meta" className="text-red-600 text-sm">
              {error}
            </Text>
          )}

          {/* Helper Text */}
          <Text variant="meta" className="text-warm-gray-500 text-xs">
            Enter your coupon code above to apply discount
          </Text>
        </div>
      )}
    </div>
  );
}
