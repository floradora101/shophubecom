"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils/cn";

interface NavigationButtonProps {
  variant?: "primary" | "secondary";
  direction: "left" | "right" | "play" | "pause";
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  size?: "sm" | "default" | "lg";
  "aria-label"?: string;
}

export function NavigationButton({
  variant = "primary",
  direction,
  onClick,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  className,
  size = "default",
  "aria-label": ariaLabel,
}: NavigationButtonProps) {
  const getIcon = () => {
    switch (direction) {
      case "left":
        return <ChevronLeft className="h-4 w-4" />;
      case "right":
        return <ChevronRight className="h-4 w-4" />;
      case "play":
        return <Play className="h-4 w-4" />;
      case "pause":
        return <Pause className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getVariant = () => {
    switch (variant) {
      case "primary":
        return "default";
      case "secondary":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <Button
      variant={getVariant()}
      size={size === "sm" ? "sm" : size === "lg" ? "lg" : "icon"}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "rounded-full shadow-md hover:shadow-lg transition-all duration-200",
        className
      )}
      aria-label={ariaLabel}
    >
      {getIcon()}
    </Button>
  );
}
