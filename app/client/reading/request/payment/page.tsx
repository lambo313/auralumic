import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { PaymentConfirmation } from "@/components/readings/payment-confirmation"

export default async function ClientPaymentPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <h1 className="page-title">Confirm Payment</h1>
      <PaymentConfirmation />
    </div>
  )
}