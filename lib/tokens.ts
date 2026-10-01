import registry from "../registry.json" with { type: "json" }
import { duration, ease, spring } from "./motion.ts"
import { oklchToP3, oklchToSrgb, parseOklch, toHex, type Oklch, type Rgb } from "./oklch.ts"
import { themeItem, type ThemeChoice } from "./theme.ts"
import { tokensUrl, type TokenFormat } from "./token-formats.ts"

/**
 * The JDS tokens for native apps. Colors come from the same CSS variables the web uses
 * (globals.css, through the style in registry.json) with the theme's overrides on top,
 * so a theme picked in the docs looks the same in SwiftUI, Compose and React Native.
 */
export type TokenColor = { oklch: Oklch; srgb: Rgb; p3: Rgb; hex: string }

export type Tokens = {
  theme: ThemeChoice
  colors: { light: Record<string, TokenColor>; dark: Record<string, TokenColor> }
  /** Corner radii in points (1rem = 16pt). */
  radius: Record<string, number>
  /** Base spacing unit in points; layouts use multiples of it. */
  spacing: number
  /** Minimum touch target in points. */
  touchTarget: number
  /** Durations in milliseconds. */
  duration: Record<string, number>
  /** Cubic-bezier control points. */
  easing: Record<string, readonly [number, number, number, number]>
  /** Physical springs: the same mass, stiffness and damping as the web's motion presets. */
  spring: Record<string, { mass: number; stiffness: number; damping: number }>
  font: { sans: string | null }
}

/** The radius scale, as multiples of --radius (see @theme in globals.css). */
const radiusScale = { sm: 0.6, md: 0.8, lg: 1, xl: 1.4, "2xl": 1.8, "3xl": 2.2, "4xl": 2.6 }

const fonts: Record<string, string | null> = { geist: "Geist", inter: "Inter", system: null }

const style = registry.items.find((i) => i.name === "style")?.cssVars as unknown as {
  light: Record<string, string>
  dark: Record<string, string>
}

function colorsFor(vars: Record<string, string>) {
  const out: Record<string, TokenColor> = {}
  for (const [name, value] of Object.entries(vars)) {
    const oklch = parseOklch(value)
    if (!oklch) continue // radius, safe areas, fonts
    const srgb = oklchToSrgb(oklch)
    out[name] = { oklch, srgb, p3: oklchToP3(oklch), hex: toHex(srgb) }
  }
  return out
}

export function buildTokens(theme: ThemeChoice): Tokens {
  const overrides = themeItem(theme).cssVars
  const rem = parseFloat(theme.radius)
  return {
    theme,
    colors: {
      light: colorsFor({ ...style.light, ...overrides.light }),
      dark: colorsFor({ ...style.dark, ...overrides.dark }),
    },
    radius: Object.fromEntries(Object.entries(radiusScale).map(([k, m]) => [k, Math.round(rem * m * 16 * 10) / 10])),
    spacing: 4,
    touchTarget: 44,
    duration: Object.fromEntries(Object.entries(duration).map(([k, s]) => [k, Math.round(s * 1000)])),
    easing: ease as Tokens["easing"],
    spring: Object.fromEntries(
      Object.entries(spring).map(([k, s]) => [k, { mass: "mass" in s ? s.mass : 1, stiffness: s.stiffness, damping: s.damping }])
    ),
    font: { sans: fonts[theme.font] ?? null },
  }
}

export function formatTokens(t: Tokens, format: TokenFormat) {
  return { json: toJson, swift: toSwift, kotlin: toKotlin, "react-native": toReactNative }[format](t)
}

const camel = (s: string) => s.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())
/** Radius names that start with a digit read back to front in languages that need it: "2xl" is xl2. */
const ident = (s: string) => s.replace(/^(\d)(\w+)$/, "$2$1")
const n = (x: number) => String(Math.round(x * 10000) / 10000)

function header(t: Tokens, comment: string) {
  const { color, base, radius, font } = t.theme
  return [
    `${comment} JDS tokens: primary ${color}, base ${base}, radius ${radius}rem, font ${font}.`,
    `${comment} Generated from ${tokensUrl(t.theme, "json").replace(/\/json/, "/{format}")}. Don't edit by hand; download again to update.`,
  ].join("\n")
}

