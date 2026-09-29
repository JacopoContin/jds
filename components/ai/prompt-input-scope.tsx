"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDownIcon, ScopeIcon } from "@/lib/icons"

type Scope = { id: string; label: string; description?: string }

/**
 * Limits what the agent works on, e.g. which modules of a product it may read or change.
 * Sits in <PromptInputFooter>: an optional context label on the left and a multi-select on
 * the right. Nothing selected means everything, shown as `allLabel`. Send the value with
 * the message so the agent can respect it.
 */
function PromptInputScope({
  scopes,
  value: controlled,
  defaultValue = [],
  onValueChange,
  label,
  icon,
  allLabel = "All",
  menuLabel,
  className,
}: {
  scopes: Scope[]
  /** Selected scope ids. Empty means all. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (ids: string[]) => void
  /** Context line on the left, e.g. "Workspace context". */
  label?: React.ReactNode
  icon?: React.ReactNode
  allLabel?: string
  /** Optional heading at the top of the menu. */
  menuLabel?: string
  className?: string
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const selected = controlled ?? uncontrolled
  const set = (ids: string[]) => {
    // Picking every scope is the same as all; store it as empty so there's one way to say it.
    const next = ids.length === scopes.length ? [] : ids
    if (controlled === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }
  const names = scopes.filter((s) => selected.includes(s.id)).map((s) => s.label)
  const summary = names.length === 0 ? allLabel : names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`

  return (
    <div
      data-slot="prompt-input-scope"
      className={cn("flex min-w-0 flex-1 items-center justify-between gap-2", className)}
    >
      {label && (
        <span className="flex min-w-0 items-center gap-1.5 px-1.5 text-xs text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0">
          {icon}
          <span className="truncate">{label}</span>
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="xs"
              aria-label={`Scope: ${summary}`}
              className="ml-auto gap-1 text-muted-foreground"
            />
          }
        >
          <ScopeIcon />
          {summary}
          <ChevronDownIcon className="opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          {/* Base UI requires menu labels to live inside a group. */}
          <DropdownMenuGroup>
            {menuLabel && <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>}
            <DropdownMenuCheckboxItem checked={selected.length === 0} onCheckedChange={() => set([])}>
              {allLabel}
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {scopes.map((s) => (
            <DropdownMenuCheckboxItem
              key={s.id}
              checked={selected.includes(s.id)}
              onCheckedChange={(on) => set(on ? [...selected, s.id] : selected.filter((id) => id !== s.id))}
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate">{s.label}</span>
                {s.description && <span className="truncate text-xs text-muted-foreground">{s.description}</span>}
              </div>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export { PromptInputScope, type Scope }
