"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "@/lib/icons"
import { duration, ease } from "@/lib/motion"

type BranchContextValue = {
  index: number
  count: number
  setIndex: (i: number) => void
  direction: 1 | -1
}

const BranchContext = React.createContext<BranchContextValue | null>(null)

function useBranch() {
  const ctx = React.useContext(BranchContext)
  if (!ctx) throw new Error("Branch parts must be used inside <Branch>")
  return ctx
}

/**
 * Versions of one response, e.g. after regenerating. Holds which version is showing.
 * Put the versions in <BranchContent> and the arrows in <BranchSelector>.
 * New versions appended to `count` are selected automatically.
 */
function Branch({
  count,
  index: controlled,
  onIndexChange,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** Number of versions. */
  count: number
  index?: number
  onIndexChange?: (index: number) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(count - 1)
  const [prevCount, setPrevCount] = React.useState(count)
  const [direction, setDirection] = React.useState<1 | -1>(1)
  const index = controlled ?? uncontrolled

  // Jump to a newly added version, as chat apps do after "Regenerate".
  if (count !== prevCount) {
    setPrevCount(count)
    if (count > prevCount && controlled === undefined) {
      setDirection(1)
      setUncontrolled(count - 1)
    }
  }

  const setIndex = React.useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(count - 1, i))
      setDirection(next >= index ? 1 : -1)
      if (controlled === undefined) setUncontrolled(next)
      onIndexChange?.(next)
    },
    [count, index, controlled, onIndexChange]
  )

  return (
    <BranchContext.Provider value={{ index, count, setIndex, direction }}>
      <div data-slot="branch" className={cn("flex flex-col gap-2", className)} {...props} />
    </BranchContext.Provider>
  )
}

/** Renders only the active version. Children are the versions, in order. */
function BranchContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { index, direction } = useBranch()
  const versions = React.Children.toArray(children)
  return (
    <div data-slot="branch-content" className={cn("relative", className)}>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          initial={{ opacity: 0, x: direction * 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -12 }}
          transition={{ duration: duration.base, ease: ease.out }}
        >
          {versions[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/** "‹ 2 / 3 ›". Hidden when there's only one version. */
function BranchSelector({ className, ...props }: React.ComponentProps<"div">) {
  const { index, count, setIndex } = useBranch()
  if (count < 2) return null
  return (
    <div
      data-slot="branch-selector"
      role="group"
      aria-label="Response versions"
      className={cn("flex items-center gap-0.5 text-xs text-muted-foreground", className)}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Previous version"
        disabled={index === 0}
        onClick={() => setIndex(index - 1)}
      >
        <ChevronLeftIcon />
      </Button>
      <span className="min-w-8 text-center font-mono tabular-nums" aria-live="polite">
        {index + 1} / {count}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Next version"
        disabled={index === count - 1}
        onClick={() => setIndex(index + 1)}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  )
}

export { Branch, BranchContent, BranchSelector, useBranch }
