"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { HeroSlideForm } from "@/app/admin/hero-slides/_components/HeroSlideForm";
import { Heading, Text } from "@/components/ui/typography";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { AdminLoadingState } from "@/app/admin/_components/AdminLoadingState";
import Link from "next/link";
import { useHeroSlideQuery } from "@/features/hero-slides/queries";
import { extractErrorMessage } from "@/lib/api/error-handler";
import { Button } from "@/components/ui/button";

export default function EditHeroSlidePage() {
  const router = useRouter();
  const params = useParams();
  const slideId = params.id as string;

  const { data: slide, isLoading, error } = useHeroSlideQuery(slideId);

  if (isLoading) {
    return <AdminLoadingState message="Loading slide..." />;
  }

  if (error || !slide) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <Heading level="h3">Slide Not Found</Heading>
        <Text className="text-neutral-500 mb-6">
          {extractErrorMessage(error, "The slide you're looking for doesn't exist.")}
        </Text>
        <Button onClick={() => router.push("/admin/hero-slides")} variant="outline">
          Back to Hero Slides
        </Button>
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

