import type { Metadata } from "next"

import { SidePanelBuilder } from "@/components/studio/side-panel-builder"

export const metadata: Metadata = {
  title: "Side panel · Studio",
  description: "Configure an agent side panel and copy the code.",
}

export default function SidePanelStudioPage() {
  return <SidePanelBuilder />
}
