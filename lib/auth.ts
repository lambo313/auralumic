import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/database"
import { User } from "@/models/User"

interface UserRole {
  id: string
  role: "client" | "reader" | "admin"
}

export async function getUserRole(): Promise<UserRole | null> {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  try {
    await dbConnect()
    const user = await User.findOne({ clerkId: userId })
    
    if (!user) {
      return null
    }

    return {
      id: userId,
      role: user.role || "client", // Default to client if no role is set
    }
  } catch (error) {
    console.error("Error fetching user role:", error)
    return null
  }
}

export async function requireAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }
  
  return userId
}

export async function requireReaderAuth() {
  const userRole = await getUserRole()
  
  if (!userRole || userRole.role !== "reader") {
    redirect("/")
  }
  
  return userRole.id
}

export async function requireAdminAuth() {
  const userRole = await getUserRole()
  
  if (!userRole || userRole.role !== "admin") {
    redirect("/")
  }
  
  return userRole.id
}

export async function setUserRole(userId: string, role: "client" | "reader" | "admin") {
  try {
    await dbConnect()
    const user = await User.findOne({ clerkId: userId })
    
    if (!user) {
      throw new Error("User not found")
    }
    
    user.role = role
    user.updatedAt = new Date()
    await user.save()
  } catch (error) {
    console.error("Error setting user role:", error)
    throw error
  }
}
