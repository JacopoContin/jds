"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useSiteSettings } from "@/components/docs/site-settings"
import { ThemeExport } from "@/components/docs/theme-export"
import { useThemeState } from "@/components/docs/theme-state"
import type { VoiceOrbVariant } from "@/components/voice/voice-orb"
import { baseColors, colorPresets } from "@/lib/colors"
import { CheckIcon } from "@/lib/icons"

export const primarySwatch: Record<string, string> = {
  neutral: "bg-foreground",
  blue: "bg-[oklch(0.6_0.2_262)]",
  violet: "bg-[oklch(0.6_0.23_293)]",
  rose: "bg-[oklch(0.63_0.21_17)]",
  emerald: "bg-[oklch(0.66_0.15_163)]",
  amber: "bg-[oklch(0.74_0.17_66)]",
}

export const baseSwatch: Record<string, string> = {
  neutral: "bg-[oklch(0.55_0_0)]",
  stone: "bg-[oklch(0.55_0.03_60)]",
  zinc: "bg-[oklch(0.55_0.025_286)]",
  slate: "bg-[oklch(0.55_0.05_257)]",
}

export const primaries = [{ name: "neutral", label: "Neutral" }, ...colorPresets.map(({ name, label }) => ({ name, label }))]
export const bases = [{ name: "neutral", label: "Neutral" }, ...baseColors.map(({ name, label }) => ({ name, label }))]
export const radii = ["0", "0.3", "0.5", "0.625", "0.75", "1"]
export const fonts = [
  { value: "geist", label: "Geist" },
  { value: "inter", label: "Inter" },
  { value: "system", label: "System" },
]
export const orbs: { value: VoiceOrbVariant; label: string }[] = [
  { value: "particles", label: "Particles" },
  { value: "ring", label: "Ring" },
  { value: "wave", label: "Wave" },
  { value: "aura", label: "Aura" },
  { value: "bars", label: "Bars" },
  { value: "halftone", label: "Halftone" },
  { value: "plasma", label: "Plasma" },
  { value: "liquid", label: "Liquid" },
  { value: "glass", label: "Glass" },
  { value: "dot", label: "Dot" },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
      {children}
    </div>
  )
}

export function Swatches({
  options,
  value,
  swatch,
  onChange,
}: {
  options: { name: string; label: string }[]
  value: string
  swatch: Record<string, string>
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.name}
          type="button"
          role="radio"
          aria-checked={value === o.name}
          aria-label={o.label}
          title={o.label}
          onClick={() => onChange(o.name)}
          className="grid size-7 place-items-center rounded-full ring-offset-2 ring-offset-popover outline-none focus-visible:ring-2 focus-visible:ring-ring aria-checked:ring-2 aria-checked:ring-foreground/60"
        >
          <span className={cn("grid size-6 place-items-center rounded-full text-background", swatch[o.name])}>
            {value === o.name && <CheckIcon className="size-3.5" />}
          </span>
        </button>
      ))}
    </div>
  )
}

/**
 * Header customizer: primary and base color, radius, font and voice orb, applied across the
 * site as a live preview. "Use this theme in your app" exports the same choices.
 */
export function ColorPicker() {
  const { orb, setOrb } = useSiteSettings()
  const { values, set, reset: resetTheme } = useThemeState()
  const [popover, setPopover] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)

  const reset = () => {
    resetTheme()
    setOrb("particles")
  }

  return (
    <>
      <Popover open={popover} onOpenChange={setPopover}>
        <PopoverTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Customize" />}>
          <span className={cn("size-3.5 rounded-full ring-1 ring-border", primarySwatch[values.color])} />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Customize</span>
            <Button variant="ghost" size="xs" onClick={reset}>
              Reset
            </Button>
          </div>
          <Section title="Primary color">
            <Swatches options={primaries} value={values.color} swatch={primarySwatch} onChange={(v) => set("color", v)} />
          </Section>
          <Section title="Base color">
            <Swatches options={bases} value={values.base} swatch={baseSwatch} onChange={(v) => set("base", v)} />
          </Section>
          <Section title="Radius">
            <ToggleGroup
              value={[values.radius]}
              onValueChange={(v) => v[0] && set("radius", v[0] as string)}
              variant="outline"
              size="sm"
            >
              {radii.map((r) => (
                <ToggleGroupItem key={r} value={r} aria-label={`Radius ${r}rem`}>
                  {r}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Section>
          <Section title="Font">
            <ToggleGroup
              value={[values.font]}
              onValueChange={(v) => v[0] && set("font", v[0] as string)}
              variant="outline"
              size="sm"
            >
              {fonts.map((f) => (
                <ToggleGroupItem key={f.value} value={f.value}>
                  {f.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Section>
          <Section title="Voice orb">
            <ToggleGroup
              value={[orb]}
              onValueChange={(v) => v[0] && setOrb(v[0] as VoiceOrbVariant)}
              variant="outline"
              size="sm"
              className="grid grid-cols-3"
            >
              {orbs.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value}>
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Section>
          <Button
            size="sm"
            onClick={() => {
              setPopover(false)
              setExporting(true)
            }}
          >
            Use this theme in your app
          </Button>
        </PopoverContent>
      </Popover>
      <ThemeExport theme={{ ...values, orb }} open={exporting} onOpenChange={setExporting} />
    </>
  )
}
