import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StatsProps {
  totalReadings: number
  completedReadings: number
  averageRating: number
  totalCredits: number
  successRate: number
}

export function StatsDashboard({
  totalReadings,
  completedReadings,
  averageRating,
  totalCredits,
  successRate,
}: StatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReadings}</div>
          <p className="text-xs text-muted-foreground">
            {completedReadings} completed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {averageRating.toFixed(1)}/5.0
          </div>
          <div className="mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-lg">
                {i < Math.round(averageRating) ? "★" : "☆"}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCredits}</div>
          <p className="text-xs text-muted-foreground">
            Earned from readings
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-2">
            <Progress value={successRate} className="h-2" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {successRate}% of readings completed successfully
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
