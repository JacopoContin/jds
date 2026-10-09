"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SidebarIcon } from "@/lib/icons"
import { duration, ease, spring } from "@/lib/motion"

type NavSidebarSide = "left" | "right"
/** docked: full height against the edge. floating: an inset, rounded card. inset: the page sits in a card beside it. */
type NavSidebarVariant = "docked" | "floating" | "inset"
/** icons: shrinks to a rail of icons. offcanvas: slides fully out. none: always open. */
type NavSidebarCollapse = "icons" | "offcanvas" | "none"
type NavSidebarSurface = "sidebar" | "background" | "glass"
/** How the current page's item stands out. */
type NavSidebarIndicator = "fill" | "bar" | "text"
type NavSidebarMotion = "spring" | "tween"

type LayoutContextValue = {
  /** Expanded on wide layouts. */
  open: boolean
  setOpen: (open: boolean) => void
  /** The layout is narrower than its breakpoint: the sidebar becomes an overlay. */
  narrow: boolean
  /** The layout's width in px, to keep the overlay from covering all of it. */
  layoutWidth: number
  /** The overlay is showing, on narrow layouts. */
  overlayOpen: boolean
  setOverlayOpen: (open: boolean) => void
  toggle: () => void
  shortcut: string | false
  /** The sidebar's collapse setting, so triggers know when they're needed. */
  collapse: NavSidebarCollapse
  setCollapse: (collapse: NavSidebarCollapse) => void
}

const LayoutContext = React.createContext<LayoutContextValue | null>(null)

/** Open state and controls, for building your own trigger. */
function useNavSidebar() {
  const ctx = React.useContext(LayoutContext)
  if (!ctx) throw new Error("NavSidebar parts must be used inside <NavSidebarLayout>")
  return ctx
}

type SidebarContextValue = {
  /** Shrunk to icons: labels hide and items show a tooltip instead. */
  rail: boolean
  side: NavSidebarSide
  indicator: NavSidebarIndicator
  density: "compact" | "comfortable"
  layoutId: string
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebarPart() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("NavSidebar items must be used inside <NavSidebar>")
  return ctx
}

/**
 * Holds the sidebar's open state and lays it out beside the page. Put it at the root of the
 * app shell with a height (h-dvh or h-full), then a NavSidebar and a NavSidebarInset inside.
 * Below `breakpoint` (the layout's own width, not the viewport's) the sidebar becomes an
 * overlay with a scrim. ⌘B or Ctrl+B toggles it.
 */
function NavSidebarLayout({
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  shortcut = "b",
  breakpoint = 768,
  className,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Key that toggles the sidebar with ⌘ or Ctrl. false turns it off. */
  shortcut?: string | false
  /** Layout width in px below which the sidebar becomes an overlay. */
  breakpoint?: number
  className?: string
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = controlledOpen ?? uncontrolledOpen
  const [layoutWidth, setLayoutWidth] = React.useState(0)
  const narrow = layoutWidth > 0 && layoutWidth < breakpoint
  const [overlayOpen, setOverlayOpen] = React.useState(false)
  const [collapse, setCollapse] = React.useState<NavSidebarCollapse>("icons")

  const setOpen = React.useCallback(
    (o: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(o)
      onOpenChange?.(o)
    },
    [controlledOpen, onOpenChange],
  )
  const toggle = React.useCallback(
    () => (narrow ? setOverlayOpen((o) => !o) : setOpen(!open)),
    [narrow, open, setOpen],
  )

  // Measure the layout itself, so it behaves the same in a full page and in a contained preview.
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setLayoutWidth(entry.contentRect.width)
      if (entry.contentRect.width >= breakpoint) setOverlayOpen(false)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [breakpoint])

  React.useEffect(() => {
    if (!shortcut) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== shortcut || !(e.metaKey || e.ctrlKey)) return
      if (collapse === "none" && !narrow) return
      if (e.target instanceof HTMLElement && e.target.isContentEditable) return
      e.preventDefault()
      toggle()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [shortcut, toggle, collapse, narrow])

  return (
    <LayoutContext.Provider value={{ open, setOpen, narrow, layoutWidth, overlayOpen, setOverlayOpen, toggle, shortcut, collapse, setCollapse }}>
      <div
        ref={ref}
        data-slot="nav-sidebar-layout"
        data-narrow={narrow || undefined}
        className={cn(
          "group/nav-layout relative isolate flex size-full overflow-hidden has-data-[nav-variant=inset]:bg-sidebar",
          className,
        )}
      >
        {children}
      </div>
    </LayoutContext.Provider>
  )
}

