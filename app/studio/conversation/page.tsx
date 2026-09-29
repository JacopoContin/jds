import type { Metadata } from "next"

import { ConversationBuilder } from "@/components/studio/conversation-builder"

export const metadata: Metadata = {
  title: "Conversation · Studio",
  description: "Style messages and agent activity, preview a full turn, and copy the code.",
}

export default function ConversationStudioPage() {
  return <ConversationBuilder />
}
