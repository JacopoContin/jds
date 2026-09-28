"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"

import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactCard,
  ArtifactContent,
  ArtifactHeader,
} from "@/components/ai/artifact"
import { Message, MessageContent } from "@/components/ai/message"
import { Response } from "@/components/ai/response"
import { CloseIcon, CodeIcon, CopyIcon, DownloadIcon, PreviewIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

const DOC = `# Q3 pricing update

We're moving the Team plan from **€12 to €14** per seat per month, starting 1 October.

## What stays the same
- Annual customers keep their current price until renewal
- Free and Enterprise plans are unchanged

## Why
Usage of agent features tripled this year. The new price funds more capacity.
`

export default function ArtifactDemo() {
  const [open, setOpen] = React.useState(true)
  const [source, setSource] = React.useState(false)

  return (
    <div className="flex h-112 w-full gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-5 p-2">
        <Message from="user">
          <MessageContent>Draft the pricing announcement.</MessageContent>
        </Message>
        <Message from="assistant">
          <MessageContent>
            <p>Here&apos;s a first draft. I led with what stays the same.</p>
            <ArtifactCard
              title="Q3 pricing update"
              description="Document · v1"
              active={open}
              onOpen={() => setOpen(true)}
            />
          </MessageContent>
        </Message>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "55%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={spring.gentle}
            className="min-w-0 shrink-0 overflow-hidden"
          >
            <Artifact className="min-w-80">
              <ArtifactHeader title="Q3 pricing update" description="Document · v1">
                <ArtifactActions>
                  <ArtifactAction label={source ? "Show preview" : "Show source"} onClick={() => setSource((v) => !v)}>
                    {source ? <PreviewIcon /> : <CodeIcon />}
                  </ArtifactAction>
                  <ArtifactAction label="Copy" onClick={() => toast("Copied")}>
                    <CopyIcon />
                  </ArtifactAction>
                  <ArtifactAction label="Download" onClick={() => toast("Downloaded")}>
                    <DownloadIcon />
                  </ArtifactAction>
                  <ArtifactAction label="Close" onClick={() => setOpen(false)}>
                    <CloseIcon />
                  </ArtifactAction>
                </ArtifactActions>
              </ArtifactHeader>
              <ArtifactContent>
                {source ? (
                  <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                    {DOC}
                  </pre>
                ) : (
                  <Response>{DOC}</Response>
                )}
              </ArtifactContent>
            </Artifact>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
