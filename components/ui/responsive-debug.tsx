"use client"

import { useResponsiveDebug } from "@/hooks/use-responsive-test"

export function ResponsiveDebug() {
  const { width, height, breakpoint } = useResponsiveDebug()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded-md text-xs z-50">
      <div>Width: {width}px</div>
      <div>Height: {height}px</div>
      <div>Breakpoint: {breakpoint}</div>
    </div>
  )
}
