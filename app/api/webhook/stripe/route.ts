import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { handleWebhookEvent } from '@/services/payment-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return new NextResponse('No signature', { status: 400 });
  }

  try {
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle the event
    await handleWebhookEvent(event);

    return new NextResponse('Webhook handled successfully', { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error handling webhook:', err);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }
    console.error('Error handling webhook:', err);
    return new NextResponse('Webhook Error: Unknown error', { status: 400 });
  }
}
