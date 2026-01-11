"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { HeroSlideForm } from "../_components/HeroSlideForm";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewHeroSlidePage() {
  const router = useRouter();

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
          <Heading level="h2">Create New Hero Slide</Heading>
          <Text className="text-neutral-500 max-w-2xl">
            Design a new promotional banner for your homepage. Choose from various styles including the high-impact Landscape Image.
          </Text>
        </div>
      </div>

      <HeroSlideForm
        onSuccess={() => router.push("/admin/hero-slides")}
        onCancel={() => router.push("/admin/hero-slides")}
      />
    </div>
  );
}