/* DTCG (Design Tokens Community Group) format, for Style Dictionary, Tokens Studio and similar tools. */
function toJson(t: Tokens) {
  const color = (c: TokenColor) => ({
    $type: "color",
    $value: { colorSpace: "oklch", components: [c.oklch.l, c.oklch.c, c.oklch.h], alpha: c.oklch.alpha, hex: c.hex },
  })
  const group = <T,>(o: Record<string, T>, f: (v: T) => object) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]))
  const dimension = (value: number) => ({ $type: "dimension", $value: { value, unit: "px" } })
  return JSON.stringify(
    {
      $description: `JDS tokens: primary ${t.theme.color}, base ${t.theme.base}, radius ${t.theme.radius}rem.`,
      color: { light: group(t.colors.light, color), dark: group(t.colors.dark, color) },
      radius: group(t.radius, dimension),
      spacing: { unit: dimension(t.spacing) },
      touchTarget: dimension(t.touchTarget),
      duration: group(t.duration, (value) => ({ $type: "duration", $value: { value, unit: "ms" } })),
      easing: group(t.easing, (value) => ({ $type: "cubicBezier", $value: value })),
      spring: group(t.spring, (s) => group(s, (value) => ({ $type: "number", $value: value }))),
      font: t.font.sans ? { sans: { $type: "fontFamily", $value: t.font.sans } } : {},
    },
    null,
    2
  )
}

function toSwift(t: Tokens) {
  const p3 = ({ r, g, b, alpha }: Rgb) =>
    `Color(.displayP3, red: ${n(r)}, green: ${n(g)}, blue: ${n(b)}, opacity: ${n(alpha)})`
  const colors = Object.keys(t.colors.light)
    .map((k) => `        public static let ${camel(k)} = Color(light: ${p3(t.colors.light[k].p3)}, dark: ${p3(t.colors.dark[k].p3)})`)
    .join("\n")
  const radius = Object.entries(t.radius)
    .map(([k, v]) => `        public static let ${ident(k)}: CGFloat = ${v}`)
    .join("\n")
  const durations = Object.entries(t.duration)
    .map(([k, v]) => `        public static let ${k}: Double = ${v / 1000}`)
    .join("\n")
  const springs = Object.entries(t.spring)
    .map(
      ([k, s]) =>
        `        public static let ${k} = Animation.interpolatingSpring(mass: ${s.mass}, stiffness: ${s.stiffness}, damping: ${s.damping})`
    )
    .join("\n")
  const curves = Object.entries(t.easing)
    .map(
      ([k, [x1, y1, x2, y2]]) =>
        `        public static func ${k}(duration: Double = Duration.base) -> Animation {\n            .timingCurve(${x1}, ${y1}, ${x2}, ${y2}, duration: duration)\n        }`
    )
    .join("\n")
  return `${header(t, "//")}

import SwiftUI

public enum JDS {
    /** Adapts to light and dark mode. */
    public enum Colors {
${colors}
    }

    /** Corner radii in points. */
    public enum Radius {
${radius}
    }

    /** Base spacing unit; use multiples of it. */
    public static let spacing: CGFloat = ${t.spacing}
    /** Minimum size for anything tappable. */
    public static let touchTarget: CGFloat = ${t.touchTarget}
${t.font.sans ? `    /** Bundle the font with the app; falls back to the system font if missing. */\n    public static let fontFamily = "${t.font.sans}"\n` : ""}
    /** Durations in seconds. Keep UI feedback under 0.25. */
    public enum Duration {
${durations}
    }

    /** snappy: buttons and toggles. gentle: panels and messages. soft: voice orbs. */
    public enum Spring {
${springs}
    }

    public enum Ease {
${curves}
    }
}

extension Color {
    /** A color that follows the system appearance. */
    fileprivate init(light: Color, dark: Color) {
        #if canImport(UIKit)
        self.init(UIColor { $0.userInterfaceStyle == .dark ? UIColor(dark) : UIColor(light) })
        #elseif canImport(AppKit)
        self.init(NSColor(name: nil) { $0.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? NSColor(dark) : NSColor(light) })
        #else
        self = light
        #endif
    }
}
`
}

