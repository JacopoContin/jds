import type { MobileVoicePanelGlow } from "@/recipes/mobile-voice-panel/mobile-voice-panel"

/** What the Voice Panel Studio controls, sent to the phone preview as it changes. */
export type VoicePanelConfig = {
  mode: "hands-free" | "push-to-talk"
  layout: "drawer" | "fullscreen"
  surface: "theme" | "flat" | "lit" | "metal" | "glass"
  controls: "glass" | "solid"
  glow: boolean
  palette: "spectrum" | "iris" | "ember" | "primary" | "custom"
  colors: string[]
  intensity: number
  reach: number
  speed: number
  grain: number
  edge: boolean
}

export const voicePanelDefaults: VoicePanelConfig = {
  mode: "hands-free",
  layout: "drawer",
  surface: "theme",
  controls: "glass",
  glow: true,
  palette: "spectrum",
  // Starts from the spectrum palette, so switching to custom changes nothing until you pick.
  colors: ["#c8902a", "#2f8f86", "#8a3fb0", "#3f9a5a", "#c0507a"],
  intensity: 0.8,
  reach: 1,
  speed: 1,
  grain: 0,
  edge: true,
}

/** The studio posts this to the preview iframe; the preview posts `ready` back when it listens. */
export const VOICE_PANEL_MESSAGE = "jds:voice-panel-config"
export const VOICE_PANEL_READY = "jds:voice-panel-ready"

/** The glow prop for a config: only what differs from the component's defaults. */
export function glowProps(c: VoicePanelConfig): MobileVoicePanelGlow | false {
  if (!c.glow) return false
  const g: MobileVoicePanelGlow = {}
  if (c.palette === "custom") g.palette = c.colors
  else if (c.palette !== "spectrum") g.palette = c.palette
  if (c.intensity !== (c.layout === "fullscreen" ? 1 : 0.8)) g.intensity = c.intensity
  if (c.reach !== 1) g.reach = c.reach
  if (c.speed !== 1) g.speed = c.speed
  if (c.grain > 0) g.grain = c.grain
  if (!c.edge) g.edge = false
  return g
}
