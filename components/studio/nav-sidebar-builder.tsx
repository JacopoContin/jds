"use client"

import * as React from "react"
import { cn } from "cn"

import {
  NavSidebar,
  NavSidebarContent,
  NavSidebarFooter,
  NavSidebarGroup,
  NavSidebarHeader,
  NavSidebarInset,
  NavSidebarItem,
  NavSidebarLayout,
  NavSidebarText,
  NavSidebarTrigger,
  type NavSidebarCollapse,
  type NavSidebarIndicator,
  type NavSidebarMotion,
  type NavSidebarSide,
  type NavSidebarSurface,
  type NavSidebarVariant,
} from "@/components/navigation/nav-sidebar"
import { ControlGroup, Range, Segmented, Toggle } from "@/components/studio/controls"
import { render, type Node } from "@/components/studio/jsx"
import { installFromCode, studioMarkdown } from "@/components/studio/markdown"
import { StudioCode } from "@/components/studio/studio-code"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { VoiceOrb } from "@/components/voice/voice-orb"
import {
  AgentIcon,
  CalendarIcon,
  ChartIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  SelectIcon,
  SettingsIcon,
  SparkleIcon,
} from "@/lib/icons"

type Config = {
  side: NavSidebarSide
  variant: NavSidebarVariant
  surface: NavSidebarSurface
  collapse: NavSidebarCollapse
  expandOnHover: boolean
  width: number
  railWidth: number
  indicator: NavSidebarIndicator
  density: "compact" | "comfortable"
  motion: NavSidebarMotion
  /** Where the collapse button sits. */
  trigger: "page" | "sidebar"
  groupLabels: boolean
  badges: boolean
  /** An entry in the footer that opens the agent. */
  agent: "orb" | "sparkle" | "off"
}

type Frame = "desktop" | "phone"

const defaults: Config = {
  side: "left",
  variant: "docked",
  surface: "sidebar",
  collapse: "icons",
  expandOnHover: false,
  width: 256,
  railWidth: 56,
  indicator: "fill",
  density: "comfortable",
  motion: "spring",
  trigger: "page",
  groupLabels: true,
  badges: true,
  agent: "orb",
}

const presets: { name: string; body: string; config: Config }[] = [
  { name: "Classic", body: "Docked, collapses to icons", config: defaults },
  {
    name: "Floating",
    body: "Peeks open on hover",
    config: { ...defaults, variant: "floating", expandOnHover: true, indicator: "bar", surface: "background" },
  },
  {
    name: "Inset",
    body: "The page sits in a card",
    config: { ...defaults, variant: "inset", trigger: "sidebar", density: "compact" },
  },
  {
    name: "Off-canvas",
    body: "Slides out for focus",
    config: { ...defaults, collapse: "offcanvas", indicator: "text", agent: "sparkle" },
  },
  {
    name: "Always open",
    body: "No collapse, compact",
    config: { ...defaults, collapse: "none", density: "compact", badges: false, trigger: "sidebar" },
  },
]

const mainItems = [
  { id: "home", label: "Home", icon: <HomeIcon /> },
  { id: "inbox", label: "Inbox", icon: <InboxIcon />, badge: 4 },
  { id: "agents", label: "Agents", icon: <AgentIcon /> },
  { id: "calendar", label: "Calendar", icon: <CalendarIcon /> },
  { id: "reports", label: "Reports", icon: <ChartIcon /> },
]
const projects = ["Website", "Mobile app", "Research"]

/** Props that differ from the component's defaults, as JSX attributes. */
function sidebarProps(c: Config) {
  const p: string[] = []
  if (c.side !== "left") p.push(`side="${c.side}"`)
  if (c.variant !== "docked") p.push(`variant="${c.variant}"`)
  if (c.surface !== "sidebar" && c.variant !== "inset") p.push(`surface="${c.surface}"`)
  if (c.collapse !== "icons") p.push(`collapse="${c.collapse}"`)
  if (c.expandOnHover && c.collapse === "icons") p.push("expandOnHover")
  if (c.width !== 256) p.push(`width={${c.width}}`)
  if (c.railWidth !== 56 && c.collapse === "icons") p.push(`railWidth={${c.railWidth}}`)
  if (c.indicator !== "fill") p.push(`indicator="${c.indicator}"`)
  if (c.density !== "comfortable") p.push(`density="${c.density}"`)
  if (c.motion !== "spring") p.push(`motion="${c.motion}"`)
  return p
}

