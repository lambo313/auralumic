"use client";

import { StripeProvider } from "./stripe-provider";
import { PaymentForm } from "./payment-form";

interface CheckoutProps {
  clientSecret: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function Checkout({ clientSecret, amount, onSuccess, onError }: CheckoutProps) {
  return (
    <StripeProvider options={{ clientSecret }}>
      <PaymentForm amount={amount} onSuccess={onSuccess} onError={onError} />
    </StripeProvider>
  );
}
