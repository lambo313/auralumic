import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useCredits } from "@/hooks/use-credits";
import { useRouter } from "next/navigation";

interface ClientStatsDashboardProps {
  user: any;
}

export function ClientStatsDashboard({ user }: ClientStatsDashboardProps) {
  const { credits } = useCredits();
  const router = useRouter();

  // Placeholder: Replace with actual favorite readers and reviews logic
  const favoriteReaders: { id: string; name: string }[] = [];
  const pendingReviews: { id: string; title: string }[] = [];
  const subscriptionStatus = user?.subscriptionId ? "Active" : "Inactive";

  return (
    <Card className="p-6 mb-8 ">
      <h2 className="text-lg font-semibold mb-4">Your Account Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Available Credits</span>
            <span className="text-xl font-bold">{credits ?? user?.credits ?? 0}</span>
          </div>
          <Button variant="outline" onClick={() => router.push("/client/credits")}>Add Credits</Button>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Subscription Status</span>
            <span className="text-xl font-bold">{subscriptionStatus}</span>
          </div>
          <Button variant="outline" onClick={() => router.push("/client/subscription")}>{subscriptionStatus === "Active" ? "Manage Subscription" : "Start Subscription"}</Button>
        </div>
      </div>
      <Separator className="my-6" />
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Favorite Readers</h3>
        {favoriteReaders.length > 0 ? (
          <ul className="list-disc pl-5">
            {favoriteReaders.map((reader: any) => (
              <li key={reader.id}>{reader.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No favorite readers yet.</p>
        )}
      </div>
      <Separator className="my-6" />
      <div>
        <h3 className="font-semibold mb-2">Pending Reviews</h3>
        {pendingReviews.length > 0 ? (
          <ul className="list-disc pl-5">
            {pendingReviews.map((reading: any) => (
              <li key={reading.id}>
                {reading.title}
                <Button size="sm" className="ml-2" onClick={() => router.push(`/client/reading/${reading.id}/review`)}>
                  Complete Review
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No pending reviews.</p>
        )}
      </div>
    </Card>
  );
}
