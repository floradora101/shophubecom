import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  hiddenOnLarge?: boolean; // Hide this tab on xl+ screens (>= 1280px)
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
 * Syncs with defaultTab when it changes (e.g. URL-driven tab on profile page).
 */
export function Tabs({
  tabs,
  defaultTab,
  onTabChange,
  className,
  variant = "default",
  size = "md",
}: TabsProps) {
  const resolvedInitial = defaultTab && tabs.some((t) => t.id === defaultTab)
    ? defaultTab
    : tabs[0]?.id || "";
  const [activeTab, setActiveTab] = useState(resolvedInitial);

  // Keep active tab in sync with URL/defaultTab (e.g. profile?tab=orders)
  useEffect(() => {
    const next = defaultTab && tabs.some((t) => t.id === defaultTab)
      ? defaultTab
      : tabs[0]?.id || "";
    if (next) {
      setActiveTab((current) => (current === next ? current : next));
    }
  }, [defaultTab, tabs]);

  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      onTabChange?.(tabId);
    },
    [onTabChange]
  );

  const sizeClasses = {
    sm: "h-8 px-2.5 text-[11px] sm:h-9 sm:px-3 sm:text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base",
  };

  const tabButtonClasses = cn(
    "relative font-medium transition-all duration-300 ease-out rounded-lg shrink-0",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    sizeClasses[size]
  );

  const getVariantClasses = (isActive: boolean) => {
    switch (variant) {
      case "pill":
        return cn(
          "transition-all duration-500",
          isActive
            ? "text-primary-600"
            : "text-muted-fg hover:text-fg hover:bg-surface-muted/30"
        );

      case "underline":
        return cn(
          "rounded-none border-b-2 bg-transparent",
          "hover:bg-surface-muted/50",
          "transition-all duration-300",
          isActive
            ? "border-primary-500 text-primary-600"
            : "border-transparent text-muted-fg hover:text-fg hover:border-border"
        );

      default:
        return cn(
          "transition-all duration-500",
          isActive
            ? "text-primary-600"
            : "text-muted-fg hover:text-fg hover:bg-surface-muted/30"
        );
    }
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const activeContent = activeTabData?.content;
  const isActiveTabHidden = activeTabData?.hiddenOnLarge || false;

  return (
    <div className={cn("w-full", className)}>
      {/* Tab Navigation */}
      <div className="relative mb-6 sm:mb-8 lg:mb-12">
        {/* Tab buttons container */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  tabButtonClasses,
                  getVariantClasses(isActive),
                  tab.hiddenOnLarge && "xl:hidden"
                )}
                disabled={false}
              >
                {/* Tab content */}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  {tab.icon && (
                    <span
                      className={cn(
                        "transition-all duration-500",
                        isActive ? "scale-110 text-primary-600" : "text-muted-fg group-hover:text-fg"
                      )}
                    >
                      {tab.icon}
                    </span>
                  )}
                  <span className={cn(
                    "truncate transition-colors duration-300",
                    isActive ? "font-bold" : "font-medium"
                  )}>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md",
                        "transition-all duration-300",
                        isActive
                          ? "bg-primary-600 text-white shadow-sm"
                          : "bg-surface-muted text-muted-fg"
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>

                {/* Active indicator bar */}
                <div className={cn(
                  "absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-primary-600 transition-all duration-500",
                  isActive ? "w-1/2 opacity-100" : "w-0 opacity-0"
                )} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {/* Content fade animation */}
        <div
          key={activeTab}
          className={cn(
            "animate-in fade-in-0 slide-in-from-bottom-2 duration-500",
            isActiveTabHidden && "xl:hidden"
          )}
        >
          {activeContent}
        </div>
      </div>
    </div>
  );
}
