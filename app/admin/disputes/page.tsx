import { Card } from "@/components/ui/card";
import { DisputeResolver } from "@/components/admin/dispute-resolver";

export default function DisputesPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between space-x-6">
        <h1 className="page-title">Dispute Management</h1>
        <p className="page-description">Manage disputes and resolutions</p>
      </div>
      <Card className="p-6">
        <DisputeResolver />
      </Card>
    </div>
  );
}
