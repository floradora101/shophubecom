"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, FormSection } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { HeroSlideForm } from "../../_components/HeroSlideForm";
import { createHeroSlide } from "../../_lib/admin-data";
import {
  HeroSlideFormSchema,
  type HeroSlideFormValues,
} from "@/lib/hero-slides/admin/form";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewHeroSlidePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HeroSlideFormValues>({
    resolver: zodResolver(HeroSlideFormSchema),
    defaultValues: {
      type: "PRODUCT_SPOTLIGHT",
      priority: 0,
      isActive: true,
      startsAt: "",
      endsAt: "",
      badgeText: "",
      headline: "",
      highlight: "",
      description: "",
      ctaPrimaryLabel: "",
      ctaPrimaryHref: "",
      ctaSecondaryLabel: "",
      ctaSecondaryHref: "",
      mediaKind: "none",
      mediaProductSlug: "",
      mediaImageUrl: "",
      mediaAlt: "",
      mediaPosition: "center",
      mediaAspect: "default",
      themeAccentToken: "red-black",
    },
  });

  const onSubmit = async (data: HeroSlideFormValues) => {
    try {
      setIsSubmitting(true);
      createHeroSlide(data);
      router.push("/admin/hero-slides");
    } catch (error) {
      console.error("Failed to create hero slide:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Hero Slide"
        description="Create a new homepage hero slide"
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
              {isSubmitting ? "Creating..." : "Create Slide"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
