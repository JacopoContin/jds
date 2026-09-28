"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { useStickToBottom } from "@/hooks/use-stick-to-bottom"
import { ScrollDownIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

type ConversationContextValue = {
  contentRef: React.RefObject<HTMLDivElement | null>
  isAtBottom: boolean
  scrollToBottom: (behavior?: ScrollBehavior) => void
}

const ConversationContext = React.createContext<ConversationContextValue | null>(null)

function useConversation() {
  const ctx = React.useContext(ConversationContext)
  if (!ctx) throw new Error("Conversation parts must be used inside <Conversation>")
  return ctx
}

function Conversation({ className, children, ...props }: React.ComponentProps<"div">) {
  const { scrollRef, contentRef, isAtBottom, scrollToBottom } = useStickToBottom()
  const value = React.useMemo(
    () => ({ contentRef, isAtBottom, scrollToBottom }),
    [contentRef, isAtBottom, scrollToBottom]
  )
  return (
    <ConversationContext.Provider value={value}>
      <div data-slot="conversation" className={cn("relative flex min-h-0 flex-1 flex-col", className)} {...props}>
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
        >
          {children}
        </div>
      </div>
    </ConversationContext.Provider>
  )
}

function ConversationContent({ className, ...props }: React.ComponentProps<"div">) {
  const { contentRef } = useConversation()
  return (
    <div
      ref={contentRef}
      data-slot="conversation-content"
      className={cn("mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6", className)}
      {...props}
    />
  )
}

function ConversationScrollButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { isAtBottom, scrollToBottom } = useConversation()
  return (
    <AnimatePresence>
      {!isAtBottom && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={spring.snappy}
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Scroll to latest"
            className={cn("rounded-full bg-popover shadow-md", className)}
            onClick={() => scrollToBottom()}
            {...props}
          >
            <ScrollDownIcon />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ConversationEmpty({
  className,
  title = "Start a conversation",
  description,
  icon,
  children,
  ...props
}: React.ComponentProps<"div"> & { title?: string; description?: string; icon?: React.ReactNode }) {
  return (
    <div
      data-slot="conversation-empty"
      className={cn("flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center", className)}
      {...props}
    >
      {icon && <div className="text-muted-foreground [&_svg]:size-6">{icon}</div>}
      <div className="space-y-1">
        <h3 className="font-heading text-2xl">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export { Conversation, ConversationContent, ConversationScrollButton, ConversationEmpty, useConversation }
