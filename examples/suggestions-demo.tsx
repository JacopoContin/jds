"use client"

import { toast } from "sonner"

import { Suggestion, Suggestions } from "@/components/ai/suggestions"

const items = ["Summarize this page", "Find related tickets", "Draft a reply", "Translate to Italian"]

export default function SuggestionsDemo() {
  return (
    <Suggestions className="max-w-lg justify-center">
      {items.map((s) => (
        <Suggestion key={s} suggestion={s} onSelect={(v) => toast(v)} />
      ))}
    </Suggestions>
  )
}
