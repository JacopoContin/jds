import type { Metadata } from "next"

import { CommandBarBuilder } from "@/components/studio/command-bar-builder"

export const metadata: Metadata = {
  title: "Command bar · Studio",
  description: "Design a ⌘K command bar that also asks the agent, try it, and copy the code.",
}

export default function CommandBarStudioPage() {
  return <CommandBarBuilder />
}
