import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
})

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.userId
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await dbConnect()

    // Here you would typically query the user's credit balance
    // const user = await User.findById(userId)
    // const credits = user.credits

    // For now, return mock data
    const credits = 100

    return NextResponse.json({ credits })
  } catch (error) {
    console.error("[CREDITS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.userId
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const { packageId } = json

    if (!packageId) {
      return new NextResponse("Package ID is required", { status: 400 })
    }

    await dbConnect()

    // Here you would typically:
    // 1. Get credit package details
    // const creditPackage = await CreditPackage.findById(packageId)
    const creditPackage = {
      id: packageId,
      credits: 100,
      price: 1000, // Price in cents
    }

    // 2. Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: creditPackage.price,
      currency: "usd",
      metadata: {
        userId,
        packageId,
        credits: creditPackage.credits.toString(),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("[CREDITS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
