import type { Metadata } from "next"

import { ExperienceBuilder } from "@/components/studio/experience-builder"

export const metadata: Metadata = {
  title: "Build an experience · Studio",
  description: "Pick chat, a side panel copilot or a voice agent, set the look, parts and behaviour, and export the whole app.",
}

export default function ExperienceStudioPage() {
  return <ExperienceBuilder />
}
