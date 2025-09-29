"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserStateSwitcher } from "@/components/admin/user-state-switcher"
import { useTheme } from "@/context/theme-context"
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

interface SidebarProps {
  userRole: "reader" | "client" | "admin"
  baseRole: "reader" | "client" | "admin"
  showAdminFeatures: boolean
  notifications: number
  className?: string
}

export function Sidebar({ userRole, baseRole, showAdminFeatures, notifications, className }: SidebarProps) {
  const pathname = usePathname()
  const { theme } = useTheme()

  // Admin navigation
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

  // Client navigation
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

  // Reader navigation
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

  const secondaryNavigation: NavigationItem[] = [
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      name: "Help",
      href: "/help",
      icon: HelpCircle,
    },
  ]

  // Choose navigation based on user role
  // Show admin navigation only if baseRole is admin and userRole is admin
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

  return (
    <div
      className={cn(
        "hidden border-r border-border bg-card backdrop-blur-sm md:fixed md:inset-y-0 md:left-0 md:z-50 md:flex md:w-64 md:flex-col",
        className
      )}
    >
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center group cursor-pointer">
            <div className="relative">
              <img
                className="h-16 w-auto transition-all duration-300 group-hover:scale-110"
                src="/assets/logo/logo.svg"
                alt="Auralumic"
                style={{
                  filter: theme === "dark" 
                    ? "brightness(0) invert(1)" 
                    : "none"
                }}
              />
            </div>
            <div className="flex flex-col -ml-6">
              <h1 className="text-xl font-bold bg-gradient-to-r from-aura-accent-1 to-aura-accent-1/80 bg-clip-text text-transparent tracking-tight transition-all duration-300 group-hover:scale-105 group-hover:tracking-wide">
                Auralumic
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <nav className="mt-8 flex-1 space-y-2 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.name}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start h-[54px] rounded-xl transition-all duration-200 hover:bg-primary/10 hover:scale-[1.02] hover:shadow-sm group",
                  isActive && "bg-primary/15 border border-primary/20 shadow-sm"
                )}
              >
                <a href={item.href} className="flex items-center space-x-4 px-4 w-full">
                  <div className="relative inline-flex items-center justify-center flex-shrink-0">
                    <item.icon className={cn(
                      "h-6 w-6 transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )} />
                    {/* {item.badge && item.badge > 0 && (
                      <Badge
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground shadow-md animate-pulse"
                      >
                        {item.badge}
                      </Badge>
                    )} */}
                  </div>
                  <span className={cn(
                    "text-base font-medium transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}>{item.name}</span>
                </a>
              </Button>
            )
          })}
        </nav>
        <div className="mt-auto">
          {baseRole === "admin" && (
            <div className="mt-6 mx-2">
              <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 border border-purple-200/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    Administrator
                  </h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Platform management and oversight tools.
                </p>
                <Button
                  className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  asChild
                >
                  <a href="/admin/dashboard">Admin Center</a>
                </Button>
              </div>
            </div>
          )}
          <div className="space-y-1 px-3">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.name}
                  asChild
                  variant="ghost"
                  className={cn(
                    "w-full justify-start rounded-lg transition-all duration-200 hover:bg-muted/50 group",
                    isActive && "bg-accent"
                  )}
                >
                  <a
                    href={item.href}
                    className="flex items-center space-x-3 px-3 w-full"
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">{item.name}</span>
                  </a>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
