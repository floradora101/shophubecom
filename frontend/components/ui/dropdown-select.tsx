"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

export function DropdownSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  buttonClassName,
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder || "Select...";

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("gap-2 justify-between", buttonClassName)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{displayLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180 text-primary-600"
          )}
        />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-lg shadow-lg z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "block w-full text-left px-3 py-2 text-sm transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                value === option.value
                  ? "text-primary-600 font-medium bg-primary-50"
                  : "text-muted-fg hover:bg-red-50 hover:scale-105"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
