"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FastIcon, ReasoningIcon, SelectIcon, VisionIcon, WebSearchIcon } from "@/lib/icons"

type ModelCapability = "reasoning" | "vision" | "fast" | "web"

type Model = {
  id: string
  name: string
  /** One line: what it's good for. */
  description?: string
  capabilities?: ModelCapability[]
  /** Short note after the description, like a relative cost ("$$") or context size ("200k"). */
  meta?: string
}

const capabilityMeta: Record<ModelCapability, { label: string; icon: React.ReactNode }> = {
  reasoning: { label: "Reasoning", icon: <ReasoningIcon /> },
  vision: { label: "Vision", icon: <VisionIcon /> },
  fast: { label: "Fast", icon: <FastIcon /> },
  web: { label: "Web", icon: <WebSearchIcon /> },
}

/**
 * Choose the model for the next message. The trigger is a quiet ghost button that
 * fits a prompt toolbar; the menu shows what each model is for.
 */
function ModelPicker({
  models,
  value: controlled,
  defaultValue,
  onValueChange,
  label,
  className,
}: {
  models: Model[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Optional heading at the top of the menu. */
  label?: string
  className?: string
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? models[0]?.id)
  const value = controlled ?? uncontrolled
  const current = models.find((m) => m.id === value)

  const select = (id: string) => {
    if (controlled === undefined) setUncontrolled(id)
    onValueChange?.(id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-slot="model-picker"
            className={cn("gap-1 text-muted-foreground", className)}
          />
        }
      >
        {current?.name ?? "Select model"}
        <SelectIcon className="size-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => select(v as string)}>
          {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
          {models.map((m) => (
            <DropdownMenuRadioItem
              key={m.id}
              value={m.id}
              className="items-start py-1.5 **:data-[slot=dropdown-menu-radio-item-indicator]:top-2"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="truncate">{m.name}</span>
                  {m.capabilities?.map((c) => (
                    <span
                      key={c}
                      title={capabilityMeta[c].label}
                      className="text-muted-foreground/70! [&_svg]:size-3.5"
                    >
                      {capabilityMeta[c].icon}
                      <span className="sr-only">{capabilityMeta[c].label}</span>
                    </span>
                  ))}
                </div>
                {(m.description || m.meta) && (
                  <span className="truncate text-xs text-muted-foreground!">
                    {[m.description, m.meta].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ModelPicker, type Model, type ModelCapability }
