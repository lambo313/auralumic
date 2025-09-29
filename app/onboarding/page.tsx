"use client";

import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, BookHeart } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090909] via-background/90 to-[#070707]">
      <div className="container max-w-2xl py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#7878FF] to-[#7878FF]/60">
            Welcome to Auralumic
          </h1>
          <p className="mt-4 text-center text-lg text-[#C0C0C0]">
            Your journey to spiritual connection begins here
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
                <h2 className="text-2xl font-semibold text-[#7878FF]">Let&apos;s get started!</h2>
                <p className="mt-2 text-[#C0C0C0]">
                  Choose your path to begin your spiritual journey
                </p>
              </div>

              <div className="grid gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full h-auto p-6 group border border-[#7878FF]/40 hover:bg-[#7878FF]/20 hover:border-[#7878FF]"
                    onClick={() => router.push("/onboarding/role-selection?role=client")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-[#7878FF]/10 group-hover:bg-[#7878FF]/20">
                        <BookHeart className="w-6 h-6 text-[#7878FF]" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-lg text-[#F8F8FF]">I want to get readings</div>
                        <div className="text-sm text-[#C0C0C0] group-hover:text-white">
                          Connect with gifted readers and receive spiritual guidance
                        </div>
                      </div>
                    </div>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full h-auto p-6 group border border-[#7878FF]/40 hover:bg-[#7878FF]/10 hover:border-[#7878FF]"
                    onClick={() => router.push("/onboarding/role-selection?role=reader")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-[#7878FF]/10 group-hover:bg-[#7878FF]/20">
                        <Sparkles className="w-6 h-6 text-[#7878FF]" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-lg text-[#F8F8FF]">I want to provide readings</div>
                        <div className="text-sm text-[#C0C0C0] group-hover:text-white">
                          Share your spiritual gifts and guide others on their journey
                        </div>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