const surfaces: Record<NavSidebarSurface, string> = {
  sidebar: "bg-sidebar text-sidebar-foreground",
  background: "bg-background",
  glass: "bg-background/70 backdrop-blur-xl backdrop-saturate-150",
}

/** Gap around a floating sidebar, in px. */
const GAP = 8

/**
 * App navigation that can collapse. Collapsed, it shrinks to a rail of icons (with tooltips)
 * or slides out entirely; `expandOnHover` lets a collapsed rail peek open over the page while
 * the pointer is on it. Place it inside NavSidebarLayout, before or after the page; `side`
 * decides which edge it sits on.
 */
function NavSidebar({
  side = "left",
  variant = "docked",
  collapse = "icons",
  expandOnHover = false,
  surface = "sidebar",
  width = 256,
  railWidth = 56,
  indicator = "fill",
  density = "comfortable",
  motion: motionPreset = "spring",
  label = "Main",
  className,
  children,
}: {
  side?: NavSidebarSide
  variant?: NavSidebarVariant
  collapse?: NavSidebarCollapse
  /** With collapse="icons": hovering the rail opens it over the page until the pointer leaves. */
  expandOnHover?: boolean
  /** Ignored for inset, which always uses the sidebar color. */
  surface?: NavSidebarSurface
  /** Expanded width in px. */
  width?: number
  /** Collapsed width in px, with collapse="icons". */
  railWidth?: number
  indicator?: NavSidebarIndicator
  density?: "compact" | "comfortable"
  motion?: NavSidebarMotion
  /** Accessible name for the navigation landmark. */
  label?: string
  className?: string
  children: React.ReactNode
}) {
  const { open, narrow, layoutWidth, overlayOpen, setOverlayOpen, setCollapse } = useNavSidebar()
  React.useLayoutEffect(() => setCollapse(collapse), [collapse, setCollapse])
  const reduced = useReducedMotion()
  const layoutId = React.useId()
  const [peek, setPeek] = React.useState(false)
  const peekTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(peekTimer.current), [])

  const floating = variant === "floating"
  const gap = floating ? GAP : 0
  const expanded = collapse === "none" || open
  const canPeek = expandOnHover && collapse === "icons" && !expanded && !narrow
  const peeking = canPeek && peek
  const rail = !narrow && collapse === "icons" && !expanded && !peeking
  const hidden = narrow ? !overlayOpen : collapse === "offcanvas" && !expanded

  // The space the sidebar takes from the page. A peeking rail overlays instead of pushing.
  const reserved = narrow || hidden ? 0 : (expanded ? width : railWidth) + gap * 2
  // As an overlay, leave a strip of the page showing so it is clear how to get back.
  const panelWidth = rail ? railWidth : narrow ? Math.min(width, layoutWidth - gap * 2 - 48) : width
  const offscreen = (panelWidth + gap * 2) * (side === "left" ? -1 : 1)

  const transition: Transition = reduced
    ? { duration: 0 }
    : motionPreset === "spring"
      ? spring.gentle
      : { duration: duration.base, ease: ease.out }

  const schedulePeek = (next: boolean) => {
    clearTimeout(peekTimer.current)
    if (!canPeek && next) return
    // Open after a short pause so passing over the rail doesn't flash it; close a little slower.
    peekTimer.current = setTimeout(() => setPeek(next), next ? 120 : 220)
  }

  return (
    <SidebarContext.Provider value={{ rail, side, indicator, density, layoutId }}>
      <AnimatePresence>
        {narrow && overlayOpen && (
          <motion.div
            key="scrim"
            aria-hidden
            className="absolute inset-0 z-30 bg-foreground/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast }}
            onClick={() => setOverlayOpen(false)}
          />
        )}
      </AnimatePresence>
      <motion.div
        data-slot="nav-sidebar"
        data-nav-variant={variant}
        data-side={side}
        data-state={narrow ? (overlayOpen ? "overlay" : "hidden") : rail ? "rail" : hidden ? "hidden" : "expanded"}
        className={cn("relative z-40 shrink-0", side === "right" && "order-last")}
        initial={false}
        animate={{ width: reserved }}
        transition={transition}
      >
        <motion.nav
          aria-label={label}
          inert={hidden}
          onPointerEnter={() => schedulePeek(true)}
          onPointerLeave={() => schedulePeek(false)}
          className={cn(
            "group/nav-sidebar absolute flex flex-col overflow-hidden text-sm",
            variant === "inset" ? "bg-sidebar text-sidebar-foreground" : surfaces[surface],
            side === "left" ? "left-0" : "right-0",
            floating ? "inset-y-2 mx-2 rounded-xl border shadow-lg" : "inset-y-0",
            variant === "docked" && (side === "left" ? "border-r" : "border-l"),
            (peeking || narrow) && !floating && "shadow-xl",
            className,
          )}
          data-rail={rail || undefined}
          initial={false}
          animate={{ width: panelWidth, x: hidden ? offscreen : 0 }}
          transition={transition}
        >
          {children}
        </motion.nav>
      </motion.div>
    </SidebarContext.Provider>
  )
}

