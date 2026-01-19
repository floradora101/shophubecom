/**
 * useHeroSlideTabs Hook
 *
 * Generates form tab configuration based on form values.
 *
 * Responsibilities:
 * - Tab configuration
 * - Conditional tab rendering based on slide type
 */

"use client";

import React, { useMemo } from "react";
import { Type, ImageIcon, Sparkles, Settings2 } from "lucide-react";
import type { TabItem } from "@/components/ui/tabs";
import type { UseFormReturn } from "react-hook-form";
import type { HeroSlideFormValues } from "@/lib/hero-slides/admin/form";
import { ContentTab } from "../tabs/ContentTab";
import { MediaTab } from "../tabs/MediaTab";
import { StylingTab } from "../tabs/StylingTab";
import { SettingsTab } from "../tabs/SettingsTab";

interface UseHeroSlideTabsProps {
  form: UseFormReturn<HeroSlideFormValues>;
  formValues: HeroSlideFormValues;
}

/**
 * Hook for generating hero slide form tabs
 */
export function useHeroSlideTabs({
  form,
  formValues,
}: UseHeroSlideTabsProps): TabItem[] {
  const tabs = useMemo(() => {
    const tabItems: TabItem[] = [
      {
        id: "content",
        label: "Content",
        icon: <Type className="w-4 h-4" />,
        content: <ContentTab form={form} />,
      },
    ];

    // Media Tab - conditionally shown based on slide type
    if (
      formValues.type !== "CATEGORY_SPOTLIGHT" &&
      formValues.type !== "EDITORS_PICK" &&
      formValues.type !== "PRODUCT_SPOTLIGHT" &&
      formValues.type !== "COMPARISON_BATTLE"
    ) {
      tabItems.push({
        id: "media",
        label: "Media",
        icon: <ImageIcon className="w-4 h-4" />,
        content: <MediaTab form={form} />,
      });
    }

    // Styling Tab - only for LANDSCAPE_IMAGE type
    if (formValues.type === "LANDSCAPE_IMAGE") {
      tabItems.push({
        id: "style",
        label: "Style",
        icon: <Sparkles className="w-4 h-4" />,
        content: <StylingTab form={form} />,
      });
    }

    // Settings Tab - always shown
    tabItems.push({
      id: "settings",
      label: "Settings",
      icon: <Settings2 className="w-4 h-4" />,
      content: <SettingsTab form={form} />,
    });

    return tabItems;
  }, [form, formValues.type]);

  return tabs;
}
