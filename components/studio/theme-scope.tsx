"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "cn"

import { bricolage, grotesk, sans, serif } from "@/app/fonts"
import { baseColorVars, baseColors, colorPresets } from "@/lib/colors"
import type { DirectionTheme, Heading } from "@/lib/directions"
import { flatSurface, surfacePresets } from "@/lib/surfaces"
import { SYSTEM_FONT } from "@/lib/theme"

const fontFamily: Record<string, string> = {
  geist: sans.style.fontFamily,
  inter: "var(--font-inter)",
  system: SYSTEM_FONT,
}

const headingFamily: Record<Heading, string> = {
  serif: serif.style.fontFamily,
  grotesk: grotesk.style.fontFamily,
  bricolage: bricolage.style.fontFamily,
  body: "var(--font-sans)",
}

/**
 * The token values a theme sets, for one mode. Neutral is a base with no chroma, so every color
 * token is set and nothing leaks in from the site's own theme.
 */
function themeVars(t: DirectionTheme, mode: "light" | "dark") {
  const base = baseColors.find((b) => b.name === t.base) ?? { name: "neutral", label: "Neutral", hue: 0, chroma: 0 }
  const surface = surfacePresets.find((p) => p.name === t.surface) ?? flatSurface
  const vars: Record<string, string> = {
    ...baseColorVars(base, mode),
    ...colorPresets.find((p) => p.name === t.color)?.[mode],
    ...surface[mode],
    radius: `${t.radius}rem`,
    "font-sans": fontFamily[t.font] ?? fontFamily.geist,
    "font-heading": headingFamily[t.heading],
  }
  return Object.fromEntries(Object.entries(vars).map(([k, v]) => [`--${k}`, v])) as React.CSSProperties
}

/**
 * Shows its children in another theme without touching the site's: the theme's tokens are set on
 * this element, and every token class inside reads them. Follows light and dark mode.
 */
export function ThemeScope({
  theme,
  className,
  ...props
}: React.ComponentProps<"div"> & { theme: DirectionTheme }) {
  const { resolvedTheme } = useTheme()
  const mode = resolvedTheme === "light" ? "light" : "dark"
  return (
    <div
      data-slot="theme-scope"
      className={cn("bg-background font-sans text-foreground", className)}
      style={themeVars(theme, mode)}
      {...props}
    />
  )
}
