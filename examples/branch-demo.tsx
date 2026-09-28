"use client"

import * as React from "react"

import { Branch, BranchContent, BranchSelector } from "@/components/ai/branch"
import { Message, MessageAction, MessageActions, MessageContent } from "@/components/ai/message"
import { RegenerateIcon } from "@/lib/icons"

const drafts = [
  "Thanks for your patience. Your refund is on its way and should arrive in 3 to 5 business days.",
  "Good news: we've issued your refund. Expect it within 3 to 5 business days.",
  "Your refund is done. It usually lands in 3 to 5 business days, depending on your bank.",
  "Refund issued. You'll see it in 3 to 5 business days. Anything else I can help with?",
]

export default function BranchDemo() {
  const [count, setCount] = React.useState(2)

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Message from="user">
        <MessageContent>Write a short reply confirming the refund.</MessageContent>
      </Message>
      <Message from="assistant">
        <MessageContent>
          <Branch count={count}>
            <BranchContent>
              {drafts.slice(0, count).map((d) => (
                <p key={d}>{d}</p>
              ))}
            </BranchContent>
            <div className="flex items-center gap-1">
              <BranchSelector />
              <MessageActions className="opacity-100">
                <MessageAction
                  label="Regenerate"
                  disabled={count >= drafts.length}
                  onClick={() => setCount((c) => Math.min(drafts.length, c + 1))}
                >
                  <RegenerateIcon />
                </MessageAction>
              </MessageActions>
            </div>
          </Branch>
        </MessageContent>
      </Message>
    </div>
  )
}
