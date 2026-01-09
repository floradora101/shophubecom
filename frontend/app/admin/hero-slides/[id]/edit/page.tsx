"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { HeroSlideForm } from "../../../_components/HeroSlideForm";
import { getHeroSlide, updateHeroSlide } from "../../../_lib/admin-data";
import {
  HeroSlideFormSchema,
  type HeroSlideFormValues,
  toFormValues,
} from "@/lib/hero-slides/admin/form";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditHeroSlidePage() {
  const router = useRouter();
  const params = useParams();
  const slideId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<HeroSlideFormValues>({
    resolver: zodResolver(HeroSlideFormSchema),
  });

  // Load slide data
  useEffect(() => {
    const loadSlide = () => {
      const slide = getHeroSlide(slideId);
      if (!slide) {
        router.push("/admin/hero-slides");
        return;
      }

      const formValues = toFormValues(slide);
      form.reset(formValues);
      setIsLoading(false);
    };

    loadSlide();
  }, [slideId, router, form]);

  const onSubmit = async (data: HeroSlideFormValues) => {
    try {
      setIsSubmitting(true);
      const updated = updateHeroSlide(slideId, data);
      if (updated) {
        router.push("/admin/hero-slides");
      }
    } catch (error) {
      console.error("Failed to update hero slide:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-8 w-48" />
        <Card padding="lg">
          <div className="space-y-6">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-24 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Hero Slide"
        description="Update hero slide content and settings"
        actions={
          <Link href="/admin/hero-slides">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Slides
            </Button>
          </Link>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <HeroSlideForm form={form} />

        <Card padding="lg" className="mt-6">
          <div className="flex justify-end gap-3">
            <Link href="/admin/hero-slides">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
