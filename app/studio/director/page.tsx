import type { Metadata } from "next"

import { DirectorBuilder } from "@/components/studio/director-builder"

export const metadata: Metadata = {
  title: "Creative director · Studio",
  description: "Say how your product should feel and pick from three complete looks, then build with it.",
}

export default function DirectorStudioPage() {
  return <DirectorBuilder />
}
