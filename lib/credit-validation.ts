import User from "@/models/User";
import dbConnect from "./database";

export async function validateCredits(userId: string, creditCost: number): Promise<boolean> {
  await dbConnect();
  
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error('User not found');
  }

  if (user.credits < creditCost) {
    throw new Error('Insufficient credits');
  }

  return true;
}

export function calculateCreditCost(duration: number, baseRate: number = 1): number {
  // Base calculation: 1 credit per minute multiplied by base rate
  return Math.ceil(duration * baseRate);
}
