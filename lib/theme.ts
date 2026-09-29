import { baseColorVars, baseColors, colorPresets } from "./colors.ts"
import { site } from "./site.ts"

/** The choices in the header's Customize panel. */
export type ThemeChoice = { color: string; base: string; radius: string; font: string; orb: string }

export const themeDefaults: ThemeChoice = {
  color: "neutral",
  base: "neutral",
  radius: "0.625",
  font: "geist",
  orb: "particles",
}

const SYSTEM_FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'

/** Reads a choice from query params, falling back to defaults for anything missing or unknown. */
export function parseTheme(params: URLSearchParams): ThemeChoice {
  const pick = (key: keyof ThemeChoice, allowed: string[]) => {
    const v = params.get(key)
    return v && allowed.includes(v) ? v : themeDefaults[key]
  }
  return {
    color: pick("color", ["neutral", ...colorPresets.map((p) => p.name)]),
    base: pick("base", ["neutral", ...baseColors.map((b) => b.name)]),
    radius: pick("radius", ["0", "0.3", "0.5", "0.625", "0.75", "1"]),
    font: pick("font", ["geist", "inter", "system"]),
    orb: params.get("orb") ?? themeDefaults.orb,
  }
}

/**
 * A shadcn registry theme item for a choice. It depends on the JDS style, so one install
 * brings the full token set plus these overrides: base grays, primary, radius, and a
 * system font stack (Geist and Inter load through next/font in the layout instead).
 */
export function themeItem(t: ThemeChoice) {
  const base = baseColors.find((b) => b.name === t.base)
  const color = colorPresets.find((p) => p.name === t.color)
  const light: Record<string, string> = { ...(base && baseColorVars(base, "light")), ...color?.light }
  const dark: Record<string, string> = { ...(base && baseColorVars(base, "dark")), ...color?.dark }
  if (t.radius !== themeDefaults.radius) light.radius = `${t.radius}rem`
  if (t.font === "system") light["font-sans"] = dark["font-sans"] = SYSTEM_FONT
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "theme",
    type: "registry:theme",
    title: `${site.name} theme`,
    description: describe(t),
    registryDependencies: [`${site.namespace}/style`],
    cssVars: { light, dark },
  }
}

/** Only the parts that differ from the defaults, as query params. */
export function themeQuery(t: ThemeChoice) {
  const params = new URLSearchParams()
  for (const key of ["color", "base", "radius", "font"] as const) {
    if (t[key] !== themeDefaults[key]) params.set(key, t[key])
  }
  return params.toString()
}

export const themeUrl = (t: ThemeChoice) => {
  const query = themeQuery(t)
  return `${site.url}/r/theme${query ? `?${query}` : ""}`
}

export const isDefaultTheme = (t: ThemeChoice) => themeQuery(t) === ""

function describe(t: ThemeChoice) {
  return `Primary ${t.color}, base ${t.base}, radius ${t.radius}rem, font ${t.font}.`
}

/** What the font choice needs in the root layout; nothing for the system stack. */
export function fontSnippet(t: ThemeChoice) {
  if (t.font === "system") return null
  const name = t.font === "inter" ? "Inter" : "Geist"
  return `import { ${name} } from "next/font/google"

const sans = ${name}({ variable: "--font-sans", subsets: ["latin"] })

<html lang="en" className={sans.variable}>`
}

export const orbSnippet = (t: ThemeChoice) =>
  `import { VoiceOrbProvider } from "@/components/voice/voice-orb"

<VoiceOrbProvider variant="${t.orb}">{children}</VoiceOrbProvider>`
