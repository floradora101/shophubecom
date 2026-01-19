/**
 * SettingsTab Component
 *
 * Displays form fields for slide visibility, scheduling, and settings.
 */

"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSection } from "@/components/ui/form-section";
import { FormField } from "@/components/ui/form-field";
import { Stack } from "@/components/ui/stack";
import type { UseFormReturn } from "react-hook-form";
import type { HeroSlideFormValues } from "@/lib/hero-slides/admin/form";

interface SettingsTabProps {
  form: UseFormReturn<HeroSlideFormValues>;
}

export function SettingsTab({ form }: SettingsTabProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <FormSection
        title="Visibility & Schedule"
        description="Control when this slide is visible to users."
      >
        <Stack spacing="lg">
          <div className="flex items-center space-x-2 p-4 rounded-lg border border-neutral-200 bg-neutral-50/50">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isActive"
                  checked={field.value}
                  onChange={field.onChange}
                  className="w-5 h-5"
                />
              )}
            />
            <label
              htmlFor="isActive"
              className="text-sm font-semibold cursor-pointer"
            >
              Slide is Active
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date (Optional)"
              type="datetime-local"
              {...register("startsAt")}
              error={!!errors.startsAt}
            />
            <Input
              label="End Date (Optional)"
              type="datetime-local"
              {...register("endsAt")}
              error={!!errors.endsAt}
            />
          </div>
        </Stack>
      </FormSection>
    </div>
  );
}
