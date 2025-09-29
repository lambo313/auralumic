"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Make sure to replace this with your actual Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: React.ReactNode;
  options?: {
    clientSecret: string;
    appearance?: any;
  };
}

export function StripeProvider({ children, options }: StripeProviderProps) {
  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
