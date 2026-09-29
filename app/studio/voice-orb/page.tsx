import type { Metadata } from "next"

import { VoiceOrbBuilder } from "@/components/studio/voice-orb-builder"

export const metadata: Metadata = {
  title: "Voice orb · Studio",
  description: "Pick an orb, tune its look and motion, preview every state, and copy the code.",
}

export default function VoiceOrbStudioPage() {
  return <VoiceOrbBuilder />
}
