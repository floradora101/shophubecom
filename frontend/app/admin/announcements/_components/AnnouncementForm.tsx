"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Stack } from "@/components/ui/stack";
import { Text } from "@/components/ui/typography";
import { toast } from "sonner";
import {
  Truck,
  Sparkles,
  Zap,
  Info,
  Bell,
  Tag,
  Gift,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Announcement, AnnouncementIconType, CreateAnnouncementInput } from "@/lib/types/announcements.types";
import { Switch } from "@/components/ui/switch";
import { useCreateAnnouncementMutation, useUpdateAnnouncementMutation } from "@/features/announcements/queries";

interface AnnouncementFormProps {
  announcement?: Announcement;
  onSuccess: () => void;
  onCancel: () => void;
}

const ICONS: { label: string; value: AnnouncementIconType; icon: any }[] = [
  { label: "Shipping", value: "Truck", icon: Truck },
  { label: "Special", value: "Sparkles", icon: Sparkles },
  { label: "Urgent", value: "Zap", icon: Zap },
  { label: "Info", value: "Info", icon: Info },
  { label: "Alert", value: "Bell", icon: Bell },
  { label: "Offer", value: "Tag", icon: Tag },
  { label: "Gift", value: "Gift", icon: Gift },
];

export function AnnouncementForm({
  announcement,
  onSuccess,
  onCancel,
}: AnnouncementFormProps) {
  const createMutation = useCreateAnnouncementMutation();
  const updateMutation = useUpdateAnnouncementMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateAnnouncementInput>({
    defaultValues: {
      text: announcement?.text || "",
      highlight: announcement?.highlight || "",
      icon: announcement?.icon || "Info",
      isActive: announcement?.isActive ?? true,
      priority: announcement?.priority || 0,
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: CreateAnnouncementInput) => {
    if (announcement) {
      updateMutation.mutate(
        { id: announcement.id, data },
        {
          onSuccess: () => {
            onSuccess();
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onSuccess();
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing="xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <Input
              label="Announcement Text *"
              placeholder="e.g. Free delivery on all orders over $50"
              {...register("text", { required: "Text is required" })}
              error={!!errors.text}
            />
            <Text className="text-[10px] text-warm-gray-400 px-1">
              The main message that will be displayed in the bar.
            </Text>
            {errors.text && (
              <Text className="text-xs text-red-500">{errors.text.message}</Text>
            )}
          </div>

          <div className="space-y-2">
            <Input
              label="Highlight Text *"
              placeholder="e.g. Free Delivery"
              {...register("highlight", { required: "Highlight text is required" })}
              error={!!errors.highlight}
            />
            <Text className="text-[10px] text-warm-gray-400 px-1">
              This part of the text will be bolded and highlighted. It must be present in the Announcement Text.
            </Text>
            {errors.highlight && (
              <Text className="text-xs text-red-500">{errors.highlight.message}</Text>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Input
                label="Priority"
                type="number"
                placeholder="0"
                {...register("priority", { valueAsNumber: true })}
                error={!!errors.priority}
              />
              <Text className="text-[10px] text-warm-gray-400 px-1">
                Higher numbers appear first.
              </Text>
            </div>

            <div className="space-y-4 pt-8">
              <div className="flex items-center space-x-2">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <label htmlFor="isActive" className="cursor-pointer font-medium text-sm text-warm-gray-700">
                  Active (Show on website)
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Text className="text-sm font-medium text-warm-gray-700">Select Icon</Text>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <>
                    {ICONS.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = field.value === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => field.onChange(item.value)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 gap-1.5 group",
                            isSelected
                              ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm"
                              : "border-warm-gray-100 bg-white text-warm-gray-400 hover:border-warm-gray-200 hover:bg-warm-gray-50 hover:text-warm-gray-600"
                          )}
                        >
                          <div className={cn(
                            "relative flex items-center justify-center w-8 h-8 rounded-full transition-transform duration-200",
                            isSelected ? "scale-110" : "group-hover:scale-105"
                          )}>
                            <IconComp className="w-5 h-5" />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-primary-600 text-white rounded-full p-0.5 shadow-sm border border-white">
                                <Check className="w-2 h-2" />
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-medium uppercase tracking-tighter">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-warm-gray-100 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg px-6"
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Saving..."
            className="rounded-lg px-8 min-w-[120px] shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700"
          >
            {announcement ? "Update Announcement" : "Create Announcement"}
          </LoadingButton>
        </div>
      </Stack>
    </form>
  );
}
