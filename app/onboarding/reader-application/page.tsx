"use client";

import { Card } from "@/components/ui/card";
import { ReaderApplicationForm } from "@/components/readers/reader-application-form";
import { motion } from "framer-motion";

export default function ReaderApplicationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090909] via-background/90 to-[#070707]">
      <div className="container max-w-2xl py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#7878FF] to-[#7878FF]/60">
            Reader Application
          </h1>
          <p className="mt-4 text-center text-lg text-[#C0C0C0]">
            Share your spiritual gifts with our community
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
                <h2 className="text-2xl font-semibold text-[#7878FF]">Share Your Gift</h2>
                <p className="mt-2 text-[#C0C0C0]">
                  Tell us about your experience and abilities
                </p>
              </div>

              <ReaderApplicationForm />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
