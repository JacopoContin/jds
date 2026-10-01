/**
 * OKLCH to the color spaces native platforms take. Out-of-gamut colors are clipped per
 * channel, the same thing browsers do today, so native matches what the web shows.
 */
export type Oklch = { l: number; c: number; h: number; alpha: number }
export type Rgb = { r: number; g: number; b: number; alpha: number }

/** Parses `oklch(L C H)` or `oklch(L C H / A)`; L and A may be numbers or percentages. */
export function parseOklch(value: string): Oklch | null {
  const m = /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/.exec(value.trim())
  if (!m) return null
  const num = (s: string) => (s.endsWith("%") ? parseFloat(s) / 100 : parseFloat(s))
  return { l: num(m[1]), c: parseFloat(m[2]), h: parseFloat(m[3]), alpha: m[4] ? num(m[4]) : 1 }
}

function toLinearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
}

/** sRGB and Display P3 share this transfer curve. */
const encode = (x: number) => {
  const v = Math.min(1, Math.max(0, x))
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
}

const round = (x: number) => Math.round(x * 10000) / 10000

export function oklchToSrgb(color: Oklch): Rgb {
  const [r, g, b] = toLinearSrgb(color).map(encode)
  return { r: round(r), g: round(g), b: round(b), alpha: round(color.alpha) }
}

/** Display P3, for Apple platforms: saturated primaries keep more of their chroma than in sRGB. */
export function oklchToP3(color: Oklch): Rgb {
  const [r, g, b] = toLinearSrgb(color)
  const p3 = [
    0.8224621209 * r + 0.177538 * g,
    0.0331941989 * r + 0.9668058011 * g,
    0.0170826307 * r + 0.0723974407 * g + 0.9105199286 * b,
  ].map(encode)
  return { r: round(p3[0]), g: round(p3[1]), b: round(p3[2]), alpha: round(color.alpha) }
}

const hex2 = (x: number) =>
  Math.round(x * 255)
    .toString(16)
    .padStart(2, "0")

/** `#rrggbb`, or `#rrggbbaa` when translucent. */
export function toHex({ r, g, b, alpha }: Rgb) {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${alpha < 1 ? hex2(alpha) : ""}`
}
