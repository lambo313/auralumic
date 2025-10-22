'use client';

import { SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';
import { useTheme } from '@/context/theme-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingHeader() {
  const { theme } = useTheme();
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Resolve the actual theme when "system" is selected, but only on client
  const resolvedTheme = mounted && theme === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;
  
  // Use a safe filter value that won't cause hydration mismatch
  const logoFilter = mounted && resolvedTheme === "dark" 
    ? "brightness(0) invert(1)" 
    : "none";
  
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center group cursor-pointer">
          <div className="relative">
            <img
              className="h-16 w-auto transition-all duration-300 group-hover:scale-110"
              src="/assets/logo/logo.svg"
              alt="Auralumic"
              style={{
                filter: logoFilter
              }}
            />
          </div>
          <div className="flex flex-col -ml-6">
            <h1 className="text-xl font-bold bg-gradient-to-r from-aura-accent-1 to-aura-accent-1/80 bg-clip-text text-transparent tracking-tight transition-all duration-300 group-hover:scale-105 group-hover:tracking-wide">
              Auralumic
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="text-foreground hover:text-aura-accent-1 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 bg-aura-accent-1 text-white rounded-lg hover:bg-aura-accent-1/90 transition-colors">
                  Get Started
                </button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Link 
                href="/dashboard" 
                className="text-foreground hover:text-aura-accent-1 transition-colors flex items-center gap-1"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
