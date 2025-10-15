"use client";

import { useEffect, useState } from "react"
import { useSignIn, useSignUp, useClerk, useUser } from "@clerk/nextjs"

export function useAuth() {
  // For admin users to switch view states without changing database role
  const switchViewState = async (newViewState: "client" | "reader" | "admin") => {
    setRole(newViewState);
    if (typeof window !== 'undefined') {
      localStorage.setItem("adminViewState", newViewState);
    }
  };
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const clerk = useClerk()
  const { user, isLoaded, isSignedIn } = useUser()
  const [role, setRole] = useState<"client" | "reader" | "admin" | null>(null)
  const [baseRole, setBaseRole] = useState<"client" | "reader" | "admin" | null>(null)

  useEffect(() => {
    const fetchBaseRole = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          const response = await fetch("/api/users/me");
          if (!response.ok) throw new Error("Failed to fetch user role from database");
          const data = await response.json();
          const userBaseRole = data.role as "client" | "reader" | "admin";
          setBaseRole(userBaseRole || "client");
          

          
          // Restore persisted view state for admins
          const persistedRole = localStorage.getItem("adminViewState");
          if (userBaseRole === "admin" && persistedRole && ["client","reader","admin"].includes(persistedRole)) {
            setRole(persistedRole as "client" | "reader" | "admin");
            
            // Update reader online status for admin when restoring reader view
            if (persistedRole === 'reader') {
              try {
                await fetch('/api/admin/reader-online-status', {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ isOnline: true }),
                });
              } catch (error) {
                console.error('Failed to update reader online status on load:', error);
              }
            }
          } else {
            setRole(userBaseRole || "client");
          }
          console.log("[useAuth] baseRole from DB:", userBaseRole);
          console.log("[useAuth] persistedRole from localStorage:", persistedRole);
        } catch (err) {
          console.error("[useAuth] Failed to fetch user role from database:", err);
          setBaseRole(null);
          setRole(null);
        }
      } else {
        setRole(null);
        setBaseRole(null);
      }
    };
    fetchBaseRole();
  }, [isLoaded, isSignedIn, user]);

    const signInWithEmail = async (email: string, password: string) => {
      if (!signIn) throw new Error("Sign in not available")
      try {
        const result = await signIn.create({
          identifier: email,
          password,
        });
        const { createdSessionId } = result;
        if (createdSessionId) {
          await clerk.setActive({ session: createdSessionId });
        }
      } catch (err) {
        throw new Error("Failed to sign in")
      }
    }

    const signUpWithEmail = async (
      email: string,
      password: string,
      firstName: string,
      lastName: string
    ) => {
      if (!signUp) throw new Error("Sign up not available")
      try {
        await signUp.create({
          emailAddress: email,
          password,
          firstName,
          lastName,
        });
        await signUp.prepareEmailAddressVerification();
      } catch (err) {
        throw new Error("Failed to sign up")
      }
    }


  const signOut = async () => {
    try {
      // If admin is in reader view, set reader offline before signing out
      if (baseRole === 'admin' && role === 'reader') {
        try {
          await fetch('/api/admin/reader-online-status', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isOnline: false }),
          });
        } catch (error) {
          console.error('Failed to update reader online status on sign out:', error);
          // Continue with sign out even if status update fails
        }
      }
      
      await clerk.signOut()
    } catch (err) {
      throw new Error("Failed to sign out")
    }
  }

  const updateUserRole = async (newRole: "client" | "reader" | "admin") => {
    if (!user) throw new Error("No user logged in");
    try {
      // First update the role in our database
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update role in database");
      }
      // If database update succeeds, update Clerk metadata
      await user.update({
        unsafeMetadata: { 
          role: newRole,
        },
      });
      // Update local state
      setRole(newRole);
    } catch (err) {
      console.error("Error updating user role:", err);
      throw err;
    }
  };

  return {
    user,
    role,
    baseRole,
    isLoaded,
    isSignedIn,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateUserRole,
    switchViewState,
  }
}
