"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { HeroSlideForm } from "../../_components/HeroSlideForm";
import { Heading, Text } from "@/components/ui/typography";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { mockHeroSlides } from "@/dev/mocks/heroSlides.mock";

export default function EditHeroSlidePage() {
  const router = useRouter();
  const params = useParams();
  const slideId = params.id as string;

  // Find the slide from mock data
  const slide = useMemo(() => {
    return mockHeroSlides.find((s) => s.id === slideId);
  }, [slideId]);

  if (!slide) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <Heading level="h3">Loading Slide...</Heading>
        <Text className="text-neutral-500">Retrieving slide data for {slideId}</Text>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/hero-slides"
          className="flex items-center text-sm text-neutral-500 hover:text-primary transition-colors w-fit group"
        >
          <div className="mr-2 p-1 rounded-full group-hover:bg-primary/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
          Back to Hero Slides
        </Link>
        <div>
          <Heading level="h2">Edit Hero Slide</Heading>
          <Text className="text-neutral-500 max-w-2xl">
            Update your promotional banner content and styling. Changes will be reflected in the preview in real-time.
          </Text>
        </div>
      </div>

      <HeroSlideForm
        slide={slide}
        onSuccess={() => router.push("/admin/hero-slides")}
        onCancel={() => router.push("/admin/hero-slides")}
      />
    </div>
  );
}
