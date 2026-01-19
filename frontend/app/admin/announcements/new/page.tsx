"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { AnnouncementForm } from "../_components/AnnouncementForm";

export default function NewAnnouncementPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="rounded-full h-10 w-10 p-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <Heading level="h2">New Announcement</Heading>
          <Text className="text-warm-gray-500">
            Create a new announcement for the top bar.
          </Text>
        </div>
      </div>

      <Card className="p-8 shadow-sm border-warm-gray-200 bg-white">
        <AnnouncementForm
          onSuccess={() => router.push("/admin/announcements")}
          onCancel={() => router.back()}
        />
      </Card>
    </div>
  );
}