function generateCode(c: Config) {
  const inSidebar = c.trigger === "sidebar" && c.collapse !== "none"
  const parts = [
    "NavSidebar",
    "NavSidebarContent",
    "NavSidebarFooter",
    "NavSidebarGroup",
    "NavSidebarHeader",
    "NavSidebarInset",
    "NavSidebarItem",
    "NavSidebarLayout",
    "NavSidebarText",
    "NavSidebarTrigger",
  ]
  const imports = [
    `"use client"\n`,
    `import Link from "next/link"`,
    `import { usePathname } from "next/navigation"`,
    `import {\n${parts.map((p) => `  ${p},`).join("\n")}\n} from "@/components/navigation/nav-sidebar"`,
  ]
  if (c.agent === "orb") imports.push(`import { VoiceOrb } from "@/components/voice/voice-orb"`)
  const icons = ["HomeIcon", "InboxIcon", "SettingsIcon"]
  if (c.agent === "sparkle") icons.push("SparkleIcon")
  imports.push(`import { ${icons.sort().join(", ")} } from "@/lib/icons"`)

  // Pages render through your router's Link; anything else (like opening the agent) is a button.
  const link = (icon: string, label: string, extra: string[] = []): Node => {
    const path = `/${label.toLowerCase()}`
    return {
      tag: "NavSidebarItem",
      props: [`render={<Link href="${path}" />}`, `icon={${icon}}`, `active={pathname.startsWith("${path}")}`, ...extra],
      text: label,
    }
  }

  const header: Node = {
    tag: "NavSidebarHeader",
    props: inSidebar ? ['className="flex-row items-center group-data-rail/nav-sidebar:flex-col"'] : [],
    children: [
      { tag: "NavSidebarText", props: ['className="flex-1 px-2 font-semibold"'], text: "Acme" },
      ...(inSidebar ? [{ tag: "NavSidebarTrigger" }] : []),
    ],
  }

  const footer: Node[] = []
  if (c.agent !== "off")
    footer.push(
      {
        tag: "NavSidebarItem",
        props: [`icon={${c.agent === "orb" ? '<VoiceOrb variant="aura" size={16} />' : "<SparkleIcon />"}}`, "onClick={onAskAgent}"],
        text: "Ask agent",
      },
    )
  footer.push(link("<SettingsIcon />", "Settings"))

  const tree: Node = {
    tag: "NavSidebarLayout",
    props: ['className="h-dvh"'],
    children: [
      {
        tag: "NavSidebar",
        props: sidebarProps(c),
        children: [
          header,
          {
            tag: "NavSidebarContent",
            children: [
              {
                tag: "NavSidebarGroup",
                children: [
                  link("<HomeIcon />", "Home"),
                  link("<InboxIcon />", "Inbox", c.badges ? ["badge={4}"] : []),
                ],
              },
              {
                tag: "NavSidebarGroup",
                props: c.groupLabels ? ['label="Projects"'] : [],
                children: ["{/* More NavSidebarItems */}"],
              },
            ],
          },
          { tag: "NavSidebarFooter", children: footer },
        ],
      },
      {
        tag: "NavSidebarInset",
        children: [
          {
            tag: "header",
            props: ['className="flex h-12 items-center gap-2 border-b px-3"'],
            children: [
              inSidebar
                ? "{/* Brings the sidebar back when it's out of view, e.g. on phones */}"
                : "{/* Collapses the sidebar; on phones it opens the overlay */}",
              { tag: "NavSidebarTrigger", props: inSidebar ? ["onlyWhenHidden"] : [] },
            ],
          },
          "{children}",
        ],
      },
    ],
  }

  const props = c.agent === "off" ? "{ children }: { children: React.ReactNode }" : "{\n  children,\n  onAskAgent,\n}: {\n  children: React.ReactNode\n  /** Open your agent panel or voice call. */\n  onAskAgent: () => void\n}"
  return `${imports.join("\n")}

export function AppShell(${props}) {
  const pathname = usePathname()
  return (
${render(tree, 2)}
  )
}`
}

function describe(c: Config) {
  return {
    variant: {
      docked: "docked against the edge",
      floating: "a floating card, inset from the edges",
      inset: "on the sidebar color, with the page in a rounded card",
    }[c.variant],
    collapse: {
      icons: `shrinks to a ${c.railWidth}px rail of icons${c.expandOnHover ? " that peeks open on hover" : ""}`,
      offcanvas: "slides fully off screen",
      none: "always open",
    }[c.collapse],
  }
}

