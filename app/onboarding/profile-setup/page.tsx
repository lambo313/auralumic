"use client";

import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@/types";
import { motion } from "framer-motion";

export default function ProfileSetupPage() {
  const { user, role } = useAuth();

  if (!user) {
    return null; // Protected by AuthGuard
  }

  const clientProfile: User = {
    id: user.id,
    clerkId: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    username: user.username || undefined,
    role: role || "client",
    credits: 0,
    preferences: {
      theme: 'auto',
      notifications: {
        email: true,
        push: true,
        inApp: true
      }
    },
    hasCompletedOnboarding: false,
    createdAt: new Date(user.createdAt || Date.now()),
    updatedAt: new Date(user.updatedAt || Date.now()),
    lastLogin: new Date(),
    bio: user.publicMetadata.bio as string | undefined,
    location: user.publicMetadata.location as string | undefined,
    website: user.publicMetadata.website as string | undefined
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090909] via-background/90 to-[#070707]">
      <div className="container max-w-2xl py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#7878FF] to-[#7878FF]/60">
            Set Up Your Client Profile
          </h1>
          <p className="mt-4 text-center text-lg text-[#C0C0C0]">
            Let&apos;s create your spiritual presence
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <Card className="p-8 bg-black/40 backdrop-blur-sm border border-[#7878FF]/20">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-[#7878FF]">Tell us about yourself (Client Profile)</h2>
                <p className="mt-2 text-[#C0C0C0]">
                  Share your story with the Auralumic community
                </p>
              </div>

              <ProfileForm user={clientProfile} />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
