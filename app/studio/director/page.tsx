import type { Metadata } from "next"

import { DirectorBuilder } from "@/components/studio/director-builder"

export const metadata: Metadata = {
  title: "Creative director · Studio",
  description: "Say how your product should feel, pick from three landing pages, and take the code.",
}

export default function DirectorStudioPage() {
  return <DirectorBuilder />
}
