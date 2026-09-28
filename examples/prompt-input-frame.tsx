"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputFooter,
  PromptInputFrame,
  PromptInputHeader,
  PromptInputOption,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoIcon, ResearchIcon, SettingsIcon, WebSearchIcon } from "@/lib/icons"

const layouts = ["Without", "Top", "Bottom", "Both"] as const
type Layout = (typeof layouts)[number]

export default function PromptInputFrameDemo() {
  const [layout, setLayout] = React.useState<Layout>("Both")
  const top = layout === "Top" || layout === "Both"
  const bottom = layout === "Bottom" || layout === "Both"

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <Tabs value={layout} onValueChange={(v) => setLayout(v as Layout)}>
        <TabsList>
          {layouts.map((l) => (
            <TabsTrigger key={l} value={l}>
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <PromptInputFrame>
        {top && <PromptInputHeader icon={<InfoIcon />}>Add context, let the agents manage the rest</PromptInputHeader>}
        <PromptInput onSubmit={({ text }) => toast(`Sent: ${text}`)}>
          <PromptInputTextarea placeholder="What would you like to work on?" />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputAttachButton />
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Settings">
                <SettingsIcon />
              </Button>
            </PromptInputTools>
            <PromptInputSubmit />
          </PromptInputToolbar>
        </PromptInput>
        {bottom && (
          <PromptInputFooter>
            <PromptInputOption icon={<WebSearchIcon />} defaultPressed>
              Web search
            </PromptInputOption>
            <PromptInputOption icon={<ResearchIcon />}>Deep research</PromptInputOption>
          </PromptInputFooter>
        )}
      </PromptInputFrame>
    </div>
  )
}
