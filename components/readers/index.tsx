"use client"

import { ReaderCard as BaseReaderCard } from "./reader-card"
import { ReaderList as BaseReaderList } from "./reader-list"
import { ReaderProfile as BaseReaderProfile } from "./reader-profile"
import { withSafeRendering } from "@/components/ui/with-safe-rendering"

export const ReaderCard = withSafeRendering(BaseReaderCard, {
  loadingText: "Loading reader information...",
  transitionAnimation: "fade"
})

export const ReaderList = withSafeRendering(BaseReaderList, {
  loadingText: "Loading readers...",
  transitionAnimation: "fade"
})

export const ReaderProfile = withSafeRendering(BaseReaderProfile, {
  loadingText: "Loading profile...",
  transitionAnimation: "slide"
})
