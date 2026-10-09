"use client"

import { MobileVoiceAgent } from "@/recipes/mobile-voice-agent/mobile-voice-agent"
import { useSimulatedVoiceAgent } from "@/recipes/voice-agent/session"

export default function MobileVoiceAgentScreen() {
  const session = useSimulatedVoiceAgent()
  return <MobileVoiceAgent session={session} subtitle="Calendar and email assistant" />
}
