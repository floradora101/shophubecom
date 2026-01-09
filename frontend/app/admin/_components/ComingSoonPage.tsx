import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Text } from "@/components/ui/typography";
import { LucideIcon } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  featureDescription?: string;
}

export function ComingSoonPage({
  title,
  description,
  icon: Icon,
  featureDescription,
}: ComingSoonPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <Card padding="lg">
        <div className="text-center py-12">
          <Icon className="h-16 w-16 text-warm-gray-400 mx-auto mb-6" />
          <Text className="text-xl font-medium text-warm-gray-900 mb-3">
            Coming Soon
          </Text>
          <Text className="text-warm-gray-600 mb-6 max-w-md mx-auto">
            {featureDescription ||
              "This feature is currently under development and will be available in a future update."}
          </Text>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">In Development</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