function generateMarkdown(c: Config) {
  const code = generateCode(c)
  const d = describe(c)
  return studioMarkdown({
    title: "Sidebar navigation",
    intro: "App navigation beside the page, with these collapse and style choices.",
    choices: [
      ["Side", c.side],
      ["Style", d.variant],
      ["Surface", c.variant === "inset" ? "sidebar color" : c.surface],
      ["Width", `${c.width}px`],
      ["Collapsed", d.collapse],
      ["Toggle", c.collapse === "none" ? "none" : `button in the ${c.trigger === "page" ? "page header" : "sidebar header"}, and ⌘B`],
      ["Current page", { fill: "filled background", bar: "accent bar on the edge", text: "bold text" }[c.indicator]],
      ["Density", c.density],
      ["Agent entry", c.agent === "off" ? "off" : `in the footer, with ${c.agent === "orb" ? "a small Voice Orb" : "a sparkle icon"}`],
    ],
    install: installFromCode(code),
    placement: [
      "Wrap the app shell (usually the root layout) in NavSidebarLayout with a height, e.g. h-dvh.",
      "Put NavSidebar and NavSidebarInset inside it; your pages render in the inset.",
      "Mark the current page with active, and pass your router's link with render={<Link href=… />}.",
      "Below 768px of layout width it becomes an overlay with a scrim; change that with breakpoint.",
    ],
    code,
    notes: [
      "Pass open and onOpenChange to NavSidebarLayout to remember the state, e.g. in a cookie.",
      "On the rail, labels hide and each item shows its label in a tooltip.",
    ],
  })
}

function Preview({ c, open, setOpen }: { c: Config; open: boolean; setOpen: (o: boolean) => void }) {
  const [active, setActive] = React.useState("home")
  const inSidebar = c.trigger === "sidebar" && c.collapse !== "none"
  const item = (id: string, label: string, icon: React.ReactNode, badge?: number) => (
    <NavSidebarItem
      key={id}
      icon={icon}
      active={active === id}
      badge={c.badges ? badge : undefined}
      onClick={() => setActive(id)}
    >
      {label}
    </NavSidebarItem>
  )

  return (
    <NavSidebarLayout open={open} onOpenChange={setOpen}>
      <NavSidebar
        side={c.side}
        variant={c.variant}
        surface={c.surface}
        collapse={c.collapse}
        expandOnHover={c.expandOnHover}
        width={c.width}
        railWidth={c.railWidth}
        indicator={c.indicator}
        density={c.density}
        motion={c.motion}
      >
        <NavSidebarHeader className={cn(inSidebar && "flex-row items-center group-data-rail/nav-sidebar:flex-col")}>
          <button
            type="button"
            className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-md px-2 text-left hover:bg-sidebar-accent/60"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
              A
            </span>
            <NavSidebarText className="flex-1 font-semibold">Acme</NavSidebarText>
            <NavSidebarText className="text-muted-foreground">
              <SelectIcon className="size-4" />
            </NavSidebarText>
          </button>
          {inSidebar && <NavSidebarTrigger />}
        </NavSidebarHeader>
        <NavSidebarContent>
          <NavSidebarGroup>{mainItems.map((i) => item(i.id, i.label, i.icon, i.badge))}</NavSidebarGroup>
          <NavSidebarGroup label={c.groupLabels ? "Projects" : undefined}>
            {projects.map((p) => item(p, p, <FolderIcon />))}
          </NavSidebarGroup>
        </NavSidebarContent>
        <NavSidebarFooter>
          {c.agent !== "off" &&
            item(
              "agent",
              "Ask agent",
              c.agent === "orb" ? <VoiceOrb variant="aura" size={16} state="idle" /> : <SparkleIcon />,
            )}
          {item("settings", "Settings", <SettingsIcon />)}
        </NavSidebarFooter>
      </NavSidebar>
      <NavSidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
          <NavSidebarTrigger onlyWhenHidden={inSidebar} />
          <span className="text-sm font-medium capitalize">
            {[...mainItems, { id: "agent", label: "Agent" }, { id: "settings", label: "Settings" }].find(
              (i) => i.id === active,
            )?.label ?? active}
          </span>
        </header>
        <div className="flex flex-col gap-4 p-6">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-2 gap-3 @lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
      </NavSidebarInset>
    </NavSidebarLayout>
  )
}

