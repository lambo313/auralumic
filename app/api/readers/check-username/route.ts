import { NextResponse } from "next/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return new NextResponse("Username is required", { status: 400 })
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username) || username.length < 3 || username.length > 20) {
      return NextResponse.json({ 
        available: false, 
        message: "Username must be 3-20 characters and contain only letters, numbers, and underscores" 
      })
    }

    await dbConnect()

    // Check if username exists
    const existingReader = await Reader.findOne({ username })
    const isAvailable = !existingReader

    return NextResponse.json({ 
      available: isAvailable,
      message: isAvailable ? "Username is available" : "Username is already taken"
    })

  } catch (error) {
    console.error("[USERNAME_CHECK_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
