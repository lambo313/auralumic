import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ScheduleForm } from "@/components/readings/schedule-form"

export default async function ClientSchedulePage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <h1 className="text-3xl font-bold">Schedule Reading</h1>
      <ScheduleForm />
    </div>
  )
}