function toKotlin(t: Tokens) {
  const argb = ({ hex }: TokenColor) => {
    const h = hex.slice(1)
    const alpha = h.length === 8 ? h.slice(6) : "ff"
    return `Color(0x${(alpha + h.slice(0, 6)).toUpperCase()})`
  }
  const names = Object.keys(t.colors.light)
  const scheme = (mode: "light" | "dark") =>
    names.map((k) => `    ${camel(k)} = ${argb(t.colors[mode][k])},`).join("\n")
  const radius = Object.entries(t.radius)
    .map(([k, v]) => `    val ${ident(k)} = ${v}.dp`)
    .join("\n")
  const durations = Object.entries(t.duration)
    .map(([k, v]) => `    const val ${camel(k)} = ${v}`)
    .join("\n")
  // Compose springs take a damping ratio and a stiffness for unit mass.
  const springs = Object.entries(t.spring)
    .map(([k, { mass, stiffness, damping }]) => {
      const ratio = damping / (2 * Math.sqrt(stiffness * mass))
      return `    fun <T> ${k}() = spring<T>(dampingRatio = ${n(ratio)}f, stiffness = ${n(stiffness / mass)}f)`
    })
    .join("\n")
  const curves = Object.entries(t.easing)
    .map(([k, [x1, y1, x2, y2]]) => `    val ${k} = CubicBezierEasing(${x1}f, ${y1}f, ${x2}f, ${y2}f)`)
    .join("\n")
  return `${header(t, "//")}

package jds

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.spring
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Immutable
data class JdsColors(
${names.map((k) => `    val ${camel(k)}: Color,`).join("\n")}
)

val JdsLightColors = JdsColors(
${scheme("light")}
)

val JdsDarkColors = JdsColors(
${scheme("dark")}
)

/** The scheme for the current system appearance. */
@Composable
fun jdsColors(darkTheme: Boolean = isSystemInDarkTheme()) = if (darkTheme) JdsDarkColors else JdsLightColors

object JdsRadius {
${radius}
}

object JdsSize {
    /** Base spacing unit; use multiples of it. */
    val spacing = ${t.spacing}.dp
    /** Minimum size for anything tappable. Material recommends 48dp; raise it if you follow Material. */
    val touchTarget = ${t.touchTarget}.dp
}
${t.font.sans ? `\n/** Add the font to res/font; falls back to the system font if missing. */\nconst val JdsFontFamily = "${t.font.sans}"\n` : ""}
/** Durations in milliseconds. Keep UI feedback under 250. */
object JdsDuration {
${durations}
}

/** snappy: buttons and toggles. gentle: panels and messages. soft: voice orbs. */
object JdsSpring {
${springs}
}

object JdsEasing {
${curves}
}
`
}

/** A JS literal in the house style: { mass: 1, stiffness: 260 } and [0.22, 1, 0.36, 1]. */
const literal = (v: unknown): string =>
  Array.isArray(v)
    ? `[${v.map(literal).join(", ")}]`
    : typeof v === "object" && v
      ? `{ ${Object.entries(v)
          .map(([k, x]) => `${k}: ${literal(x)}`)
          .join(", ")} }`
      : JSON.stringify(v)

function toReactNative(t: Tokens) {
  const scheme = (mode: "light" | "dark") =>
    Object.entries(t.colors[mode])
      .map(([k, c]) => `    ${camel(k)}: "${c.hex}",`)
      .join("\n")
  const record = (o: Record<string, unknown>) =>
    Object.entries(o)
      .map(([k, v]) => `  ${/^\d/.test(k) ? `"${k}"` : camel(k)}: ${literal(v)},`)
      .join("\n")
  return `${header(t, "//")}

import { useColorScheme } from "react-native"

export const colors = {
  light: {
${scheme("light")}
  },
  dark: {
${scheme("dark")}
  },
} as const

export type ColorName = keyof typeof colors.light

/** The palette for the current system appearance. */
export function useColors() {
  return colors[useColorScheme() === "dark" ? "dark" : "light"]
}

/** A color at a fraction of its opacity, like bg-primary/80 on the web. */
export function alpha(color: string, amount: number) {
  const base = color.length === 9 ? parseInt(color.slice(7), 16) / 255 : 1
  const a = Math.round(Math.min(1, Math.max(0, base * amount)) * 255)
  return color.slice(0, 7) + a.toString(16).padStart(2, "0")
}

/** Corner radii in points. */
export const radius = {
${record(t.radius)}
} as const

/** Multiples of the ${t.spacing}pt base unit: space(4) is ${t.spacing * 4}. */
export const space = (n: number) => n * ${t.spacing}

/** Minimum size for anything tappable. */
export const touchTarget = ${t.touchTarget}
${t.font.sans ? `\n/** Load it with expo-font or link it natively; falls back to the system font if missing. */\nexport const fontFamily = "${t.font.sans}"\n` : ""}
/** Durations in milliseconds. Keep UI feedback under 250. */
export const duration = {
${record(t.duration)}
} as const

/** Cubic-bezier points, e.g. Easing.bezier(...easing.out) in Reanimated. */
export const easing = {
${record(t.easing)}
} as const

/** Reanimated withSpring configs. snappy: buttons. gentle: panels and messages. soft: voice orbs. */
export const spring = {
${record(t.spring)}
} as const
`
}
