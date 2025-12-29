// Trust Badges Component - Displays delivery, returns, and duties information
import { Truck, RotateCcw, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TrustBadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string;
}

function TrustBadge({ icon, title, details }: TrustBadgeProps) {
  return (
    <Card
      variant="default"
      padding="sm"
      className="group relative bg-white/95 backdrop-blur-xl shadow-xl border border-white/30 hover:shadow-2xl hover:shadow-primary-500/15 transition-all duration-700 hover:-translate-y-3 flex items-center gap-3 flex-1 min-w-0 overflow-hidden"
    >
      {/* Premium background gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-primary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-lg" />

      {/* Enhanced Icon Section */}
      <div className="relative shrink-0">
        <div className="relative">
          {/* Icon glow effect */}
          <div className="absolute inset-0 bg-linear-to-br from-primary-50 via-primary-100 to-primary-200 rounded-lg blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-700 scale-150" />

          {/* Main icon container */}
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 bg-linear-to-br from-primary-50 via-primary-100 to-primary-200 rounded-lg shadow-lg border border-white/50 group-hover:shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 flex items-center justify-center">
            <div className="text-primary-600">{icon}</div>
          </div>

          {/* Subtle shine effect */}
          <div className="absolute inset-0 rounded-lg bg-linear-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
      </div>

      {/* Premium Content Section */}
      <div className="relative flex-1 min-w-0">
        <h3 className="text-xs sm:text-sm font-bold text-warm-gray-900 leading-tight group-hover:text-primary-600 transition-colors duration-500 mb-0.5">
          {title}
        </h3>
        <p className="text-xs text-warm-gray-600 leading-tight group-hover:text-warm-gray-700 transition-colors duration-300">
          {details}
        </p>
      </div>

      {/* Premium gradient accent */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 rounded-full opacity-60 group-hover:opacity-100 group-hover:w-12 transition-all duration-700" />
    </Card>
  );
}

export function TrustBadges() {
  const trustItems = [
    {
      icon: <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      title: "Same Day Delivery",
      details: "Beirut • 3-6 days Lebanon",
    },
    {
      icon: <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      title: "Easy Returns",
      details: "Within 3 days of purchase",
    },
    {
      icon: <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      title: "Duties & Taxes",
      details: "Non-refundable",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {trustItems.map((item, index) => (
        <TrustBadge
          key={index}
          icon={item.icon}
          title={item.title}
          description=""
          details={item.details}
        />
      ))}
    </div>
  );
}
