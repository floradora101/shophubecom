import { ComingSoonPage } from "../_components/ComingSoonPage";
import { FileText } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <ComingSoonPage
      title="Audit Logs"
      description="View system activity and change history"
      icon={FileText}
      featureDescription="Audit logs will show a complete history of admin actions, system events, and data changes for compliance and troubleshooting."
    />
  );
}
