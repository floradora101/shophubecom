import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  variant?: "default" | "pill" | "underline";
  size?: "sm" | "md" | "lg";
}

/**
 * Modern Tabs Component - 2026 Design Trends
 * Features glassmorphism effects, smooth animations, and premium styling
 */
export function Tabs({
  tabs,
  defaultTab,
  onTabChange,
  className,
  variant = "default",
  size = "md",
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");

  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      onTabChange?.(tabId);
    },
    [onTabChange]
  );

  const sizeClasses = {
    sm: "h-9 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base",
  };

  const tabButtonClasses = cn(
    "relative font-medium transition-all duration-300 ease-out rounded-lg",
    "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    sizeClasses[size]
  );

  const getVariantClasses = (isActive: boolean, tabId: string) => {
    switch (variant) {
      case "pill":
        return cn(
          "rounded-full border border-border/50 backdrop-blur-sm",
          "hover:bg-surface/80 hover:shadow-sm hover:border-border-hover",
          "transition-all duration-300",
          isActive
            ? "bg-surface/95 shadow-md border-border/40 text-primary-600"
            : "bg-surface-muted/50 text-muted-fg hover:text-fg"
        );

      case "underline":
        return cn(
          "rounded-none border-b-2 bg-transparent",
          "hover:bg-surface-muted/50",
          "transition-all duration-300",
          isActive
            ? "border-primary-500 text-primary-600 bg-primary-50/30"
            : "border-transparent text-muted-fg hover:text-fg hover:border-border"
        );

      default:
        return cn(
          "rounded-lg border border-border/60 backdrop-blur-sm",
          "hover:bg-surface/80 hover:shadow-sm hover:border-border-hover hover:-translate-y-0.5",
          "transition-all duration-300",
          isActive
            ? "bg-surface/95 shadow-md border-primary-200 text-primary-600 shadow-primary-500/10"
            : "bg-surface-muted/50 text-muted-fg hover:text-fg"
        );
    }
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={cn("w-full", className)}>
      {/* Tab Navigation */}
      <div className="relative mb-6 sm:mb-8">
        {/* Tab buttons container */}
        <div className="flex gap-1 sm:gap-2 p-1.5 bg-surface rounded-xl border border-border/40">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  tabButtonClasses,
                  getVariantClasses(isActive, tab.id)
                )}
                disabled={false}
              >
                {/* Tab content */}
                <div className="flex items-center gap-2">
                  {tab.icon && (
                    <span
                      className={cn(
                        "transition-transform duration-300",
                        isActive && "scale-110"
                      )}
                    >
                      {tab.icon}
                    </span>
                  )}
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 text-xs font-medium rounded-full",
                        "transition-all duration-300",
                        isActive
                          ? "bg-primary-100 text-primary-600"
                          : "bg-surface-muted text-muted-fg"
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>

                {/* Active indicator animation */}
                {isActive && (
                  <div className="absolute inset-0 rounded-lg bg-primary-500/5 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Premium accent line */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 rounded-full opacity-60" />
      </div>

      {/* Tab Content */}
      <div className="relative">
        {/* Content fade animation */}
        <div
          key={activeTab}
          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
        >
          {activeContent}
        </div>
      </div>
    </div>
  );
}
