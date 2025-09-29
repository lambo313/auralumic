import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCredits } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface CreditBalanceProps {
  credits: number
  isLoading?: boolean
}

export function CreditBalance({ credits, isLoading }: CreditBalanceProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCredits(credits)} Credits
              </div>
            )}
          </div>
          <Button
            onClick={() => router.push("/credits/purchase")}
            disabled={isLoading}
          >
            Buy Credits
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
