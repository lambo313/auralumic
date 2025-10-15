'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/context/theme-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Shield, Settings, HelpCircle, LogOut } from 'lucide-react'
import { ReaderStatusToggle } from '@/components/readers/reader-status-toggle'
import { cn } from "@/lib/utils"

interface HeaderProps {
  baseRole: "reader" | "client" | "admin"
  showAdminFeatures: boolean
  className?: string
}

export function Header({ baseRole, showAdminFeatures, className }: HeaderProps) {
  const { role, signOut } = useAuth();
  const { theme } = useTheme();
  
  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-card/95 backdrop-blur-lg supports-[backdrop-filter]:bg-card/80 md:hidden shadow-aura-md",
      className
    )}>
      <div className="container flex h-16 items-center justify-between pr-6">
        {/* Logo and App Name - Left aligned */}
        <Link href="/" className="flex items-center group cursor-pointer">
          <div className="relative">
            {theme === "dark" ? (
              <img
                className="h-12 w-auto transition-all duration-300 group-hover:scale-110"
                src="/assets/logo/logo.svg"
                alt="Auralumic"
                style={{
                    filter: "brightness(0.95)",
                    WebkitFilter: "brightness(0.95)"
                  }}
              />
            ) : (
              <img
                className="h-12 w-auto transition-all duration-300 group-hover:scale-110"
                src="/assets/logo/logo.svg"
                alt="Auralumic"
                style={{
                  filter: "brightness(0.15)",
                  WebkitFilter: "brightness(0.15)"
                }}
              />
            )}
          </div>
          <div className="flex flex-col -ml-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-aura-accent-1 to-aura-accent-1/80 bg-clip-text text-transparent tracking-tight transition-all duration-300 group-hover:scale-105 group-hover:tracking-wide">
              Auralumic
            </h1>
          </div>
        </Link>

        {/* Dropdown Menu - Right aligned */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* {(baseRole === "reader" || role === "reader") && (
              <>
                <DropdownMenuItem asChild>
                  <div className="flex flex-col items-start w-full p-2">
                    <ReaderStatusToggle variant="compact" />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )} */}
            
            <DropdownMenuItem asChild>
              <div className="flex items-center justify-between w-full">
                <span>Theme</span>
                <ThemeToggle />
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {showAdminFeatures && baseRole === "admin" && (
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="flex items-center gap-2 w-full">
                  <Shield className="h-4 w-4" />
                  <span>Admin Center</span>
                </Link>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 w-full">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/help" className="flex items-center gap-2 w-full">
                <HelpCircle className="h-4 w-4" />
                <span>Help</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 w-full text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
