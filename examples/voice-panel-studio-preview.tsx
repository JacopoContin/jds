"use client"

import * as React from "react"

import { PhonePreview } from "@/components/docs/phone-preview"
import { useVoicePanelPreview } from "@/components/studio/use-voice-panel-preview"
import { voicePanelDefaults, type VoicePanelConfig } from "@/components/studio/voice-panel-config"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

function Choice<T extends string>({
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
    <ToggleGroup
      value={[value]}
      onValueChange={(v) => v[0] && onChange(v[0] as T)}
      variant="segmented"
      size="sm"
      aria-label={label}
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value}>
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

/**
 * A small Voice Panel Studio on the homepage. The panel's material and the glow's color follow
 * the site theme (Customize), so the preview shows the look you've picked.
 */
export default function VoicePanelStudioPreview() {
  const [c, setC] = React.useState<VoicePanelConfig>({ ...voicePanelDefaults, palette: "primary" })
  const frame = useVoicePanelPreview(c)
  const set =
    <K extends keyof VoicePanelConfig>(key: K) =>
    (value: VoicePanelConfig[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        <Choice
          label="Talking"
          value={c.mode}
          onChange={set("mode")}
          options={[
            { value: "hands-free", label: "Hands-free" },
            { value: "push-to-talk", label: "Push to talk" },
          ]}
        />
        <Choice
          label="Layout"
          value={c.layout}
          onChange={(layout) => setC((prev) => ({ ...prev, layout, intensity: layout === "fullscreen" ? 1 : 0.8 }))}
          options={[
            { value: "drawer", label: "Drawer" },
            { value: "fullscreen", label: "Full screen" },
          ]}
        />
        <Choice
          label="Glow"
          value={c.palette}
          onChange={set("palette")}
          options={[
            { value: "primary", label: "Theme" },
            { value: "spectrum", label: "Spectrum" },
          ]}
        />
      </div>
      <div className="w-full max-w-80">
        <PhonePreview slug="mobile-voice-panel" title="Voice panel" iframeRef={frame} />
      </div>
    </div>
  )
}
