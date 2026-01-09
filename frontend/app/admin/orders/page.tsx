import { ComingSoonPage } from "../_components/ComingSoonPage";
import { ShoppingCart } from "lucide-react";

export default function OrdersPage() {
  return (
    <ComingSoonPage
      title="Orders"
      description="Manage customer orders and fulfillment"
      icon={ShoppingCart}
      featureDescription="Order management will allow you to view, process, and track customer orders, handle returns and refunds, and manage shipping."
    />
  );
}

