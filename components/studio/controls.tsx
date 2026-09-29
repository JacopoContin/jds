"use client"

import * as React from "react"
import { cn } from "cn"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/** Shared controls for Studio builders: one labelled row per setting. */

export function ControlGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border-b pb-5 last:border-0">
      <legend className="mb-3 text-xs font-medium text-muted-foreground">{title}</legend>
      {children}
    </fieldset>
  )
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <ToggleGroup
        value={[value]}
        onValueChange={(v) => v[0] && onChange(v[0] as T)}
        variant="outline"
        size="sm"
        // Four options wrap to a 2×2 grid, five or more to rows of three, so labels keep their room.
        className={cn(
          "w-full",
          options.length === 4 && "grid grid-cols-2",
          options.length > 4 && "grid grid-cols-3",
          options.length < 4 && "*:flex-1",
        )}
      >
        {options.map((o) => (
          <ToggleGroupItem key={o.value} value={o.value}>
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export function Range({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <Slider value={value} min={min} max={max} step={step} onValueChange={(v) => onChange(v as number)} />
    </div>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <Label className="justify-between">
      {label}
      <Switch checked={checked} onCheckedChange={onChange} />
    </Label>
  )
}

export function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = React.useId()
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
