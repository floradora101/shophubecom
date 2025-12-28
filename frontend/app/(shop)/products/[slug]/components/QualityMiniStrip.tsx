// Quality Strip - Minimalist Horizontal Layout
import { Truck, Shield, RefreshCw, CheckCircle } from "lucide-react";

interface QualityItemProps {
  icon: React.ReactNode;
  label: string;
  subtext: string;
}

function QualityItem({ icon, label, subtext }: QualityItemProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 group">
      <div className="shrink-0 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-200">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors duration-200">
          {label}
        </span>
        <span className="text-xs text-slate-500">{subtext}</span>
      </div>
    </div>
  );
}

export function QualityMiniStrip() {
  const qualityItems = [
    {
      icon: <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      label: "Fast delivery",
      subtext: "Calculated at checkout",
    },
    {
      icon: <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      label: "Secure checkout",
      subtext: "Protected payments",
    },
    {
      icon: <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      label: "Easy returns",
      subtext: "See policy",
    },
    {
      icon: <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      label: "Authentic products",
      subtext: "Curated selection",
    },
  ];

  return (
    <div className="py-1 sm:py-2">
      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto scrollbar-hide">
        {qualityItems.map((item, index) => (
          <QualityItem
            key={index}
            icon={item.icon}
            label={item.label}
            subtext={item.subtext}
          />
        ))}
      </div>
    </div>
  );
}
