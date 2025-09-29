"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePathname } from "next/navigation"
import {
  Home,
  Search,
  Bell,
  User,
  Book,
  Settings,
  HelpCircle,
  Shield,
  Users,
  BarChart3,
  type LucideIcon,
  BookOpen,
} from "lucide-react"

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface FooterNavigationProps {
  userRole: "reader" | "client" | "admin"
  baseRole: "reader" | "client" | "admin"
  notifications: number
  className?: string
}

export function FooterNavigation({
  userRole,
  baseRole,
  notifications,
  className,
  }: FooterNavigationProps) {
  const pathname = usePathname()

  const clientNavigation: NavigationItem[] = [
    {
      name: "Dashboard",
      href: "/client/dashboard",
      icon: BarChart3,
    },
    {
      name: "Explore",
      href: "/client/explore",
      icon: Search,
    },
    {
      name: "Notifications",
      href: "/client/notifications",
      icon: Bell,
      badge: notifications,
    },
    {
      name: "Readings",
      href: "/client/readings",
      icon: Book,
    },
    {
      name: "Profile",
      href: "/client/profile",
      icon: User,
    },
  ]

  const readerNavigation: NavigationItem[] = [
    {
      name: "Dashboard",
      href: "/reader/dashboard",
      icon: BarChart3,
    },
    {
      name: "Explore",
      href: "/reader/explore",
      icon: Search,
    },
    {
      name: "Notifications",
      href: "/reader/notifications",
      icon: Bell,
      badge: notifications,
    },
    {
      name: "Readings",
      href: "/reader/readings",
      icon: Book,
    },
    {
      name: "Profile",
      href: "/reader/profile",
      icon: User,
    },
  ]

  const adminNavigation: NavigationItem[] = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: BarChart3,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Readings",
      href: "/admin/readings",
      icon: BookOpen,
    },
    {
      name: "Content",
      href: "/admin/content",
      icon: Settings,
    },
    {
      name: "Disputes",
      href: "/admin/disputes",
      icon: Shield,
    },
  ]

  // Choose navigation based on user role
  let navigation: NavigationItem[]
  if (baseRole === "admin" && userRole === "admin") {
    navigation = adminNavigation
  } else if (baseRole === "client" || userRole === "client") {
    navigation = clientNavigation
  } else if (baseRole === "reader" || userRole === "reader") {
    navigation = readerNavigation
  } else {
    // Fallback to client navigation for unknown roles
    navigation = clientNavigation
  }

  const itemsToRender = navigation

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-lg supports-[backdrop-filter]:bg-card/80 md:hidden shadow-lg",
        className
      )}
    >
      <div className="grid h-18 grid-cols-5 gap-1 p-2">
        {itemsToRender.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.name}
              variant="ghost"
              asChild
              className={cn(
                "h-full rounded-xl transition-all duration-200 hover:bg-primary/10 hover:scale-105 group",
                isActive && "bg-primary/15 border border-primary/20 shadow-sm"
              )}
            >
            <a
              href={item.href}
              className="flex flex-col items-center justify-center space-y-1.5 w-full h-full"
            >
              <div className="relative inline-flex items-center justify-center">
                <item.icon className={cn(
                  "h-6 w-6 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )} />
                {/* {item.badge && item.badge > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground shadow-md animate-pulse"
                  >
                    {item.badge}
                  </Badge>
                )} */}
              </div>
              <span className={cn(
                "text-[11px] font-medium transition-colors duration-200",
                isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}>{item.name}</span>
            </a>
          </Button>
          )
        })}
      </div>
    </nav>
  )
}
