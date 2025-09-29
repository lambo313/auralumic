import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
});

const CREDIT_PACKAGES = [
  { id: 'basic', credits: 10, price: 999 }, // $9.99
  { id: 'standard', credits: 50, price: 3999 }, // $39.99
  { id: 'premium', credits: 100, price: 6999 } // $69.99
];

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { packageId } = await req.json();
    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);

    if (!creditPackage) {
      return new NextResponse('Invalid package', { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${creditPackage.credits} Credits`,
              description: `Purchase ${creditPackage.credits} credits for readings`,
            },
            unit_amount: creditPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits`,
      metadata: {
        userId,
        credits: creditPackage.credits.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
