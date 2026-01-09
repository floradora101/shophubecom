import { ComingSoonPage } from "../_components/ComingSoonPage";
import { Tag } from "lucide-react";

export default function PromotionsPage() {
  return (
    <ComingSoonPage
      title="Promotions"
      description="Create and manage promotional campaigns"
      icon={Tag}
      featureDescription="Promotion management will let you create discount codes, seasonal sales, flash deals, and targeted marketing campaigns."
    />
  );
}
