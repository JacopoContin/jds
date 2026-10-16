/**
 * Surface lighting presets. Flat is the default and sets nothing: a soft foreground rim and no
 * inner light. Lit lights surfaces from above, like a physical panel: a dark rim where the edge
 * meets the page, a 1px highlight just inside it (brightest on top), and a tight contact shadow.
 * In dark, a faint white veil also lifts the surface off the page, keeping any base tint.
 * Metal goes further: a brushed grain, a diagonal specular band and a bevel that catches light
 * on top and bounces a little back at the bottom. Wells (tab lists, segmented tracks) sink.
 *
 * Set data-surface="<name>" on <html> for the whole app, or on any element to style only its subtree.
 *
 * Tokens: --surface-edge (ring-surface-edge / border-surface-edge), --surface-highlight
 * (inset-shadow-surface), --surface-well (inset-shadow-well), --surface-sheen and --surface-backdrop
 * (both through surface-sheen).
 */
export type SurfacePreset = {
  name: string
  label: string
  light: Record<string, string>
  dark: Record<string, string>
}

/**
 * Brushed-metal grain: fractal noise stretched along x, so it reads as fine horizontal streaks.
 * `ink` is the streak color (1 white, 0 black); `strength` its opacity.
 */
function brushed(ink: 0 | 1, strength: number) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='b'><feTurbulence type='fractalNoise' baseFrequency='0.003 0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${ink} 0 0 0 0 ${ink} 0 0 0 0 ${ink} ${strength} 0 0 0 ${-strength / 3}'/></filter><rect width='100%' height='100%' filter='url(#b)'/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export const surfacePresets: SurfacePreset[] = [
  {
    name: "lit",
    label: "Lit",
    light: {
      "surface-edge": "oklch(0 0 0 / 9%)",
      "surface-highlight":
        "inset 0 1px 0 0 oklch(1 0 0 / 90%), inset 0 -1px 0 0 oklch(0 0 0 / 4%), 0 1px 2px 0 oklch(0 0 0 / 6%)",
      "surface-well": "inset 0 1px 2px 0 oklch(0 0 0 / 8%), inset 0 0 0 1px oklch(0 0 0 / 4%)",
      "surface-sheen": "none",
      "surface-backdrop": "none",
    },
    dark: {
      "surface-edge": "oklch(0 0 0 / 25%)",
      "surface-highlight":
        "inset 0 1px 0 0 oklch(1 0 0 / 5%), inset 0 0 0 1px oklch(1 0 0 / 5%), inset 0 0 0 100vmax oklch(1 0 0 / 4.5%), 0 1px 3px 0 oklch(0 0 0 / 35%)",
      "surface-well": "inset 0 1px 2px 0 oklch(0 0 0 / 35%), inset 0 0 0 1px oklch(0 0 0 / 20%)",
      "surface-sheen": "none",
      "surface-backdrop": "none",
    },
  },
  {
    name: "metal",
    label: "Metal",
    light: {
      "surface-edge": "oklch(0 0 0 / 16%)",
      "surface-highlight":
        "inset 0 1px 0 0 oklch(1 0 0 / 100%), inset 0 -1px 0 0 oklch(0 0 0 / 8%), inset 0 0 0 1px oklch(1 0 0 / 50%), 0 1px 2px 0 oklch(0 0 0 / 10%), 0 4px 12px -4px oklch(0 0 0 / 12%)",
      "surface-well":
        "inset 0 1px 3px 0 oklch(0 0 0 / 14%), inset 0 0 0 1px oklch(0 0 0 / 8%), 0 1px 0 0 oklch(1 0 0 / 80%)",
      "surface-sheen": [
        brushed(0, 0.1),
        "linear-gradient(115deg, transparent 25%, oklch(1 0 0 / 55%) 42%, transparent 58%)",
        "linear-gradient(180deg, oklch(1 0 0 / 70%), oklch(1 0 0 / 0%) 45%, oklch(0 0 0 / 0%) 60%, oklch(0 0 0 / 6%))",
      ].join(", "),
      "surface-backdrop": "none",
    },
    dark: {
      "surface-edge": "oklch(0 0 0 / 50%)",
      "surface-highlight":
        "inset 0 1px 0 0 oklch(1 0 0 / 22%), inset 0 -1px 0 0 oklch(1 0 0 / 7%), inset 0 0 0 1px oklch(1 0 0 / 6%), inset 0 0 0 100vmax oklch(1 0 0 / 3%), 0 1px 2px 0 oklch(0 0 0 / 50%), 0 8px 20px -8px oklch(0 0 0 / 55%)",
      "surface-well":
        "inset 0 1px 3px 0 oklch(0 0 0 / 55%), inset 0 0 0 1px oklch(0 0 0 / 30%), 0 1px 0 0 oklch(1 0 0 / 6%)",
      "surface-sheen": [
        brushed(1, 0.09),
        "linear-gradient(115deg, transparent 25%, oklch(1 0 0 / 5%) 42%, transparent 58%)",
        "linear-gradient(180deg, oklch(1 0 0 / 9%), oklch(1 0 0 / 2%) 40%, oklch(0 0 0 / 0%) 60%, oklch(0 0 0 / 18%))",
      ].join(", "),
      "surface-backdrop": "none",
    },
  },
  {
    // Cards and menus become see-through and blur what's behind them. Glass sets its own card and
    // popover fill, so a base color's tint doesn't reach them.
    name: "glass",
    label: "Glass",
    light: {
      card: "oklch(1 0 0 / 55%)",
      popover: "oklch(1 0 0 / 72%)",
      "surface-edge": "oklch(0 0 0 / 8%)",
      "surface-highlight":
        "inset 0 1px 0 0 oklch(1 0 0 / 85%), inset 0 0 0 1px oklch(1 0 0 / 45%), inset 0 0 20px 0 oklch(1 0 0 / 25%), 0 8px 24px -10px oklch(0 0 0 / 18%)",
      "surface-well": "inset 0 1px 2px 0 oklch(0 0 0 / 10%), inset 0 0 0 1px oklch(0 0 0 / 5%)",
      "surface-sheen": "linear-gradient(180deg, oklch(1 0 0 / 35%), oklch(1 0 0 / 0%) 45%)",
      "surface-backdrop": "blur(20px) saturate(1.6)",
    },
    dark: {
      card: "oklch(0.26 0 0 / 50%)",
      popover: "oklch(0.24 0 0 / 70%)",
      "surface-edge": "oklch(1 0 0 / 10%)",
      "surface-highlight":
        "inset 0 1px 0 0 oklch(1 0 0 / 24%), inset 0 0 0 1px oklch(1 0 0 / 8%), inset 0 -1px 0 0 oklch(1 0 0 / 6%), inset 0 0 24px 0 oklch(1 0 0 / 4%), 0 10px 30px -12px oklch(0 0 0 / 65%)",
      "surface-well": "inset 0 1px 2px 0 oklch(0 0 0 / 35%), inset 0 0 0 1px oklch(0 0 0 / 20%)",
      "surface-sheen": "linear-gradient(180deg, oklch(1 0 0 / 7%), oklch(1 0 0 / 0%) 45%)",
      "surface-backdrop": "blur(20px) saturate(1.6)",
    },
  },
]
