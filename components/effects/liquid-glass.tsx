"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * Whether backdrop-filter can take an SVG filter. Only Chromium renders it; Safari and Firefox
 * parse it and show nothing, so feature detection alone would blank the glass there.
 */
function supportsRefraction() {
  if (typeof navigator === "undefined") return false
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands
  return !!brands?.some((b) => b.brand === "Chromium")
}

/**
 * A displacement map for a rounded rectangle: neutral gray in the middle, and near the rim a
 * push that pulls the backdrop in from further inside, the way the curved edge of a glass
 * lens does. Red moves along x, green along y. Drawn at half size; the filter scales it up.
 */
function displacementMap(width: number, height: number, radius: number, bezel: number) {
  const s = 0.5
  const w = Math.max(1, Math.round(width * s))
  const h = Math.max(1, Math.round(height * s))
  const r = Math.min(radius, width / 2, height / 2) * s
  const b = Math.max(1, bezel * s)
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""
  const img = ctx.createImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Nearest point on the rectangle shrunk by the radius: the outward normal points from there.
      const qx = Math.min(Math.max(x + 0.5, r), w - r)
      const qy = Math.min(Math.max(y + 0.5, r), h - r)
      let nx = x + 0.5 - qx
      let ny = y + 0.5 - qy
      const len = Math.hypot(nx, ny)
      let depth: number
      if (len > 0) {
        nx /= len
        ny /= len
        depth = r - len
      } else {
        // Inside the straight part: the closest side decides the normal.
        const sides = [x + 0.5, w - x - 0.5, y + 0.5, h - y - 0.5]
        const i = sides.indexOf(Math.min(...sides))
        ;[nx, ny] = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ][i]
        depth = sides[i]
      }
      // Strongest at the rim, easing to nothing at the bezel's inner edge.
      const m = depth < b ? (1 - Math.max(0, depth) / b) ** 2 : 0
      const o = (y * w + x) * 4
      img.data[o] = 128 - nx * m * 127
      img.data[o + 1] = 128 - ny * m * 127
      img.data[o + 2] = 128
      img.data[o + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL()
}

/**
 * Liquid glass: a see-through surface that blurs and tints what's behind it, with light on its
 * rim. In Chromium the backdrop also bends at the edges like a lens; elsewhere it falls back to
 * the blur and the rim light, which still reads as glass. Round it with a className
 * (rounded-full, rounded-3xl); the refraction follows the corner radius.
 */
function LiquidGlass({
  refraction = 24,
  bezel = 24,
  blur = 6,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * How far the edge bends the backdrop, in px. 0 turns refraction off. Capped just under the
   * bezel width: past that the rim mirrors the backdrop instead of squeezing it like a lens.
   */
  refraction?: number
  /** Width of the curved rim that bends light, in px. */
  bezel?: number
  /** Backdrop blur in px. */
  blur?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const id = `jds-glass-${React.useId().replace(/:/g, "")}`
  const [map, setMap] = React.useState<{ href: string; width: number; height: number }>()

  React.useEffect(() => {
    const el = ref.current
    if (!el || refraction <= 0 || !supportsRefraction()) return
    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
      setMap({ href: displacementMap(width, height, radius, bezel), width, height })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [refraction, bezel])

  // Set here rather than in a style prop: the filter id only exists once the map is drawn.
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.backdropFilter = map ? `url(#${id}) blur(${blur}px) saturate(1.6)` : `blur(${blur * 2}px) saturate(1.6)`
  }, [map, id, blur])

  return (
    <div
      ref={ref}
      data-slot="liquid-glass"
      data-refraction={map ? "" : undefined}
      className={cn("relative isolate bg-glass inset-shadow-glass", className)}
      {...props}
    >
      {map && (
        <svg aria-hidden className="pointer-events-none absolute size-0">
          <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage
              href={map.href}
              x="0"
              y="0"
              width={map.width}
              height={map.height}
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={Math.min(refraction, bezel * 0.9)} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      {children}
    </div>
  )
}

export { LiquidGlass }
