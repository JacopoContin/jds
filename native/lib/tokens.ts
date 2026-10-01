// JDS tokens: primary neutral, base neutral, radius 0.625rem, font geist.
// Generated from https://jds-ruddy.vercel.app/tokens/{format}. Don't edit by hand; download again to update.

import { useColorScheme } from "react-native"

export const colors = {
  light: {
    background: "#fafafa",
    foreground: "#0a0a0a",
    card: "#ffffff",
    cardForeground: "#0a0a0a",
    popover: "#ffffff",
    popoverForeground: "#0a0a0a",
    primary: "#171717",
    primaryForeground: "#fafafa",
    secondary: "#f0f0f0",
    secondaryForeground: "#171717",
    muted: "#f2f2f2",
    mutedForeground: "#696969",
    accent: "#eeeeee",
    accentForeground: "#171717",
    destructive: "#e7000b",
    destructiveForeground: "#bb0916",
    border: "#e1e1e1",
    input: "#dbdbdb",
    ring: "#808080",
    success: "#3b9555",
    successForeground: "#236436",
    warning: "#dfa11a",
    warningForeground: "#8a5600",
    info: "#2b88c0",
    infoForeground: "#176490",
    chart1: "#d4d4d4",
    chart2: "#737373",
    chart3: "#525252",
    chart4: "#404040",
    chart5: "#262626",
    sidebar: "#f7f7f7",
    sidebarForeground: "#0a0a0a",
    sidebarPrimary: "#171717",
    sidebarPrimaryForeground: "#fafafa",
    sidebarAccent: "#eeeeee",
    sidebarAccentForeground: "#171717",
    sidebarBorder: "#e1e1e1",
    sidebarRing: "#808080",
  },
  dark: {
    background: "#131313",
    foreground: "#ebebeb",
    card: "#181818",
    cardForeground: "#ebebeb",
    popover: "#1c1c1c",
    popoverForeground: "#ebebeb",
    primary: "#ebebeb",
    primaryForeground: "#161616",
    secondary: "#242424",
    secondaryForeground: "#ebebeb",
    muted: "#202020",
    mutedForeground: "#989898",
    accent: "#262626",
    accentForeground: "#ebebeb",
    destructive: "#ef6661",
    destructiveForeground: "#fa8880",
    border: "#ffffff17",
    input: "#ffffff21",
    ring: "#717171",
    success: "#62bb78",
    successForeground: "#89d298",
    warning: "#e4b750",
    warningForeground: "#efc876",
    info: "#60a7d6",
    infoForeground: "#8ec5ec",
    chart1: "#d4d4d4",
    chart2: "#737373",
    chart3: "#525252",
    chart4: "#404040",
    chart5: "#262626",
    sidebar: "#161616",
    sidebarForeground: "#ebebeb",
    sidebarPrimary: "#ebebeb",
    sidebarPrimaryForeground: "#161616",
    sidebarAccent: "#242424",
    sidebarAccentForeground: "#ebebeb",
    sidebarBorder: "#ffffff17",
    sidebarRing: "#717171",
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
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  "2xl": 18,
  "3xl": 22,
  "4xl": 26,
} as const

/** Multiples of the 4pt base unit: space(4) is 16. */
export const space = (n: number) => n * 4

/** Minimum size for anything tappable. */
export const touchTarget = 44

/** Load it with expo-font or link it natively; falls back to the system font if missing. */
export const fontFamily = "Geist"

/** Durations in milliseconds. Keep UI feedback under 250. */
export const duration = {
  instant: 100,
  fast: 160,
  base: 240,
  slow: 400,
} as const

/** Cubic-bezier points, e.g. Easing.bezier(...easing.out) in Reanimated. */
export const easing = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.76, 0, 0.24, 1],
} as const

/** Reanimated withSpring configs. snappy: buttons. gentle: panels and messages. soft: voice orbs. */
export const spring = {
  snappy: { mass: 0.6, stiffness: 520, damping: 34 },
  gentle: { mass: 1, stiffness: 260, damping: 30 },
  soft: { mass: 1, stiffness: 120, damping: 18 },
} as const
