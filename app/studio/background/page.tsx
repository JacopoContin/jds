import type { Metadata } from "next"

import { BackgroundBuilder } from "@/components/studio/background-builder"

export const metadata: Metadata = {
  title: "Backgrounds · Studio",
  description: "Design an ambient background for agent surfaces, preview it behind a chat and a call, and copy the code.",
}

export default function BackgroundStudioPage() {
  return <BackgroundBuilder />
}
