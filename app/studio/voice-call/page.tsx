import type { Metadata } from "next"

import { VoiceCallBuilder } from "@/components/studio/voice-call-builder"

export const metadata: Metadata = {
  title: "Voice call · Studio",
  description: "Design a voice agent call screen, run a sample call, and copy the code.",
}

export default function VoiceCallStudioPage() {
  return <VoiceCallBuilder />
}
