"use client"

import { useSimulatedVoiceAgent } from "@/recipes/voice-agent/session"
import { VoiceAgent } from "@/recipes/voice-agent/voice-agent"

export default function VoiceAgentDemo() {
  const session = useSimulatedVoiceAgent()
  return <VoiceAgent session={session} subtitle="Calendar and email assistant" />
}
