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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSiteSettings } from "@/components/docs/site-settings"
import type { VoiceOrbVariant } from "@/components/voice/voice-orb"
import { colorPresets } from "@/lib/colors"

export const COLOR_KEY = "jds:color"

/** Runs before paint (see app/layout.tsx) so the saved color never flashes. */
export const colorInitScript = `try{var c=localStorage.getItem("${COLOR_KEY}");if(c&&c!=="neutral")document.documentElement.dataset.color=c}catch(e){}`

const swatch: Record<string, string> = {
  neutral: "bg-foreground",
  blue: "bg-[oklch(0.6_0.2_262)]",
  violet: "bg-[oklch(0.6_0.23_293)]",
  rose: "bg-[oklch(0.63_0.21_17)]",
  emerald: "bg-[oklch(0.66_0.15_163)]",
  amber: "bg-[oklch(0.74_0.17_66)]",
}

const options = [{ name: "neutral", label: "Neutral" }, ...colorPresets.map(({ name, label }) => ({ name, label }))]

const orbs: { value: VoiceOrbVariant; label: string }[] = [
  { value: "particles", label: "Particles" },
  { value: "ring", label: "Ring" },
  { value: "wave", label: "Wave" },
]

/** Header customizer: primary color and voice orb style, applied across the site. */
export function ColorPicker() {
  const [color, setColor] = React.useState("neutral")
  const { orb, setOrb } = useSiteSettings()

  React.useEffect(() => {
    queueMicrotask(() => setColor(document.documentElement.dataset.color ?? "neutral"))
  }, [])

  const apply = (next: string) => {
    setColor(next)
    if (next === "neutral") delete document.documentElement.dataset.color
    else document.documentElement.dataset.color = next
    try {
      localStorage.setItem(COLOR_KEY, next)
    } catch {}
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Customize" />}>
        <span className={cn("size-3.5 rounded-full ring-1 ring-border", swatch[color])} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup value={color} onValueChange={(v) => apply(v as string)}>
          <DropdownMenuLabel>Primary color</DropdownMenuLabel>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.name} value={o.name}>
              <span className={cn("size-3 rounded-full", swatch[o.name])} />
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={orb} onValueChange={(v) => setOrb(v as VoiceOrbVariant)}>
          <DropdownMenuLabel>Voice orb</DropdownMenuLabel>
          {orbs.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
