import type { Metadata } from "next"

import { ArtifactBuilder } from "@/components/studio/artifact-builder"

export const metadata: Metadata = {
  title: "Artifact · Studio",
  description: "Choose how generated documents, code and previews open next to the chat, and copy the code.",
}

export default function ArtifactStudioPage() {
  return <ArtifactBuilder />
}
