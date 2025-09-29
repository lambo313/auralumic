import { useEffect, useState } from "react"

export function useResponsiveTest() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    breakpoint: "xs"
  })

  useEffect(() => {
    function updateViewport() {
      const width = window.innerWidth
      const height = window.innerHeight
      let breakpoint = "xs"

      if (width >= 1280) breakpoint = "xl"
      else if (width >= 1024) breakpoint = "lg"
      else if (width >= 768) breakpoint = "md"
      else if (width >= 640) breakpoint = "sm"

      setViewport({ width, height, breakpoint })
    }

    // Initial check
    updateViewport()

    // Add resize listener
    window.addEventListener("resize", updateViewport)

    // Cleanup
    return () => window.removeEventListener("resize", updateViewport)
  }, [])

  return viewport
}

export function useResponsiveDebug() {
  const viewport = useResponsiveTest()
  
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Current viewport:", viewport)
    }
  }, [viewport])

  return viewport
}
