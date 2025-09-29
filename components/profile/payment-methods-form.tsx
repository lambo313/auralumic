"use client";
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { useToast } from "@/components/ui/use-toast"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

const formSchema = z.object({
  name: z.string().min(1, "Card holder name is required"),
  saveCard: z.boolean()
})

type FormValues = z.infer<typeof formSchema>

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function PaymentMethodsForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientSecret, setClientSecret] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      saveCard: false
    }
  })

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)
      // Your payment method creation logic here
      toast({
        title: "Payment method added",
        description: "Your payment method has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Elements stripe={stripePromise}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PaymentElement />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Payment Method"}
            </Button>
          </form>
        </Form>
      </Elements>
    </div>
  )
}
