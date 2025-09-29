import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

const creditPackages = [
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
];

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json(creditPackages);
}

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const json = await request.json();
  const { packageId } = json;

  const selectedPackage = creditPackages.find((pkg) => pkg.id === packageId);

  if (!selectedPackage) {
    return new NextResponse("Invalid package ID", { status: 400 });
  }

  // Here you would:
  // 1. Create a Stripe payment intent
  // 2. Store the pending credit purchase
  // 3. Return the payment intent client secret

  return NextResponse.json({
    clientSecret: "dummy_client_secret",
  });
}
