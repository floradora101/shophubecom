"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Save,
  LayoutGrid,
  Check,
  Info,
  Layers,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Heading, Text } from "@/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { getAllCategories } from "@/lib/mock-data/mock-data";
import { MockDepartment } from "@/lib/mock-data/departments";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

interface DepartmentFormProps {
  initialData?: MockDepartment | null;
}

export function DepartmentForm({ initialData }: DepartmentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    parentCategoryId: initialData?.parentCategoryId || "",
    highlightedSubCategoryIds: initialData?.highlightedSubCategoryIds || [] as string[],
    isActive: initialData?.isActive ?? true,
  });

  const categories = getAllCategories();
  const parentCategories = categories.filter(c => !c.parentId);

  const subCategories = useMemo(() => {
    if (!formData.parentCategoryId) return [];
    return categories.filter(c => c.parentId === formData.parentCategoryId);
  }, [categories, formData.parentCategoryId]);

  const toggleSubCategory = (id: string) => {
    setFormData(prev => {
      const isHighlighted = prev.highlightedSubCategoryIds.includes(id);
      if (isHighlighted) {
        return {
          ...prev,
          highlightedSubCategoryIds: prev.highlightedSubCategoryIds.filter(item => item !== id)
        };
      } else {
        return {
          ...prev,
          highlightedSubCategoryIds: [...prev.highlightedSubCategoryIds, id]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.parentCategoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success(initialData ? "Department updated" : "Department created");
    router.push("/admin/subcategories");
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="rounded-full hover:bg-warm-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <Heading level="h2">
              {initialData ? "Edit Department" : "New Department"}
            </Heading>
            <Text className="text-warm-gray-500">
              Configure how sub-categories are showcased on the home page.
            </Text>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>{initialData ? "Update Department" : "Create Department"}</span>
            </div>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Basic Info */}
          <Card className="p-6 border-warm-gray-200 shadow-sm space-y-6 bg-white">
            <div className="flex items-center gap-2 border-b border-warm-gray-100 pb-4 mb-4">
              <LayoutGrid className="w-5 h-5 text-primary-600" />
              <Heading level="h4">Basic Information</Heading>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="name"
                  label="Department Name"
                  placeholder="e.g. Laptops Series, Mobile Hub"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-lg border-warm-gray-200 focus:ring-primary-500"
                  required
                />
                <Text className="text-[11px] text-warm-gray-400">
                  This name is used for internal reference and section headings.
                </Text>
              </div>

              <div className="space-y-2">
                <Text className="text-sm font-bold text-warm-gray-700 mb-1.5 block">Parent Category</Text>
                <Select
                  value={formData.parentCategoryId}
                  onValueChange={value => setFormData({ ...formData, parentCategoryId: value, highlightedSubCategoryIds: [] })}
                >
                  <SelectTrigger className="rounded-lg border-warm-gray-200">
                    <SelectValue placeholder="Select a parent category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-warm-gray-100 shadow-2xl">
                    {parentCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-lg">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Text className="text-[11px] text-warm-gray-400">
                  The primary category that this department focuses on.
                </Text>
              </div>
            </div>
          </Card>

          {/* Subcategory Selection */}
          <Card className="p-6 border-warm-gray-200 shadow-sm space-y-6 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-warm-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-600" />
                <Heading level="h4">Highlight Sub-categories</Heading>
              </div>
              <Badge variant="secondary" className="bg-primary-50 text-primary-700 font-bold">
                {formData.highlightedSubCategoryIds.length} Selected
              </Badge>
            </div>

            {!formData.parentCategoryId ? (
              <div className="py-12 text-center bg-warm-gray-50/50 rounded-xl border border-dashed border-warm-gray-200">
                <Info className="w-8 h-8 text-warm-gray-300 mx-auto mb-2" />
                <Text className="text-warm-gray-500 font-medium">Please select a parent category first</Text>
              </div>
            ) : subCategories.length === 0 ? (
              <div className="py-12 text-center bg-warm-gray-50/50 rounded-xl border border-dashed border-warm-gray-200">
                <Info className="w-8 h-8 text-warm-gray-300 mx-auto mb-2" />
                <Text className="text-warm-gray-500 font-medium">No sub-categories found for this category</Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subCategories.map(sub => {
                  const isActive = formData.highlightedSubCategoryIds.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleSubCategory(sub.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group",
                        isActive
                          ? "border-primary-600 bg-primary-50/50"
                          : "border-warm-gray-100 bg-white hover:border-warm-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                          isActive ? "bg-primary-600 border-primary-600" : "border-warm-gray-300 group-hover:border-warm-gray-400"
                        )}>
                          {isActive && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <div>
                          <Text className={cn("text-sm font-bold", isActive ? "text-primary-900" : "text-warm-gray-700")}>
                            {sub.name}
                          </Text>
                          <Text className="text-[10px] text-warm-gray-400">{sub.productCount} Products</Text>
                        </div>
                      </div>
                      {isActive && <CheckCircle2 className="w-5 h-5 text-primary-600" />}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="bg-primary-50/30 p-4 rounded-xl border border-primary-100">
               <div className="flex gap-3">
                  <Info className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <Text className="text-xs text-primary-800 leading-relaxed">
                    Selected sub-categories will be displayed as tabs or grid sections on the home page department showcase.
                    They will appear in the order they are selected.
                  </Text>
               </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Status & Settings */}
          <Card className="p-6 border-warm-gray-200 shadow-sm space-y-6 bg-white">
            <Heading level="h4" className="border-b border-warm-gray-100 pb-4">Settings</Heading>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-warm-gray-50 rounded-xl border border-warm-gray-100">
                <div className="space-y-0.5">
                  <Text className="text-sm font-bold text-warm-gray-800 block">Active Status</Text>
                  <Text className="text-[10px] text-warm-gray-400">Enable/disable this department</Text>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={checked => setFormData({ ...formData, isActive: checked })}
                  className="data-[state=checked]:bg-primary-600"
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <Text className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  Only active subcategories will be visible on the public store front.
                  Inactive subcategories are hidden but preserved in the dashboard.
                </Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
