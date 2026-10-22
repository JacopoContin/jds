"use client"

import * as React from "react"

import type { AmbientBackgroundVariant } from "@/components/effects/ambient-background"
import { CodePanel } from "@/components/studio/code-panel"
import { ControlGroup, Text } from "@/components/studio/controls"
import { studioMarkdown } from "@/components/studio/markdown"
import { StudioCode } from "@/components/studio/studio-code"
import { ThemeScope } from "@/components/studio/theme-scope"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { VoiceOrbVariant } from "@/components/voice/voice-orb"
import { deal, words, type Direction, type Heading, type Word } from "@/lib/directions"
import { ChevronLeftIcon, ShuffleIcon } from "@/lib/icons"
import { site } from "@/lib/site"
import { themeInstall, type ThemeChoice } from "@/lib/theme"
import LandingPage from "@/recipes/landing-page/landing-page"

const MAX_WORDS = 3

/** What a landing page shows before the builder types anything. */
const placeholder = { name: "Acme", description: "An assistant that does the busywork, so your team can do the work." }

/** The width the landing page is laid out at in a card, before it's scaled down to fit. */
const DESKTOP = 1280

type Copy = { name: string; description: string }

function LandingPreview({ direction, copy }: { direction: Direction; copy: Copy }) {
  const { theme } = direction
  return (
    <ThemeScope theme={theme} data-surface={theme.surface === "flat" ? undefined : theme.surface}>
      <LandingPage
        name={copy.name}
        description={copy.description}
        hero={theme.hero}
        background={theme.background as AmbientBackgroundVariant | "none"}
        orb={theme.orb as VoiceOrbVariant}
      />
    </ThemeScope>
  )
}

/** The page laid out at desktop width and scaled to the card, cropped to the top of the page. */
function ScaledPreview({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(0.3)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / DESKTOP))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className="relative aspect-4/3 overflow-hidden rounded-xl border">
      {/* w-320 is DESKTOP (1280px). */}
      <div
        className="absolute top-0 left-0 w-320 origin-top-left scale-(--scale)"
        style={{ "--scale": scale } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  )
}

/* ---------- Code ---------- */

const headingFonts: Record<Exclude<Heading, "body">, { name: string; options: string }> = {
  serif: { name: "Instrument_Serif", options: `weight: "400", ` },
  grotesk: { name: "Space_Grotesk", options: "" },
  bricolage: { name: "Bricolage_Grotesque", options: "" },
}

const headingLabel: Record<Heading, string> = {
  serif: "Instrument Serif",
  grotesk: "Space Grotesk",
  bricolage: "Bricolage Grotesque",
  body: "the body font",
}

const themeChoice = (d: Direction): ThemeChoice => ({
  color: d.theme.color,
  base: d.theme.base,
  radius: d.theme.radius,
  font: d.theme.font,
  surface: d.theme.surface,
  orb: d.theme.orb,
})

const installCommand = (d: Direction) =>
  themeInstall(themeChoice(d), [`${site.namespace}/landing-page`])
    .map((c) => `npx ${c}`)
    .join("\n")

/** The root layout's font setup: body, mono for tool names and code, and the heading face. */
function layoutCode(d: Direction) {
  const body = d.theme.font === "system" ? null : d.theme.font === "inter" ? "Inter" : "Geist"
  const heading = d.theme.heading === "body" ? null : headingFonts[d.theme.heading]
  const imports = [body, "Geist_Mono", heading?.name].filter(Boolean).join(", ")
  const lines = [`import { ${imports} } from "next/font/google"`, ""]
  if (body) lines.push(`const sans = ${body}({ variable: "--font-sans", subsets: ["latin"] })`)
  lines.push(`const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] })`)
  if (heading) lines.push(`const heading = ${heading.name}({ variable: "--font-heading", ${heading.options}subsets: ["latin"] })`)
  const vars = [body && "${sans.variable}", "${mono.variable}", heading && "${heading.variable}"].filter(Boolean).join(" ")
  lines.push("", `<html lang="en" className={\`${vars}\`}>`)
  return lines.join("\n")
}

const attr = (key: string, value: string) => (value.includes('"') ? `${key}={${JSON.stringify(value)}}` : `${key}="${value}"`)

function pageCode(d: Direction, copy: Copy) {
  const props = [
    attr("name", copy.name),
    attr("description", copy.description),
    d.theme.hero !== "left" && `hero="${d.theme.hero}"`,
    d.theme.background !== "none" && `background="${d.theme.background}"`,
    `orb="${d.theme.orb}"`,
  ].filter(Boolean)
  return `import LandingPage from "@/components/landing-page/landing-page"

export default function Page() {
  return (
    <LandingPage
      ${props.join("\n      ")}
    />
  )
}`
}

