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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDownIcon, SettingsIcon } from "@/lib/icons"

type PromptOption = { id: string; label: string; icon?: React.ReactNode; description?: string }

/**
 * Options like web search or deep research, folded into one menu so they fit a toolbar
 * at any width. The trigger shows the active option, or how many are on. Use footer
 * chips (<PromptInputOption>) instead when there's room and options should stay visible.
 */
function PromptInputOptionMenu({
  options,
  value: controlled,
  defaultValue = [],
  onValueChange,
  label = "Tools",
  className,
}: {
  options: PromptOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (ids: string[]) => void
  /** Trigger text when nothing is on, and the menu heading. */
  label?: string
  className?: string
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const selected = controlled ?? uncontrolled
  const set = (ids: string[]) => {
    if (controlled === undefined) setUncontrolled(ids)
    onValueChange?.(ids)
  }
  const active = options.filter((o) => selected.includes(o.id))
  const only = active.length === 1 ? active[0] : undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-slot="prompt-input-option-menu"
            data-active={active.length > 0 || undefined}
            aria-label={`${label}: ${active.length ? active.map((o) => o.label).join(", ") : "none"}`}
            className={cn("min-w-0 shrink gap-1.5 text-muted-foreground data-active:text-foreground", className)}
          />
        }
      >
        {only?.icon ?? <SettingsIcon />}
        <span className="truncate">
          {only ? only.label : active.length > 1 ? `${active.length} ${label.toLowerCase()}` : label}
        </span>
        <ChevronDownIcon className="size-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {options.map((o) => (
            <DropdownMenuCheckboxItem
              key={o.id}
              checked={selected.includes(o.id)}
              onCheckedChange={(on) => set(on ? [...selected, o.id] : selected.filter((id) => id !== o.id))}
            >
              {o.icon}
              <div className="flex min-w-0 flex-col">
                <span className="truncate">{o.label}</span>
                {o.description && <span className="truncate text-xs text-muted-foreground">{o.description}</span>}
              </div>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { PromptInputOptionMenu, type PromptOption }
