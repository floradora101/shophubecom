import { ComingSoonPage } from "../_components/ComingSoonPage";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <ComingSoonPage
      title="Users"
      description="Manage customer accounts and admin users"
      icon={Users}
      featureDescription="User management will provide tools to view customer profiles, manage user roles, handle account issues, and oversee admin access."
    />
  );
}

