import { ComingSoonPage } from "../_components/ComingSoonPage";
import { Gift } from "lucide-react";

export default function CouponsPage() {
  return (
    <ComingSoonPage
      title="Coupons"
      description="Manage discount coupons and vouchers"
      icon={Gift}
      featureDescription="Coupon management will enable you to create, distribute, and track discount codes with various redemption rules and limitations."
    />
  );
}
