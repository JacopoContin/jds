import type { Metadata } from "next"

import { PromptInputBuilder } from "@/components/studio/prompt-input-builder"

export const metadata: Metadata = {
  title: "Prompt input · Studio",
  description: "Configure an agent composer and copy the code.",
}

export default function PromptInputStudioPage() {
  return <PromptInputBuilder />
}
