import { useEffect } from "react"
import { useResponsiveTest } from "./use-responsive-test"

export function useLayoutTest(elementId: string) {
  const { width, breakpoint } = useResponsiveTest()

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const element = document.getElementById(elementId)
      if (element) {
        // Test overflow
        const hasHorizontalOverflow = element.scrollWidth > element.clientWidth
        const hasVerticalOverflow = element.scrollHeight > element.clientHeight

        // Test spacing
        const computedStyle = window.getComputedStyle(element)
        const spacing = {
          padding: computedStyle.padding,
          margin: computedStyle.margin,
          gap: computedStyle.gap
        }

        // Test flex/grid behavior
        const display = computedStyle.display
        const flexProps = display === "flex" ? {
          direction: computedStyle.flexDirection,
          wrap: computedStyle.flexWrap,
          justify: computedStyle.justifyContent,
          align: computedStyle.alignItems
        } : null

        // Log results
        console.group(`Layout Test: #${elementId} (${breakpoint})`)
        console.log("Dimensions:", {
          width: element.offsetWidth,
          height: element.offsetHeight
        })
        console.log("Overflow:", {
          horizontal: hasHorizontalOverflow,
          vertical: hasVerticalOverflow
        })
        console.log("Spacing:", spacing)
        if (flexProps) {
          console.log("Flex Properties:", flexProps)
        }
        console.groupEnd()
      }
    }
  }, [elementId, width, breakpoint])
}
