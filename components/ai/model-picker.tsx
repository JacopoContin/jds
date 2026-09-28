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
  /** Short right-aligned note, like a relative cost ("$$") or context size ("200k"). */
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
  label = "Model",
  className,
}: {
  models: Model[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Heading shown at the top of the menu. */
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
        <SelectIcon className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => select(v as string)}>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {models.map((m) => (
            <DropdownMenuRadioItem key={m.id} value={m.id} className="items-start py-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{m.name}</span>
                  {m.meta && <span className="ml-auto font-mono text-xs text-muted-foreground">{m.meta}</span>}
                </div>
                {m.description && <span className="text-xs text-muted-foreground">{m.description}</span>}
                {m.capabilities && m.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {m.capabilities.map((c) => (
                      <span
                        key={c}
                        className="inline-flex h-5 items-center gap-1 rounded-md bg-muted px-1.5 text-[11px] text-muted-foreground [&_svg]:size-3"
                      >
                        {capabilityMeta[c].icon}
                        {capabilityMeta[c].label}
                      </span>
                    ))}
                  </div>
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
