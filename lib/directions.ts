/**
 * Brand directions for the Creative Director Studio: the look of a landing page for a product
 * with no brand yet. Each is built from the theme's choices plus a display face and a hero
 * layout, hand-picked so it holds together. The brief ranks them; the Studio deals three that
 * differ in primary, base, surface and type wherever it can, so the choice is a real one.
 */
export const words = ["calm", "bold", "warm", "precise", "playful", "serious", "soft", "technical"] as const

export type Word = (typeof words)[number]

export const headings = ["serif", "grotesk", "bricolage", "body"] as const

export type Heading = (typeof headings)[number]

export type DirectionTheme = {
  color: string
  base: string
  /** rem, one of the Customize radius steps. */
  radius: string
  font: string
  /** Display face for headings, or "body" to keep headings in the body font. */
  heading: Heading
  /** The landing page hero: copy beside the product, or above it. */
  hero: "left" | "centered"
  surface: string
  background: string
  orb: string
}

export type Direction = { name: string; rationale: string; tags: Word[]; theme: DirectionTheme }

export const directions: Direction[] = [
  {
    name: "Paper",
    rationale: "Warm grays and an amber accent, like a notebook. Quiet enough to work in all day.",
    tags: ["warm", "calm", "soft"],
    theme: { color: "amber", base: "stone", radius: "0.75", font: "geist", heading: "serif", hero: "left", surface: "flat", background: "none", orb: "aura" },
  },
  {
    name: "Instrument",
    rationale: "Tight corners, brushed metal and a blueprint grid. Reads like a tool.",
    tags: ["precise", "technical", "serious"],
    theme: { color: "neutral", base: "zinc", radius: "0.3", font: "geist", heading: "grotesk", hero: "left", surface: "metal", background: "grid", orb: "bars" },
  },
  {
    name: "Signal",
    rationale: "A familiar blue on clean grays, lit from above. The safe choice, done carefully.",
    tags: ["serious", "precise", "calm"],
    theme: { color: "blue", base: "neutral", radius: "0.5", font: "inter", heading: "body", hero: "centered", surface: "lit", background: "none", orb: "ring" },
  },
  {
    name: "Bloom",
    rationale: "Rose on warm stone, round corners and a drifting mesh. Friendly without being loud.",
    tags: ["playful", "warm", "soft"],
    theme: { color: "rose", base: "stone", radius: "1", font: "inter", heading: "bricolage", hero: "centered", surface: "lit", background: "mesh", orb: "liquid" },
  },
  {
    name: "Nocturne",
    rationale: "Violet glass over an aurora. Built to be seen in the dark.",
    tags: ["bold", "technical"],
    theme: { color: "violet", base: "slate", radius: "0.75", font: "geist", heading: "bricolage", hero: "centered", surface: "glass", background: "aurora", orb: "plasma" },
  },
  {
    name: "Field",
    rationale: "Green on warm stone with a dot field. Grounded, a little outdoors.",
    tags: ["calm", "warm", "technical"],
    theme: { color: "emerald", base: "stone", radius: "0.625", font: "system", heading: "grotesk", hero: "left", surface: "lit", background: "dots", orb: "particles" },
  },
  {
    name: "Plain",
    rationale: "Square corners, system type, no color. All the character is in the layout.",
    tags: ["bold", "serious", "precise"],
    theme: { color: "neutral", base: "neutral", radius: "0", font: "system", heading: "body", hero: "left", surface: "flat", background: "none", orb: "halftone" },
  },
  {
    name: "Ember",
    rationale: "Amber under a spotlight on cool metal. Confident, a little dramatic.",
    tags: ["bold", "warm"],
    theme: { color: "amber", base: "zinc", radius: "0.5", font: "geist", heading: "bricolage", hero: "left", surface: "metal", background: "spotlight", orb: "liquid" },
  },
  {
    name: "Lagoon",
    rationale: "Glass over slow waves, round and soft. Made for voice.",
    tags: ["calm", "soft", "playful"],
    theme: { color: "blue", base: "slate", radius: "1", font: "inter", heading: "serif", hero: "centered", surface: "glass", background: "waves", orb: "wave" },
  },
]

/** How many of primary, base, surface and heading font two directions don't share, 0 to 4. */
const difference = (a: Direction, b: Direction) =>
  (["color", "base", "surface", "heading"] as const).filter((k) => a.theme[k] !== b.theme[k]).length

/**
 * Three directions for a brief. The best matches come first; `seed` (Shuffle) rotates which
 * match leads, so a new deal still fits the brief. With no words, every direction matches.
 * Fitting the brief beats being different: a match that shares a choice or two with another
 * is dealt before a direction that ignores the brief.
 */
export function deal(brief: readonly Word[], seed = 0): Direction[] {
  const score = (d: Direction) => d.tags.filter((t) => brief.includes(t)).length
  const matches = directions.filter((d) => !brief.length || score(d) > 0).sort((a, b) => score(b) - score(a))
  const k = matches.length ? seed % matches.length : 0
  const rotated = [...matches.slice(k), ...matches.slice(0, k)]
  const rest = directions.filter((d) => !matches.includes(d))

  const picked: Direction[] = []
  const fill = (pool: Direction[], minDifference: number) => {
    for (const d of pool)
      if (picked.length < 3 && !picked.includes(d) && picked.every((p) => difference(p, d) >= minDifference))
        picked.push(d)
  }
  for (const min of [4, 3, 2]) fill(rotated, min)
  for (const min of [4, 3, 2]) fill(rest, min)
  fill([...rotated, ...rest], 0)
  return picked
}
