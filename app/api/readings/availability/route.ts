import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { AvailabilityService } from "@/services/availability-service";

const availabilitySchema = z.object({
  readerId: z.string(),
  date: z.string().transform(str => new Date(str)),
  duration: z.number().min(15).max(120),
});

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const data = {
      readerId: searchParams.get("readerId"),
      date: searchParams.get("date"),
      duration: parseInt(searchParams.get("duration") || "30"),
    };

    const validated = availabilitySchema.parse(data);

    const availableSlots = await AvailabilityService.getAvailableSlots(
      validated.readerId,
      validated.date,
      validated.duration
    );

    return NextResponse.json({ availableSlots });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid parameters", { status: 400 });
    }

    console.error("[AVAILABILITY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
