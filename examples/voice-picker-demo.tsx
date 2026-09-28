"use client"

import { VoicePicker, type Voice } from "@/components/voice/voice-picker"

const voices: Voice[] = [
  { id: "0", name: "Aria", description: "Warm and steady", tags: ["Calm", "Support"] },
  { id: "1", name: "Leo", description: "Bright and quick", tags: ["Upbeat", "Sales"] },
  { id: "2", name: "Mina", description: "Clear and precise", tags: ["Neutral", "Narration"] },
]

/** Previews with the browser's built-in speech synthesis. Swap for your TTS provider. */
function speak(voice: Voice) {
  return new Promise<void>((resolve) => {
    if (typeof speechSynthesis === "undefined") return resolve()
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(`Hi, I'm ${voice.name}. How can I help you today?`)
    const system = speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"))
    u.voice = system[Number(voice.id) % Math.max(1, system.length)] ?? null
    u.onend = () => resolve()
    u.onerror = () => resolve()
    speechSynthesis.speak(u)
  })
}

export default function VoicePickerDemo() {
  return (
    <VoicePicker
      voices={voices}
      className="max-w-sm"
      onPreview={speak}
      onStopPreview={() => typeof speechSynthesis !== "undefined" && speechSynthesis.cancel()}
    />
  )
}
