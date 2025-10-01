import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

import { Reader } from "@/types";

interface ReaderStatsDashboardProps {
  user: Reader;
}

export function ReaderStatsDashboard({ user }: ReaderStatsDashboardProps) {
  // Placeholder: Replace with actual stats logic
  const stats = {
    totalReadings: user?.stats?.totalReadings ?? 0,
    completedReadings: user?.stats?.totalReadings ?? 0, // Use totalReadings as proxy
    averageRating: user?.stats?.averageRating ?? 0,
    totalEarnings: user?.stats?.totalEarnings ?? 0,
    completionRate: user?.stats?.completionRate ?? 0,
    repeatClientCount: 0, // Not available in current stats
    repeatClientRate: 0, // Not available in current stats
    profileViews: 0, // Not available in current stats
    bookingRequests: 0, // Not available in current stats
    acceptedBookings: user?.stats?.totalReadings ?? 0, // Use totalReadings as proxy
    pendingReviews: [],
    badges: user?.badges ?? [],
  };

  return (
    <Card className="p-6 mb-8 ">
      <h2 className="text-lg font-semibold mb-4">Reader Performance Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Total Readings</span>
            <span className="text-xl font-bold">{stats.totalReadings}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Completed Readings</span>
            <span className="text-xl font-bold">{stats.completedReadings}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Average Rating</span>
            <span className="text-xl font-bold">{stats.averageRating}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Total Earnings</span>
            <span className="text-xl font-bold">{stats.totalEarnings}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Completion Rate</span>
            <span className="text-xl font-bold">{stats.completionRate}%</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Repeat Clients</span>
            <span className="text-xl font-bold">{stats.repeatClientCount}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Repeat Client Rate</span>
            <span className="text-xl font-bold">{stats.repeatClientRate}%</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Profile Views</span>
            <span className="text-xl font-bold">{stats.profileViews}</span>
          </div>
        </div>
      </div>
      <Separator className="my-6" />
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Badges</h3>
        {stats.badges.length > 0 ? (
          <ul className="list-disc pl-5">
                    {stats.badges.map((badge: string, index: number) => (
              <li key={index}>{badge}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No badges earned yet.</p>
        )}
      </div>
      <Separator className="my-6" />
      <div>
        <h3 className="font-semibold mb-2">Pending Reviews</h3>
        {stats.pendingReviews.length > 0 ? (
          <ul className="list-disc pl-5">
                    {stats.pendingReviews.map((review: unknown, index: number) => (
              <li key={index}>
                Pending Review #{index + 1}
                <Button size="sm" className="ml-2" onClick={() => {}}>
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
