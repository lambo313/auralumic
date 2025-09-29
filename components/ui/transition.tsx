"use client"

import React from "react"
import { motion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

interface TransitionProps {
  children: React.ReactNode
  className?: string
  animation?: "fade" | "slide" | "scale" | "none"
  duration?: number
  delay?: number
}

const animations: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 }
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 }
  },
  none: {
    initial: {},
    animate: {},
    exit: {}
  }
}

export function Transition({ 
  children, 
  className,
  animation = "fade",
  duration = 0.2,
  delay = 0
}: TransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animations[animation]}
      transition={{ duration, delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
