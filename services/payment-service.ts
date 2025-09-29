import Stripe from 'stripe';
import dbConnect from '@/lib/database';
import { User } from '@/models/User';
import Transaction from '@/models/Transaction';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export const createPaymentIntent = async ({
  amount,
  currency = 'usd',
  userId,
}: {
  amount: number;
  currency?: string;
  userId: string;
}) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: {
      userId,
    },
  });

  return paymentIntent;
};

export const createCustomer = async ({
  email,
  name,
  userId,
}: {
  email: string;
  name: string;
  userId: string;
}) => {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  await dbConnect();
  await User.findByIdAndUpdate(userId, { 
    stripeCustomerId: customer.id 
  });

  return customer;
};

export const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handleSuccessfulPayment(paymentIntent);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handleFailedPayment(failedPayment);
      break;
  }
};

const handleSuccessfulPayment = async (paymentIntent: Stripe.PaymentIntent) => {
  const userId = paymentIntent.metadata.userId;
  const amount = paymentIntent.amount;

  // Calculate credits based on amount
  const credits = Math.floor(amount / 100) * 10; // Example: $1 = 10 credits

  await dbConnect();
  
  // Update user credits
  await User.findByIdAndUpdate(userId, {
    $inc: { credits: credits }
  });

  // Create transaction record
  await Transaction.create({
    data: {
      userId,
      amount,
      credits,
      status: 'completed',
      paymentIntentId: paymentIntent.id,
    },
  });
};

const handleFailedPayment = async (paymentIntent: Stripe.PaymentIntent) => {
  const userId = paymentIntent.metadata.userId;

  // Create failed transaction record
  await dbConnect();
  await Transaction.create({
    userId,
    amount: paymentIntent.amount,
    credits: 0,
    status: 'failed',
    paymentIntentId: paymentIntent.id,
  });
};
