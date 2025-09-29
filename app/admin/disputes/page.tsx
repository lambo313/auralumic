import { Card } from "@/components/ui/card";
import { DisputeResolver } from "@/components/admin/dispute-resolver";

export default function DisputesPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 text-2xl font-bold">Dispute Management</h1>

      <Card className="p-6">
        <DisputeResolver />
      </Card>
    </div>
  );
}
