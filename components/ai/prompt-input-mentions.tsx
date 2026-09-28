"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { usePromptInput } from "@/components/ai/prompt-input"
import { AgentIcon, CloseIcon, FileIcon, FolderIcon, ToolIcon } from "@/lib/icons"
import { duration, ease, spring } from "@/lib/motion"

type MentionType = "file" | "folder" | "tool" | "agent"

type Mention = { id: string; label: string; type: MentionType; description?: string }

const typeIcon: Record<MentionType, React.ReactNode> = {
  file: <FileIcon />,
  folder: <FolderIcon />,
  tool: <ToolIcon />,
  agent: <AgentIcon />,
}

const MAX_RESULTS = 6

/**
 * @-mentions for <PromptInput>. Type "@" to search `items`; arrows move, Enter or Tab
 * picks, Escape dismisses. Picked items show as chips and are reported through
 * `onMentionsChange` so they can be sent with the message. Clears after submit.
 */
function PromptInputMentions({
  items,
  onMentionsChange,
  className,
}: {
  items: Mention[]
  onMentionsChange?: (mentions: Mention[]) => void
  className?: string
}) {
  const { value, setValue, textareaRef, registerKeyHandler } = usePromptInput()
  const [selected, setSelected] = React.useState<Mention[]>([])
  const [match, setMatch] = React.useState<{ start: number; query: string } | null>(null)
  const [active, setActive] = React.useState(0)
  const [dismissedAt, setDismissedAt] = React.useState<number | null>(null)

  const results = React.useMemo(() => {
    if (!match) return []
    const q = match.query.toLowerCase()
    return items.filter((i) => !selected.some((s) => s.id === i.id) && i.label.toLowerCase().includes(q)).slice(0, MAX_RESULTS)
  }, [items, match, selected])

  const open = !!match && match.start !== dismissedAt && results.length > 0

  // Find an "@query" run ending at the caret.
  const detect = React.useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    const caret = el.selectionStart ?? 0
    const found = el.value.slice(0, caret).match(/(^|\s)@([\w.-]*)$/)
    const next = found ? { start: caret - found[2].length - 1, query: found[2] } : null
    // Keep the same object when nothing changed, so arrow-key selection survives keyup.
    setMatch((prev) => (prev?.start === next?.start && prev?.query === next?.query ? prev : next))
  }, [textareaRef])

  // New query, new results: start from the top.
  const [prevMatch, setPrevMatch] = React.useState(match)
  if (match !== prevMatch) {
    setPrevMatch(match)
    setActive(0)
  }

  React.useEffect(() => {
    queueMicrotask(detect)
  }, [value, detect])

  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.addEventListener("click", detect)
    el.addEventListener("keyup", detect)
    return () => {
      el.removeEventListener("click", detect)
      el.removeEventListener("keyup", detect)
    }
  }, [textareaRef, detect])

  const update = React.useCallback(
    (next: Mention[]) => {
      setSelected(next)
      onMentionsChange?.(next)
    },
    [onMentionsChange]
  )

  // Submitting clears the text; clear the chips with it.
  const [prevValue, setPrevValue] = React.useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    if (value === "" && selected.length > 0) {
      setSelected([])
      onMentionsChange?.([])
    }
  }

  const pick = React.useCallback(
    (item: Mention) => {
      const el = textareaRef.current
      if (!el || !match) return
      const caret = el.selectionStart ?? value.length
      const insert = `@${item.label} `
      const next = value.slice(0, match.start) + insert + value.slice(caret)
      setValue(next)
      update([...selected, item])
      setMatch(null)
      const pos = match.start + insert.length
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(pos, pos)
      })
    },
    [textareaRef, match, value, setValue, update, selected]
  )

  const remove = (item: Mention) => {
    update(selected.filter((s) => s.id !== item.id))
    setValue(value.replace(`@${item.label} `, "").replace(`@${item.label}`, ""))
  }

  React.useEffect(
    () =>
      registerKeyHandler((e) => {
        if (!open) return false
        if (e.key === "ArrowDown") setActive((a) => (a + 1) % results.length)
        else if (e.key === "ArrowUp") setActive((a) => (a - 1 + results.length) % results.length)
        else if (e.key === "Enter" || e.key === "Tab") pick(results[active])
        else if (e.key === "Escape") setDismissedAt(match?.start ?? null)
        else return false
        return true
      }),
    [registerKeyHandler, open, results, active, pick, match]
  )

  return (
    <>
      {selected.length > 0 && (
        <div data-slot="prompt-input-mentions" className={cn("flex flex-wrap gap-1.5 px-3 pt-3", className)}>
          <AnimatePresence initial={false}>
            {selected.map((m) => (
              <motion.span
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={spring.snappy}
                className="inline-flex h-6 items-center gap-1 rounded-md border bg-muted/50 pr-0.5 pl-1.5 text-xs [&>svg]:size-3 [&>svg]:text-muted-foreground"
              >
                {typeIcon[m.type]}
                {m.label}
                <button
                  type="button"
                  aria-label={`Remove ${m.label}`}
                  onClick={() => remove(m)}
                  className="grid size-4 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <CloseIcon className="size-2.5" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Mention"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: duration.fast, ease: ease.out }}
            className="absolute bottom-full left-2 z-50 mb-2 w-72 overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
          >
            {results.map((item, i) => (
              <div
                key={item.id}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  pick(item)
                }}
                className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground"
              >
                {typeIcon[item.type]}
                <span className="truncate">{item.label}</span>
                {item.description && (
                  <span className="ml-auto truncate text-xs text-muted-foreground">{item.description}</span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export { PromptInputMentions, type Mention, type MentionType }
