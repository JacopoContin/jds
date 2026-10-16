import type { Metadata } from "next"

import { VoicePanelBuilder } from "@/components/studio/voice-panel-builder"

export const metadata: Metadata = {
  title: "Voice panel · Studio",
  description: "Style mobile voice chat: drawer or full screen, panel material, and the colors and texture of the glow.",
}

export default function VoicePanelStudioPage() {
  return <VoicePanelBuilder />
}
