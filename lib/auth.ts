import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

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
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    // Assuming we store the role in public metadata
    const role = user.publicMetadata.role as "client" | "reader" | "admin"

    return {
      id: userId,
      role: role || "client", // Default to client if no role is set
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
    const clerk = await clerkClient()
    await clerk.users.updateUser(userId, {
      publicMetadata: { role },
    })
  } catch (error) {
    console.error("Error setting user role:", error)
    throw error
  }
}
