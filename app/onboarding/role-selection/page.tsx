"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function RoleSelectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { updateUserRole, user } = useAuth();
  
  const roleParam = searchParams.get("role");
  
  useEffect(() => {
    const handleRoleSelection = async () => {
      if (!roleParam || !["client", "reader"].includes(roleParam)) {
        router.push("/onboarding");
        return;
      }

      // Type validation
      const role = roleParam as "client" | "reader";
      
      try {
        // First check if we're authenticated
        if (!user) {
          console.error("No user found");
          router.push("/sign-in");
          return;
        }

  // Create or update client/reader profile in database
        const createUserResponse = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.emailAddresses[0]?.emailAddress,
            username: user.username || user.fullName || user.id,
            role: role === "client" ? "client" : role,
          }),
        });

        if (!createUserResponse.ok) {
          if (createUserResponse.status !== 400) { // Ignore "user exists" error
            throw new Error("Failed to create client/reader profile");
          }
        }

        // Then update the role
        await updateUserRole(role);
        
        // After role is set, redirect to appropriate next step
        if (role === "reader") {
          router.push("/onboarding/reader-application");
        } else {
          router.push("/onboarding/profile-setup");
        }
      } catch (error) {
        console.error("Error in role selection:", error);
        router.push("/onboarding");
      }
    };

    handleRoleSelection();
  }, [roleParam, router, updateUserRole, user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090909] via-background/90 to-[#070707] flex items-center justify-center">
      <div className="container max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 bg-black/40 backdrop-blur-sm border border-[#7878FF]/20">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-[#7878FF]/20 rounded-full animate-ping" />
                <div className="relative flex items-center justify-center w-16 h-16 bg-[#7878FF]/30 rounded-full">
                  <Sparkles className="w-8 h-8 text-[#7878FF]" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#7878FF] to-[#7878FF]/60">
                Setting up your account...
              </h1>
              
              <p className="text-center text-[#C0C0C0]">
                Please wait while we configure your spiritual journey
              </p>

              <div className="w-full mt-6">
                <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 2,
                      ease: "easeInOut",
                      repeat: Infinity
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
