"use client";
import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface Transaction {
  id: string
  date: string
  type: "credit_purchase" | "reading_payment" | "reading_refund"
  amount: number
  status: "completed" | "pending" | "failed"
  description: string
}

export function TransactionHistory() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [filter])

"use client";
  async function fetchTransactions() {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/transactions?filter=${filter}`)
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const statusColors = {
    completed: "text-green-600",
    pending: "text-yellow-600",
    failed: "text-red-600",
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter transactions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="credit_purchase">Credit Purchases</SelectItem>
            <SelectItem value="reading_payment">Reading Payments</SelectItem>
            <SelectItem value="reading_refund">Refunds</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="capitalize">
                    {transaction.type.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    {transaction.amount.toFixed(2)} credits
                  </TableCell>
                  <TableCell className={statusColors[transaction.status]}>
                    {transaction.status}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
