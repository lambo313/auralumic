'use client';

import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface AuthButtonsProps {
  isAuthenticated: boolean;
}

export function AuthButtons({ isAuthenticated }: AuthButtonsProps) {
  return (
    <div className="flex gap-4 justify-center">
      {!isAuthenticated ? (
        <>
          <SignUpButton mode="modal">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </>
      ) : (
        <Link 
          href="/dashboard" 
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
