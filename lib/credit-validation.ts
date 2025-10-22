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

export async function deductCredits(userId: string, creditCost: number): Promise<{ success: boolean; newBalance: number }> {
  await dbConnect();
  
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error('User not found');
  }

  if (user.credits < creditCost) {
    throw new Error('Insufficient credits');
  }

  // Deduct credits from user account
  user.credits -= creditCost;
  await user.save();

  return {
    success: true,
    newBalance: user.credits
  };
}

export async function refundCredits(userId: string, creditAmount: number): Promise<{ success: boolean; newBalance: number }> {
  await dbConnect();
  
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error('User not found');
  }

  // Add credits back to user account
  user.credits += creditAmount;
  await user.save();

  return {
    success: true,
    newBalance: user.credits
  };
}

export function calculateCreditCost(duration: number, baseRate: number = 1): number {
  // Base calculation: 1 credit per minute multiplied by base rate
  return Math.ceil(duration * baseRate);
}
