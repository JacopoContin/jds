"use client"

import * as React from "react"

import { CodePanel } from "@/components/studio/code-panel"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CheckIcon, FileIcon } from "@/lib/icons"

/** One way to apply a Studio's choices, e.g. to this component only or to the whole app. */
export type CodeScope = { value: string; label: string; code: string; note: React.ReactNode }

/**
 * The Code tab for every Studio. With more than one scope, people pick where the choices
 * apply before copying, so the code they paste does what they expect. "Copy as Markdown"
 * hands the same choices to a teammate or a coding agent as a short spec.
 */
export function StudioCode({
  scopes,
  markdown,
  children,
}: {
  scopes: CodeScope[]
  /** The spec for the chosen scope. */
  markdown: (scope: string) => string
  /** Extra panels under the main code, like recipe snippets. */
  children?: React.ReactNode
}) {
  const [scope, setScope] = React.useState(scopes[0].value)
  const [copied, setCopied] = React.useState(false)
  const current = scopes.find((s) => s.value === scope) ?? scopes[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {scopes.length > 1 ? (
          <ToggleGroup
            value={[current.value]}
            onValueChange={(v) => v[0] && setScope(v[0])}
            variant="outline"
            size="sm"
            aria-label="Apply to"
          >
            {scopes.map((s) => (
              <ToggleGroupItem key={s.value} value={s.value}>
                {s.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : (
          <span />
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(markdown(current.value))
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
        >
          {copied ? <CheckIcon /> : <FileIcon />}
          {copied ? "Copied" : "Copy as Markdown"}
        </Button>
      </div>
      <CodePanel code={current.code} note={current.note} />
      {children}
    </div>
  )
}
