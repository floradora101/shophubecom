"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminLoadingState } from "@/app/admin/_components/AdminLoadingState";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { AnnouncementForm } from "../../_components/AnnouncementForm";
import { useAnnouncementQuery } from "@/features/announcements/queries";

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: announcement, isLoading, error } = useAnnouncementQuery(id);

  if (isLoading) {
    return <AdminLoadingState message="Loading announcement..." />;
  }

  if (error || !announcement) {
    return (
      <div className="py-20 text-center">
        <Text className="text-warm-gray-500">Announcement not found</Text>
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/announcements")}
          className="mt-4"
        >
          Back to Announcements
        </Button>
      </div>
    );
  }

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
          <Heading level="h2">Edit Announcement</Heading>
          <Text className="text-warm-gray-500">
            Modify the announcement details.
          </Text>
        </div>
      </div>

      <Card className="p-8 shadow-sm border-warm-gray-200 bg-white">
        <AnnouncementForm
          announcement={announcement}
          onSuccess={() => router.push("/admin/announcements")}
          onCancel={() => router.back()}
        />
      </Card>
    </div>
  );
}
