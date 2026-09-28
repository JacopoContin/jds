/**
 * Primary color presets. Neutral is the default and sets nothing.
 * Each preset only overrides --primary, --primary-foreground and --ring.
 */
export type ColorPreset = {
  name: string
  label: string
  light: { primary: string; "primary-foreground": string; ring: string }
  dark: { primary: string; "primary-foreground": string; ring: string }
}

export const colorPresets: ColorPreset[] = [
  {
    name: "blue",
    label: "Blue",
    light: { primary: "oklch(0.546 0.215 262.9)", "primary-foreground": "oklch(0.985 0 0)", ring: "oklch(0.546 0.215 262.9)" },
    dark: { primary: "oklch(0.65 0.18 259.8)", "primary-foreground": "oklch(0.985 0 0)", ring: "oklch(0.65 0.18 259.8)" },
  },
  {
    name: "violet",
    label: "Violet",
    light: { primary: "oklch(0.541 0.25 293)", "primary-foreground": "oklch(0.985 0 0)", ring: "oklch(0.541 0.25 293)" },
    dark: { primary: "oklch(0.66 0.21 293)", "primary-foreground": "oklch(0.985 0 0)", ring: "oklch(0.66 0.21 293)" },
  },
  {
    name: "rose",
    label: "Rose",
    light: { primary: "oklch(0.586 0.22 17.6)", "primary-foreground": "oklch(0.985 0 0)", ring: "oklch(0.586 0.22 17.6)" },
    dark: { primary: "oklch(0.68 0.2 16.4)", "primary-foreground": "oklch(0.985 0 0)", ring: "oklch(0.68 0.2 16.4)" },
  },
  {
    name: "emerald",
    label: "Emerald",
    light: { primary: "oklch(0.596 0.145 163.2)", "primary-foreground": "oklch(0.985 0 0)", ring: "oklch(0.596 0.145 163.2)" },
    dark: { primary: "oklch(0.72 0.15 162.5)", "primary-foreground": "oklch(0.2 0.04 163)", ring: "oklch(0.72 0.15 162.5)" },
  },
  {
    name: "amber",
    label: "Amber",
    light: { primary: "oklch(0.7 0.17 60)", "primary-foreground": "oklch(0.2 0.04 60)", ring: "oklch(0.7 0.17 60)" },
    dark: { primary: "oklch(0.78 0.16 72)", "primary-foreground": "oklch(0.2 0.04 60)", ring: "oklch(0.78 0.16 72)" },
  },
]
