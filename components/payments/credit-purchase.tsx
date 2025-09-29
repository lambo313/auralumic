import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { PackageSelector } from "./package-selector"
import { PaymentForm } from "./payment-form"
import { api } from "@/services/api"
import type { CreditPackage } from "@/types"

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

const packages: CreditPackage[] = [
  {
    id: "basic",
    name: "Starter",
    credits: 100,
    price: 1000, // $10.00
  },
  {
    id: "popular",
    name: "Popular",
    credits: 500,
    price: 4000, // $40.00
    discount: 20,
    isPopular: true,
  },
  {
    id: "pro",
    name: "Professional",
    credits: 1200,
    price: 8000, // $80.00
    discount: 30,
  },
]

interface Step {
  title: string
  description: string
}

const steps: Step[] = [
  {
    title: "Select Package",
    description: "Choose the credit package that suits your needs",
  },
  {
    title: "Payment",
    description: "Complete your purchase securely",
  },
]

export function CreditPurchase() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(
    null
  )
  const [clientSecret, setClientSecret] = useState("")
  const { toast } = useToast()

  const handlePackageSelect = (pkg: CreditPackage) => {
    setSelectedPackage(pkg)
  }

  const handleContinue = async () => {
    if (!selectedPackage) return

    try {
      const { clientSecret } = await api.credits.purchaseCredits(selectedPackage.id)
      setClientSecret(clientSecret)
      setCurrentStep(1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePaymentSuccess = () => {
    toast({
      title: "Success",
      description: "Your credits have been added to your account.",
    })
  }

  const handlePaymentError = (error: Error) => {
    toast({
      title: "Payment failed",
      description: error.message,
      variant: "destructive",
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Purchase Credits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center space-x-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-center"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <div className="ml-4">
                <p className="font-medium">{step.title}</p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="ml-4 h-[2px] w-16 bg-muted" />
              )}
            </div>
          ))}
        </div>

        {currentStep === 0 ? (
          <>
            <PackageSelector
              packages={packages}
              selectedPackageId={selectedPackage?.id}
              onSelect={handlePackageSelect}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleContinue}
                disabled={!selectedPackage}
              >
                Continue to Payment
              </Button>
            </div>
          </>
        ) : (
          clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                },
              }}
            >
              <PaymentForm
                amount={selectedPackage?.price || 0}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )
        )}
      </CardContent>
    </Card>
  )
}
