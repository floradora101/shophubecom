/**
 * StylingTab Component
 *
 * Displays form fields for landscape slide theme selection.
 */

"use client";

import { Controller } from "react-hook-form";
import { FormSection } from "@/components/ui/form-section";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { HeroSlideFormValues } from "@/lib/hero-slides/admin/form";
import { Sparkles } from "lucide-react";

interface StylingTabProps {
  form: UseFormReturn<HeroSlideFormValues>;
}

export function StylingTab({ form }: StylingTabProps) {
  const { control } = form;

  return (
    <div className="space-y-6">
      <FormSection
        title="Landscape Theme"
        description="Choose a professional theme package for this slide."
      >
        <FormField label="Theme Selection">
          <Controller
            name="landscapeTheme"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="glass-red">
                    Glass Red (Glassmorphism & Red Accents)
                  </SelectItem>
                  <SelectItem value="minimal-white">
                    Minimal White (Clean & Elegant)
                  </SelectItem>
                  <SelectItem value="bold-dark">
                    Bold Dark (High Contrast & Professional)
                  </SelectItem>
                  <SelectItem value="centered-glass">
                    Centered Glass (Wide Impact & Focused)
                  </SelectItem>
                  <SelectItem value="right-industrial">
                    Right Industrial (Mono Spaced & Technical)
                  </SelectItem>
                  <SelectItem value="clean-modern">
                    Clean Modern (Ultra-high Quality & Minimal)
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </FormSection>
    </div>
  );
}