export function NavSidebarBuilder() {
  const [c, setC] = React.useState<Config>(defaults)
  const [open, setOpen] = React.useState(true)
  const [frame, setFrame] = React.useState<Frame>("desktop")
  const set =
    <K extends keyof Config>(key: K) =>
    (value: Config[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem-1px)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Sidebar navigation</h1>
          <Button variant="ghost" size="xs" onClick={() => setC(defaults)}>
            Reset
          </Button>
        </div>
        <ControlGroup title="Presets">
          <div className="flex flex-col gap-2">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setC(p.config)
                  setOpen(true)
                }}
                className="flex items-baseline justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="font-medium">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground">{p.body}</span>
              </button>
            ))}
          </div>
        </ControlGroup>
        <ControlGroup title="Layout">
          <Segmented
            label="Side"
            value={c.side}
            onChange={set("side")}
            options={[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
          />
          <Segmented
            label="Style"
            value={c.variant}
            onChange={set("variant")}
            options={[
              { value: "docked", label: "Docked" },
              { value: "floating", label: "Floating" },
              { value: "inset", label: "Inset" },
            ]}
          />
          {c.variant !== "inset" && (
            <Segmented
              label="Surface"
              value={c.surface}
              onChange={set("surface")}
              options={[
                { value: "sidebar", label: "Sidebar" },
                { value: "background", label: "Page" },
                { value: "glass", label: "Glass" },
              ]}
            />
          )}
          <Range label="Width" value={c.width} min={200} max={320} step={8} unit="px" onChange={set("width")} />
        </ControlGroup>
        <ControlGroup title="Collapsing">
          <Segmented
            label="When collapsed"
            value={c.collapse}
            onChange={(v) => {
              set("collapse")(v)
              if (v === "none") setOpen(true)
            }}
            options={[
              { value: "icons", label: "Icons" },
              { value: "offcanvas", label: "Hidden" },
              { value: "none", label: "Never" },
            ]}
          />
          {c.collapse === "icons" && (
            <>
              <Range
                label="Rail width"
                value={c.railWidth}
                min={48}
                max={72}
                step={4}
                unit="px"
                onChange={set("railWidth")}
              />
              <Toggle label="Peek open on hover" checked={c.expandOnHover} onChange={set("expandOnHover")} />
            </>
          )}
          {c.collapse !== "none" && (
            <Segmented
              label="Toggle button"
              value={c.trigger}
              onChange={set("trigger")}
              options={[
                { value: "page", label: "Page header" },
                { value: "sidebar", label: "Sidebar" },
              ]}
            />
          )}
          <Segmented
            label="Motion"
            value={c.motion}
            onChange={set("motion")}
            options={[
              { value: "spring", label: "Spring" },
              { value: "tween", label: "Tween" },
            ]}
          />
        </ControlGroup>
        <ControlGroup title="Items">
          <Segmented
            label="Current page"
            value={c.indicator}
            onChange={set("indicator")}
            options={[
              { value: "fill", label: "Fill" },
              { value: "bar", label: "Bar" },
              { value: "text", label: "Bold" },
            ]}
          />
          <Segmented
            label="Density"
            value={c.density}
            onChange={set("density")}
            options={[
              { value: "compact", label: "Compact" },
              { value: "comfortable", label: "Comfortable" },
            ]}
          />
          <Toggle label="Group labels" checked={c.groupLabels} onChange={set("groupLabels")} />
          <Toggle label="Badges" checked={c.badges} onChange={set("badges")} />
          <Segmented
            label="Agent entry"
            value={c.agent}
            onChange={set("agent")}
            options={[
              { value: "orb", label: "Orb" },
              { value: "sparkle", label: "Sparkle" },
              { value: "off", label: "Off" },
            ]}
          />
        </ControlGroup>
      </aside>

      <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5 lg:h-[calc(100svh-3.5rem-1px)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <ToggleGroup
              value={[frame]}
              onValueChange={(v) => v[0] && setFrame(v[0] as Frame)}
              variant="outline"
              size="sm"
              aria-label="Preview width"
            >
              <ToggleGroupItem value="desktop">Desktop</ToggleGroupItem>
              <ToggleGroupItem value="phone">Phone</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <TabsContent value="preview" className="flex min-h-0 flex-col">
          <div className="flex h-160 justify-center lg:h-auto lg:min-h-0 lg:flex-1">
            <div
              className={cn(
                "@container relative h-full w-full overflow-hidden rounded-2xl border bg-background transition-all duration-300",
                frame === "phone" ? "max-w-sm" : "max-w-full",
              )}
            >
              <Preview c={c} open={open} setOpen={setOpen} />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {frame === "phone"
              ? "Narrow layouts open the sidebar as an overlay. Tap the toggle in the header."
              : c.collapse === "none"
                ? "This sidebar never collapses."
                : "Press ⌘B or the toggle to collapse it. Click items to move the current-page marker."}
          </p>
        </TabsContent>
        <TabsContent value="code" className="min-h-0 overflow-y-auto">
          <StudioCode
            markdown={() => generateMarkdown(c)}
            scopes={[
              {
                value: "instance",
                label: "App shell",
                code: generateCode(c),
                note: "Install with npx shadcn@latest add @jds/nav-sidebar. Only props that differ from the defaults are included.",
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