/** Top of the sidebar: a logo, workspace switcher or search. */
function NavSidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="nav-sidebar-header" className={cn("flex shrink-0 flex-col gap-1 p-2", className)} {...props} />
}

/** The scrolling middle, holding groups of items. */
function NavSidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="nav-sidebar-content"
      className={cn("flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto p-2", className)}
      {...props}
    />
  )
}

/** Bottom of the sidebar: the account, settings or an agent shortcut. */
function NavSidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="nav-sidebar-footer" className={cn("flex shrink-0 flex-col gap-1 p-2", className)} {...props} />
}

/** A labelled set of items. The label fades out on the rail but keeps its space, so icons don't jump. */
function NavSidebarGroup({
  label,
  className,
  children,
}: {
  label?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div data-slot="nav-sidebar-group" role="group" aria-label={label} className={cn("flex flex-col gap-0.5", className)}>
      {label && (
        <NavSidebarText className="flex h-7 items-center px-3 text-xs font-medium text-muted-foreground">
          {label}
        </NavSidebarText>
      )}
      {children}
    </div>
  )
}

/** Text that hides on the rail. Use it for anything custom you put in the header or footer. */
function NavSidebarText({ className, ...props }: React.ComponentProps<"span">) {
  const { rail } = useSidebarPart()
  return (
    <span
      data-slot="nav-sidebar-text"
      className={cn(
        "truncate whitespace-nowrap transition-opacity duration-150",
        rail && "pointer-events-none opacity-0",
        className,
      )}
      {...props}
    />
  )
}

/**
 * One destination. Renders a link with `href`, a button without, or your router's link via
 * `render` (e.g. `render={<Link href="/inbox" />}`). On the rail it shows only the icon, with
 * the label in a tooltip.
 */
