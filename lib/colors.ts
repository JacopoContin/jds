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
    light: {
      primary: "oklch(0.546 0.215 262.9)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(0.546 0.215 262.9)",
    },
    dark: {
      primary: "oklch(0.65 0.18 259.8)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(0.65 0.18 259.8)",
    },
  },
  {
    name: "violet",
    label: "Violet",
    light: {
      primary: "oklch(0.541 0.25 293)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(0.541 0.25 293)",
    },
    dark: { primary: "oklch(0.66 0.21 293)", "primary-foreground": "oklch(0.985 0 0)", ring: "oklch(0.66 0.21 293)" },
  },
  {
    name: "rose",
    label: "Rose",
    light: {
      primary: "oklch(0.586 0.22 17.6)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(0.586 0.22 17.6)",
    },
    dark: { primary: "oklch(0.68 0.2 16.4)", "primary-foreground": "oklch(0.985 0 0)", ring: "oklch(0.68 0.2 16.4)" },
  },
  {
    name: "emerald",
    label: "Emerald",
    light: {
      primary: "oklch(0.596 0.145 163.2)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(0.596 0.145 163.2)",
    },
    dark: {
      primary: "oklch(0.72 0.15 162.5)",
      "primary-foreground": "oklch(0.2 0.04 163)",
      ring: "oklch(0.72 0.15 162.5)",
    },
  },
  {
    name: "amber",
    label: "Amber",
    light: { primary: "oklch(0.7 0.17 60)", "primary-foreground": "oklch(0.2 0.04 60)", ring: "oklch(0.7 0.17 60)" },
    dark: { primary: "oklch(0.78 0.16 72)", "primary-foreground": "oklch(0.2 0.04 60)", ring: "oklch(0.78 0.16 72)" },
  },
]

/**
 * Base colors tint the whole gray scale. Each keeps the neutral lightness steps
 * (so contrast is unchanged) and adds a small chroma at one hue. Neutral is the
 * default and sets nothing.
 */
export type BaseColor = { name: string; label: string; hue: number; chroma: number }

export const baseColors: BaseColor[] = [
  { name: "stone", label: "Stone", hue: 60, chroma: 1 },
  { name: "zinc", label: "Zinc", hue: 286, chroma: 0.9 },
  { name: "slate", label: "Slate", hue: 257, chroma: 2.6 },
]

/** Lightness of each neutral token; mirrors :root and .dark in app/globals.css. */
const neutralLightness = {
  light: {
    background: 0.985,
    foreground: 0.145,
    card: 1,
    "card-foreground": 0.145,
    popover: 1,
    "popover-foreground": 0.145,
    primary: 0.205,
    "primary-foreground": 0.985,
    secondary: 0.955,
    "secondary-foreground": 0.205,
    muted: 0.96,
    "muted-foreground": 0.52,
    accent: 0.95,
    "accent-foreground": 0.205,
    border: 0.91,
    input: 0.89,
    ring: 0.6,
    sidebar: 0.975,
    "sidebar-foreground": 0.145,
    "sidebar-primary": 0.205,
    "sidebar-primary-foreground": 0.985,
    "sidebar-accent": 0.95,
    "sidebar-accent-foreground": 0.205,
    "sidebar-border": 0.91,
    "sidebar-ring": 0.6,
  },
  dark: {
    background: 0.185,
    foreground: 0.94,
    card: 0.21,
    "card-foreground": 0.94,
    popover: 0.225,
    "popover-foreground": 0.94,
    primary: 0.94,
    "primary-foreground": 0.2,
    secondary: 0.26,
    "secondary-foreground": 0.94,
    muted: 0.245,
    "muted-foreground": 0.68,
    accent: 0.27,
    "accent-foreground": 0.94,
    ring: 0.55,
    sidebar: 0.2,
    "sidebar-foreground": 0.94,
    "sidebar-primary": 0.94,
    "sidebar-primary-foreground": 0.2,
    "sidebar-accent": 0.26,
    "sidebar-accent-foreground": 0.94,
    "sidebar-ring": 0.55,
  },
} as const

/** Mid-tones carry more tint than near-white and near-black surfaces. */
const chromaAt = (l: number) => (l > 0.9 || l < 0.25 ? 0.005 : 0.012)

/** Dark borders are translucent foreground, not a lightness step; mirrors .dark in app/globals.css. */
const darkTranslucent = { border: 0.09, input: 0.13, "sidebar-border": 0.09 } as const

export function baseColorVars(base: BaseColor, mode: "light" | "dark") {
  const vars = Object.fromEntries(
    Object.entries(neutralLightness[mode]).map(([token, l]) => [
      token,
      `oklch(${l} ${(chromaAt(l) * base.chroma).toFixed(4)} ${base.hue})`,
    ]),
  ) as Record<string, string>
  // Every token set in light must also be set in dark: the light block's selector
  // (:root[data-base]) outranks plain .dark, so any gap leaks light values into dark mode.
  if (mode === "dark") {
    for (const [token, alpha] of Object.entries(darkTranslucent)) {
      vars[token] = `oklch(1 ${(0.01 * base.chroma).toFixed(4)} ${base.hue} / ${alpha * 100}%)`
    }
  }
  return vars
}
