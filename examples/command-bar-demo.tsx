"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  CommandBar,
  CommandBarAnswer,
  CommandBarAsk,
  CommandBarFooter,
  CommandBarInput,
  CommandBarList,
} from "@/components/ai/command-bar"
import { Response } from "@/components/ai/response"
import { Button } from "@/components/ui/button"
import { CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command"
import { AddIcon, ChartIcon, FileIcon, SettingsIcon, SparkleIcon } from "@/lib/icons"

const ANSWER =
  "Revenue is **€48.2k** this month, up 12% on last month. Most of the growth came from annual plans; monthly churn is flat."

/** Streams a canned answer word by word, the way a model reply arrives. */
function useFakeAnswer() {
  const [text, setText] = React.useState("")
  const run = React.useRef(0)
  const start = async () => {
    const id = ++run.current
    setText("")
    let out = ""
    for (const w of ANSWER.split(/(\s+)/)) {
      await new Promise((r) => setTimeout(r, 25))
      if (run.current !== id) return
      out += w
      setText(out)
    }
  }
  const cancel = () => {
    run.current++
    setText("")
  }
  return { text, start, cancel }
}

export default function CommandBarDemo() {
  const answer = useFakeAnswer()
  return (
    <CommandBar className="max-w-xl" onAsk={answer.start} onBack={answer.cancel}>
      <CommandBarInput />
      <CommandBarList>
        <CommandBarAsk />
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => toast("Summarizing…")}>
            <SparkleIcon />
            Summarize this page
          </CommandItem>
          <CommandItem onSelect={() => toast("Drafting…")}>
            <SparkleIcon />
            Draft a reply to the latest email
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem>
            <AddIcon />
            New invoice
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <ChartIcon />
            Open revenue report
          </CommandItem>
          <CommandItem>
            <SettingsIcon />
            Settings
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandBarList>
      <CommandBarAnswer
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => toast("Copied")}>
              Copy
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast("Opening chat")}>
              <FileIcon />
              Continue in chat
            </Button>
          </>
        }
      >
        <Response isAnimating={answer.text.length < ANSWER.length}>{answer.text}</Response>
      </CommandBarAnswer>
      <CommandBarFooter />
    </CommandBar>
  )
}