function NavSidebarItem({
  icon,
  active = false,
  badge,
  href,
  render,
  className,
  children,
  ...props
}: Omit<useRender.ComponentProps<"a">, "children"> & {
  icon: React.ReactNode
  /** The current page. */
  active?: boolean
  /** A count or short tag at the end, e.g. unread messages. On the rail it shows as a dot. */
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  const { rail, side, indicator, density, layoutId } = useSidebarPart()
  const { narrow, setOverlayOpen } = useNavSidebar()
  const [tip, setTip] = React.useState(false)

  const content = useRender({
    render: render ?? (href ? <a href={href} /> : <button type="button" />),
    props: mergeProps<"a">(
      {
        "aria-current": active ? "page" : undefined,
        // On a narrow layout the sidebar is an overlay, so going somewhere should close it.
        onClick: () => narrow && setOverlayOpen(false),
        className: cn(
          "relative flex w-full shrink-0 items-center gap-3 rounded-md px-3 text-left whitespace-nowrap text-muted-foreground outline-none transition-colors",
          "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          "aria-[current=page]:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0",
          density === "compact" ? "h-8" : "h-9",
          indicator === "text" ? "aria-[current=page]:font-semibold" : "aria-[current=page]:font-medium",
          className,
        ),
        children: (
          <>
            {active && indicator !== "text" && (
              <motion.span
                aria-hidden
                layoutId={`${layoutId}-active`}
                transition={spring.snappy}
                className={cn(
                  "absolute",
                  indicator === "fill" && "inset-0 rounded-md bg-sidebar-accent",
                  indicator === "bar" && "inset-y-2 w-0.5 rounded-full bg-sidebar-primary",
                  indicator === "bar" && (side === "left" ? "-left-2" : "-right-2"),
                )}
              />
            )}
            <span className="relative flex">{icon}</span>
            <NavSidebarText className="relative flex-1">{children}</NavSidebarText>
            {badge != null && (
              <>
                <NavSidebarText className="relative text-xs text-muted-foreground tabular-nums">{badge}</NavSidebarText>
                {rail && <span aria-hidden className="absolute top-1.5 left-7 size-1.5 rounded-full bg-sidebar-primary" />}
              </>
            )}
          </>
        ),
      },
      props,
    ),
    state: { slot: "nav-sidebar-item" },
  })

  return (
    <Tooltip open={rail && tip} onOpenChange={setTip}>
      <TooltipTrigger render={content} />
      <TooltipContent side={side === "left" ? "right" : "left"}>
        {children}
        {badge != null && <span className="opacity-60">{badge}</span>}
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * Opens and collapses the sidebar. Put it in the page's header, or in the sidebar's own header.
 * A trigger inside the sidebar can't bring back a sidebar that's out of view, so when yours
 * lives in the sidebar, also put one in the page header with `onlyWhenHidden`.
 * It renders nothing when it has nothing to do (collapse="none" on a wide layout).
 */
function NavSidebarTrigger({
  onlyWhenHidden = false,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  /** Render only while the sidebar is out of view: on narrow layouts, or collapsed off-canvas. */
  onlyWhenHidden?: boolean
}) {
  const { toggle, open, narrow, overlayOpen, shortcut, collapse } = useNavSidebar()
  const expanded = narrow ? overlayOpen : open
  const outOfView = narrow || (collapse === "offcanvas" && !open)
  if (!narrow && collapse === "none") return null
  if (onlyWhenHidden && !outOfView) return null
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            data-slot="nav-sidebar-trigger"
            variant="ghost"
            size="icon-sm"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={expanded}
            onClick={toggle}
            className={className}
            {...props}
          >
            <SidebarIcon />
          </Button>
        }
      />
      <TooltipContent side="bottom">
        {expanded ? "Collapse sidebar" : "Expand sidebar"}
        {shortcut && <Kbd>⌘{shortcut.toUpperCase()}</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

/** The page beside the sidebar. With variant="inset" it becomes a rounded card on the sidebar color. */
function NavSidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="nav-sidebar-inset"
      className={cn(
        "relative flex min-w-0 flex-1 flex-col overflow-auto bg-background",
        "group-has-data-[nav-variant=inset]/nav-layout:m-2 group-has-data-[nav-variant=inset]/nav-layout:rounded-xl group-has-data-[nav-variant=inset]/nav-layout:border group-has-data-[nav-variant=inset]/nav-layout:shadow-sm",
        className,
      )}
      {...props}
    />
  )
}

export {
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
  useNavSidebar,
  type NavSidebarCollapse,
  type NavSidebarIndicator,
  type NavSidebarMotion,
  type NavSidebarSide,
  type NavSidebarSurface,
  type NavSidebarVariant,
}
