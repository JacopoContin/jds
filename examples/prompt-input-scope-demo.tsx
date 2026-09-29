"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputFooter,
  PromptInputFrame,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { PromptInputScope, type Scope } from "@/components/ai/prompt-input-scope"
import { FolderIcon } from "@/lib/icons"

const modules: Scope[] = [
  { id: "sales", label: "Sales", description: "Pipeline, deals, contacts" },
  { id: "finance", label: "Finance", description: "Invoices, payments, forecasts" },
  { id: "operations", label: "Operations", description: "Orders, inventory, suppliers" },
  { id: "support", label: "Support", description: "Tickets and customer history" },
]

export default function PromptInputScopeDemo() {
  const [scope, setScope] = React.useState<string[]>([])
  return (
    <PromptInputFrame className="max-w-xl">
      <PromptInput
        onSubmit={({ text }) => toast(`Sent to ${scope.length ? scope.join(", ") : "all modules"}: ${text}`)}
      >
        <PromptInputTextarea placeholder="Describe a project, ask a question, or bring your work together…" />
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputAttachButton />
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputToolbar>
      </PromptInput>
      <PromptInputFooter>
        <PromptInputScope
          label="Workspace context"
          icon={<FolderIcon />}
          scopes={modules}
          allLabel="All modules"
          menuLabel="Let the agent work in"
          value={scope}
          onValueChange={setScope}
        />
      </PromptInputFooter>
    </PromptInputFrame>
  )
}
