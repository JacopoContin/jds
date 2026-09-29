"use client"

import * as React from "react"
import { cn } from "cn"

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { SparkleIcon } from "@/lib/icons"

type CommandBarContextValue = {
  query: string
  setQuery: (query: string) => void
  /** The question being answered, or null while browsing commands. */
  question: string | null
  ask: (question: string) => void
  back: () => void
}

const CommandBarContext = React.createContext<CommandBarContextValue | null>(null)

function useCommandBar() {
  const ctx = React.useContext(CommandBarContext)
  if (!ctx) throw new Error("CommandBar parts must be used inside <CommandBar>")
  return ctx
}

/**
 * A command palette that also asks the agent. Typing filters commands as usual; the
 * <CommandBarAsk> row turns the same text into a question. Place it before your groups and
 * Enter asks; after them and Enter runs the best-matching command. While answering,
 * <CommandBarAnswer> replaces the list and Escape goes back to it.
 */
function CommandBar({
  onAsk,
  onBack,
  className,
  children,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof Command> & {
  /** Called with the question when someone asks. Stream your answer into <CommandBarAnswer>. */
  onAsk?: (question: string) => void
  /** Called when leaving the answer to browse commands again. */
  onBack?: () => void
}) {
  const [query, setQuery] = React.useState("")
  const [question, setQuestion] = React.useState<string | null>(null)
  const value = React.useMemo<CommandBarContextValue>(
    () => ({
      query,
      setQuery,
      question,
      ask: (q) => {
        if (!q.trim()) return
        setQuestion(q.trim())
        onAsk?.(q.trim())
      },
      back: () => {
        setQuestion(null)
        onBack?.()
      },
    }),
    [query, question, onAsk, onBack],
  )

  return (
    <CommandBarContext.Provider value={value}>
      <Command
        data-slot="command-bar"
        data-asking={question !== null || undefined}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          // Escape backs out of an answer before it closes anything around the bar.
          if (e.key === "Escape" && question !== null) {
            e.preventDefault()
            e.stopPropagation()
            value.back()
          }
        }}
        // h-auto: size to content; the base command fills its container, which suits a dialog but not a bar.
        className={cn("h-auto rounded-xl! border shadow-2xl", className)}
        {...props}
      >
        {children}
      </Command>
    </CommandBarContext.Provider>
  )
}

function CommandBarInput({
  placeholder = "Search or ask anything…",
  ...props
}: Omit<React.ComponentProps<typeof CommandInput>, "value" | "onValueChange">) {
  const { query, setQuery, question, back } = useCommandBar()
  return (
    <CommandInput
      value={query}
      onValueChange={(v) => {
        setQuery(v)
        // Editing the text after asking returns to the list, so it can become a new search or question.
        if (question !== null) back()
      }}
      placeholder={placeholder}
      {...props}
    />
  )
}

/** The list of commands. Hidden, not unmounted, while an answer shows, so commands stay registered. */
function CommandBarList(props: React.ComponentProps<typeof CommandList>) {
  const { question } = useCommandBar()
  return <CommandList data-slot="command-bar-list" hidden={question !== null} {...props} />
}

/**
 * "Ask AI" row: shows once something is typed and always matches, since its value contains
 * the query. It sits in its own group, and cmdk keeps groups in the order you write them, so
 * placing it before your groups makes Enter ask and placing it after makes Enter run the
 * best-matching command.
 */
function CommandBarAsk({ label = "Ask AI", className }: { label?: string; className?: string }) {
  const { query, ask } = useCommandBar()
  if (!query.trim()) return null
  return (
    <CommandGroup data-slot="command-bar-ask">
      <CommandItem value={`ask ${query}`} onSelect={() => ask(query)} className={className}>
        <SparkleIcon />
        <span className="min-w-0 truncate">
          {label}: <span className="text-muted-foreground">&ldquo;{query.trim()}&rdquo;</span>
        </span>
        <CommandShortcut>↵</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  )
}

/** The agent's answer, shown in place of the list after asking. `actions` sits under it. */
function CommandBarAnswer({
  actions,
  className,
  children,
}: {
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const { question } = useCommandBar()
  if (question === null) return null
  return (
    <div
      data-slot="command-bar-answer"
      aria-live="polite"
      className={cn("flex max-h-96 flex-col gap-3 overflow-y-auto px-3 pt-3 pb-2", className)}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <SparkleIcon className="size-3.5 shrink-0" />
        <span className="truncate">{question}</span>
      </div>
      <div className="text-sm">{children}</div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Keyboard hints along the bottom. Adapts to answer mode; `children` adds more on the right. */
function CommandBarFooter({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { question } = useCommandBar()
  return (
    <div
      data-slot="command-bar-footer"
      className={cn(
        "mt-1 flex items-center gap-3 border-t px-3 pt-2 pb-1 text-xs text-muted-foreground [&_kbd]:mr-1",
        className,
      )}
    >
      {question === null ? (
        <>
          <span>
            <Kbd>↑↓</Kbd>navigate
          </span>
          <span>
            <Kbd>↵</Kbd>select
          </span>
        </>
      ) : (
        <span>
          <Kbd>esc</Kbd>back to commands
        </span>
      )}
      <span className="ml-auto flex items-center gap-3">{children}</span>
    </div>
  )
}

/**
 * The bar in a dialog that opens with ⌘K (Ctrl+K elsewhere). Controlled with `open`, or
 * self-managed when left out.
 */
function CommandBarDialog({
  open: controlled,
  onOpenChange,
  hotkey = "k",
  title = "Command bar",
  className,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** The letter that toggles it with ⌘ or Ctrl. Set to false to turn the shortcut off. */
  hotkey?: string | false
  title?: string
  className?: string
  children: React.ReactNode
}) {
  const [uncontrolled, setUncontrolled] = React.useState(false)
  const open = controlled ?? uncontrolled
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlled === undefined) setUncontrolled(next)
      onOpenChange?.(next)
    },
    [controlled, onOpenChange],
  )

  React.useEffect(() => {
    if (!hotkey) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === hotkey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hotkey, open, setOpen])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Search commands or ask the agent.</DialogDescription>
      </DialogHeader>
      <DialogContent
        showCloseButton={false}
        className={cn("top-1/4 translate-y-0 overflow-hidden rounded-xl! p-0 sm:max-w-xl", className)}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

export {
  CommandBar,
  CommandBarAnswer,
  CommandBarAsk,
  CommandBarDialog,
  CommandBarFooter,
  CommandBarInput,
  CommandBarList,
  useCommandBar,
}
