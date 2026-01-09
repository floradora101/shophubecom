import { Card } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats } from "./_lib/admin-data";
import {
  Package,
  FolderOpen,
  Image,
  ShoppingCart,
  Tag,
  AlertTriangle,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  return (
    <Card padding="md" className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <Text variant="meta" className="text-warm-gray-600 mb-1">
            {title}
          </Text>
          <Heading
            level={3}
            className="text-2xl font-bold text-warm-gray-900 mb-1"
          >
            {value}
          </Heading>
          {description && (
            <Text variant="meta" className="text-warm-gray-500">
              {description}
            </Text>
          )}
        </div>
        <div className="p-3 bg-primary-50 rounded-lg">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const stats = getDashboardStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your store's performance and management"
      />

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          description="All products in catalog"
        />
        <StatCard
          title="Active Products"
          value={stats.activeProducts}
          icon={Package}
          description="Currently visible to customers"
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          icon={FolderOpen}
          description="Product categories"
        />
        <StatCard
          title="On Sale"
          value={stats.onSaleProducts}
          icon={Tag}
          description="Products with active discounts"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockVariants}
          icon={AlertTriangle}
          description="Variants with stock < 10"
        />
        <StatCard
          title="Hero Slides"
          value={stats.heroSlides}
          icon={Image}
          description="Active homepage slides"
        />
      </div>

      {/* Placeholder for Orders - Coming Soon */}
      <Card padding="lg">
        <div className="text-center py-8">
          <ShoppingCart className="h-12 w-12 text-warm-gray-400 mx-auto mb-4" />
          <Heading level={4} className="mb-2">
            Orders Management
          </Heading>
          <Text className="text-warm-gray-600 mb-4">
            Order management features are coming next. You'll be able to view,
            process, and manage customer orders here.
          </Text>
          <div className="text-sm text-warm-gray-500">
            Coming soon in the next update
          </div>
        </div>
      </Card>
    </div>
  );
}