function markdown(d: Direction, copy: Copy) {
  const layout = layoutCode(d)
  return studioMarkdown({
    title: `Landing page: ${d.name}`,
    intro: `A landing page for ${copy.name}. ${d.rationale}`,
    choices: [
      ["Primary", d.theme.color],
      ["Base", d.theme.base],
      ["Radius", `${d.theme.radius}rem`],
      ["Body font", d.theme.font],
      ["Headings", headingLabel[d.theme.heading]],
      ["Surfaces", d.theme.surface],
      ["Background", d.theme.background],
      ["Hero", d.theme.hero === "left" ? "copy beside the product" : "copy above the product"],
    ],
    install: installCommand(d),
    placement: [
      "Load the fonts in app/layout.tsx and put their variables on <html>.",
      "Replace app/page.tsx with the code below.",
      "Rewrite the feature rows in components/landing-page/landing-page.tsx in your own words.",
    ],
    code: `// app/layout.tsx\n${layout}\n\n// app/page.tsx\n${pageCode(d, copy)}`,
  })
}

/* ---------- Builder ---------- */

export function DirectorBuilder() {
  const [brief, setBrief] = React.useState<Word[]>([])
  const [seed, setSeed] = React.useState(0)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [open, setOpen] = React.useState<Direction | null>(null)
  const dealt = deal(brief, seed)
  const copy: Copy = { name: name.trim() || placeholder.name, description: description.trim() || placeholder.description }

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem-1px)] lg:border-r lg:border-b-0">
        <h1 className="text-sm font-semibold">Creative director</h1>
        <ControlGroup title="Your product">
          <Text label="Name" value={name} onChange={setName} />
          <Text label="What it does, in one sentence" value={description} onChange={setDescription} />
        </ControlGroup>
        <ControlGroup title={`How should it feel? Up to ${MAX_WORDS}`}>
          <ToggleGroup
            multiple
            value={brief}
            onValueChange={(v) => {
              setBrief((v as Word[]).slice(0, MAX_WORDS))
              setSeed(0)
              setOpen(null)
            }}
            variant="outline"
            size="sm"
            className="flex-wrap"
            aria-label="Brief"
          >
            {words.map((w) => (
              <ToggleGroupItem key={w} value={w} disabled={brief.length >= MAX_WORDS && !brief.includes(w)}>
                {w[0].toUpperCase() + w.slice(1)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </ControlGroup>
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            setSeed((s) => s + 1)
            setOpen(null)
          }}
        >
          <ShuffleIcon data-icon="inline-start" />
          Shuffle
        </Button>
      </aside>

      {open ? (
        <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5 lg:h-[calc(100svh-3.5rem-1px)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={() => setOpen(null)}>
              <ChevronLeftIcon data-icon="inline-start" />
              {open.name}
            </Button>
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="preview" className="min-h-0">
            <div className="h-full overflow-y-auto rounded-2xl border">
              <LandingPreview direction={open} copy={copy} />
            </div>
          </TabsContent>
          <TabsContent value="code" className="overflow-y-auto">
            <StudioCode
              markdown={() => markdown(open, copy)}
              scopes={[
                {
                  value: "page",
                  label: "Your site",
                  code: pageCode(open, copy),
                  note: "app/page.tsx. The feature rows are placeholder copy in components/landing-page/landing-page.tsx.",
                },
              ]}
            >
              <CodePanel
                title="Install"
                code={installCommand(open)}
                note={`Installs the JDS style and the landing page with every component it uses, then the ${open.name} theme on top. Add the ${site.namespace} registry to components.json first.`}
              />
              <CodePanel
                title="Fonts"
                code={layoutCode(open)}
                note={`app/layout.tsx. Headings use ${headingLabel[open.theme.heading]}.`}
              />
            </StudioCode>
          </TabsContent>
        </Tabs>
      ) : (
        <main className="grid content-start gap-6 p-5 md:grid-cols-3 lg:overflow-y-auto">
          {dealt.map((d) => (
            <div key={d.name} className="flex min-w-0 flex-col gap-3">
              <div inert>
                <ScaledPreview>
                  <LandingPreview direction={d} copy={copy} />
                </ScaledPreview>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-medium">{d.name}</h2>
                <p className="text-sm text-muted-foreground">{d.rationale}</p>
              </div>
              <Button variant="outline" size="sm" className="self-start" onClick={() => setOpen(d)}>
                Open
              </Button>
            </div>
          ))}
        </main>
      )}
    </div>
  )
}
