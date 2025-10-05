"use client";

import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { FooterNavigation } from "./footer-navigation"
import { useAuth } from "@/hooks/use-auth"

interface MainLayoutProps {
  children: React.ReactNode
  notifications?: number
  forceRole?: "reader" | "client" | "admin" // For overriding the role in specific contexts
}

export function MainLayout({ children, notifications = 0, forceRole }: MainLayoutProps) {
  const { role, baseRole } = useAuth()

  // Use forceRole if provided, otherwise use current role, fallback to baseRole
  const userRole = forceRole || role || baseRole || "client"
  const showAdminFeatures = baseRole === "admin"

  return (
    <div className="min-h-screen gradient-bg">
      <Header 
        baseRole={baseRole || "client"}
        showAdminFeatures={showAdminFeatures}
      />
      <Sidebar 
        userRole={userRole} 
        baseRole={baseRole || "client"}
        showAdminFeatures={showAdminFeatures}
        notifications={notifications} 
      />
      <main className="md:pl-64 pt-12 pb-20 md:pt-0 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {children}
          </div>
        </div>
      </main>
      <FooterNavigation
        userRole={userRole}
        baseRole={baseRole || "client"}
        notifications={notifications}
      />
    </div>
  )
}
