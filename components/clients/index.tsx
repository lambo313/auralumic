"use client"

import { ClientCard as BaseClientCard } from "./client-card"
import { ClientConnect as BaseClientConnect } from "./client-connect"
import { ClientList as BaseClientList } from "./client-list"
import { SuggestReadingModal as BaseSuggestReadingModal } from "./suggest-reading-modal"
import { withSafeRendering } from "@/components/ui/with-safe-rendering"

export const ClientCard = withSafeRendering(BaseClientCard, {
  loadingText: "Loading client information...",
  transitionAnimation: "fade"
})

export const ClientConnect = withSafeRendering(BaseClientConnect, {
  loadingText: "Loading client connections...",
  transitionAnimation: "fade"
})

export const ClientList = withSafeRendering(BaseClientList, {
  loadingText: "Loading clients...",
  transitionAnimation: "fade"
})

export const SuggestReadingModal = withSafeRendering(BaseSuggestReadingModal, {
  loadingText: "Loading modal...",
  transitionAnimation: "fade"
})

export * from "./mock-client-data"