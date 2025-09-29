'use client';

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from '@/components/notifications/notification-center'
import { useAuth } from '@/hooks/use-auth'

export function Header() {
  const { role } = useAuth();
  
  // Determine base path based on role
  const getBasePath = () => {
    if (role === "admin") return "/admin";
    if (role === "reader") return "/reader/dashboard";
    return "/client/dashboard"; // default to client
  };

  const basePath = getBasePath();

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Auralumic
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href={basePath} className="text-sm font-medium">
            Dashboard
          </Link>
          {role === "client" && (
            <Link href="/client/explore" className="text-sm font-medium">
              Explore
            </Link>
          )}
          <Link href={role === "admin" ? "/admin/dashboard" : role === "reader" ? "/reader/notifications" : "/client/notifications"} className="text-sm font-medium">
            Notifications
          </Link>
          <Link href={role === "admin" ? "/admin/readings" : role === "reader" ? "/reader/readings" : "/client/readings"} className="text-sm font-medium">
            Readings
          </Link>
          <Link href={role === "admin" ? "/admin/users" : role === "reader" ? "/reader/profile" : "/client/profile"} className="text-sm font-medium">
            {role === "admin" ? "Users" : "Profile"}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <NotificationCenter />
          <Button asChild variant="outline">
            <Link href={basePath}>Dashboard</Link>
          </Button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
