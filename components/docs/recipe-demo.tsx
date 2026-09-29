"use client"

import { useSimulatedReceptionist } from "@/recipes/voice-receptionist/session"
import { VoiceReceptionist } from "@/recipes/voice-receptionist/voice-receptionist"

function VoiceReceptionistDemo() {
  const session = useSimulatedReceptionist()
  return <VoiceReceptionist session={session} business="Front desk · Harbor Dental" />
}

const demos: Record<string, () => React.ReactNode> = {
  "voice-receptionist": VoiceReceptionistDemo,
}

/** Runs a recipe with its simulated session. */
export function RecipeDemo({ slug }: { slug: string }) {
  const Demo = demos[slug]
  return Demo ? <Demo /> : null
}
