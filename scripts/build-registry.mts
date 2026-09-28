/**
 * Generates registry.json from lib/docs.ts. Dependencies are read from each file's
 * imports so the registry can't drift from the code. Run `pnpm registry:build`.
 */
import { readFileSync, writeFileSync } from "node:fs"

import { components } from "../lib/docs.ts"
import { site } from "../lib/site.ts"

const NS = site.namespace
const importRe = /from\s+["']([^"']+)["']/g

function fileType(path: string) {
  if (path.startsWith("hooks/")) return "registry:hook"
  if (path.startsWith("lib/")) return "registry:lib"
  if (path.startsWith("components/ui/")) return "registry:ui"
  return "registry:component"
}

function analyze(paths: string[]) {
  const deps = new Set<string>()
  const regDeps = new Set<string>()
  for (const path of paths) {
    for (const [, spec] of readFileSync(path, "utf8").matchAll(importRe)) {
      if (spec.startsWith("@/")) {
        const local = spec.slice(2)
        if (paths.some((p) => p.startsWith(local))) continue
        if (local === "lib/icons" || local === "lib/motion") regDeps.add(`${NS}/utils`)
        else if (local === "lib/utils") continue
        else {
          const m = local.match(/^(?:components\/(?:ui|ai|voice)|hooks)\/(.+)$/)
          if (m) regDeps.add(`${NS}/${m[1]}`)
        }
      } else if (!spec.startsWith(".") && spec !== "react" && !spec.startsWith("react/") && !spec.startsWith("next/")) {
        const parts = spec.split("/")
        const pkg = spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
        if (pkg !== "react-dom") deps.add(pkg)
      }
    }
  }
  return { dependencies: [...deps].sort(), registryDependencies: [...regDeps].sort() }
}

const css = readFileSync("app/globals.css", "utf8")
function vars(selector: RegExp) {
  const block = css.match(selector)?.[1] ?? ""
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()])
  )
}
const light = vars(/:root,\s*\.light\s*{([^}]*)}/)
const dark = vars(/\.dark\s*{([^}]*)}/)
const { radius, ...lightColors } = light

const items: object[] = [
  {
    name: "style",
    type: "registry:style",
    title: `${site.name} style`,
    description: "Warm paper and charcoal themes, the ember accent, motion keyframes, and shared utilities.",
    dependencies: ["motion", "lucide-react", "tw-animate-css"],
    registryDependencies: [`${NS}/utils`],
    cssVars: {
      theme: {
        "color-ember": "var(--ember)",
        "color-ember-foreground": "var(--ember-foreground)",
        "color-ember-muted": "var(--ember-muted)",
        "color-success": "var(--success)",
        "color-success-foreground": "var(--success-foreground)",
        "color-warning": "var(--warning)",
        "color-warning-foreground": "var(--warning-foreground)",
        "color-info": "var(--info)",
        "color-info-foreground": "var(--info-foreground)",
        "color-destructive-foreground": "var(--destructive-foreground)",
        "ease-out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        "ease-in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
        "animate-shimmer": "shimmer 2s linear infinite",
        "animate-pulse-soft": "pulse-soft 1.6s var(--ease-in-out-quart) infinite",
      },
      light: { radius, ...lightColors },
      dark,
    },
    css: {
      "@keyframes shimmer": { from: { "background-position": "100% 0" }, to: { "background-position": "-100% 0" } },
      "@keyframes pulse-soft": { "0%, 100%": { opacity: "0.4" }, "50%": { opacity: "1" } },
    },
  },
  {
    name: "utils",
    type: "registry:lib",
    title: "Icons and motion",
    description: "Semantic icon map and motion presets shared by every component.",
    dependencies: ["motion", "lucide-react"],
    files: [
      { path: "lib/icons.ts", type: "registry:lib" },
      { path: "lib/motion.ts", type: "registry:lib" },
    ],
  },
  ...components.map((c) => ({
    name: c.slug,
    type: c.group === "components" ? "registry:ui" : "registry:component",
    title: c.title,
    description: c.description,
    ...analyze(c.files),
    files: c.files.map((path) => ({ path, type: fileType(path) })),
  })),
]

writeFileSync(
  "registry.json",
  JSON.stringify(
    { $schema: "https://ui.shadcn.com/schema/registry.json", name: "jds", homepage: site.url, items },
    null,
    2
  ) + "\n"
)
console.log(`registry.json: ${items.length} items`)
