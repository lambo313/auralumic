import { useEffect, useState } from "react"
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface PaymentFormProps {
  amount: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!stripe || !elements) {
      return
    }
  }, [stripe, elements])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/credits/confirmation`,
        },
      })

      if (error) {
        const paymentError = new Error(error.message);
        paymentError.name = 'StripePaymentError';
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        })
        onError?.(paymentError)
      } else {
        toast({
          title: "Payment successful",
          description: "Your credits have been added to your account.",
        })
        onSuccess?.()
      }
    } catch (err) {
      console.error("Payment error:", err)
      toast({
        title: "Payment failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      onError?.(err instanceof Error ? err : new Error("Payment failed"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <PaymentElement />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Amount: ${(amount / 100).toFixed(2)}
        </div>
        <Button
          type="submit"
          disabled={isLoading || !stripe || !elements}
        >
          {isLoading ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </form>
  )
}
