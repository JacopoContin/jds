"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "motion/react"
import { cn } from "cn"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { rise } from "@/lib/motion"

type MessageRole = "user" | "assistant" | "system"

/**
 * How messages look across a conversation. Set it once on <Conversation> (or with
 * <MessageStyleProvider>); every Message inside follows. Defaults are the classic chat look:
 * the user in a bubble with a tail corner, the assistant as plain text.
 */
type MessageStyle = {
  /** Who gets a bubble. */
  bubbles?: "user" | "all" | "none"
  /** Bubble corners: a tail toward the speaker, fully round, or squarer. */
  shape?: "tail" | "round" | "square"
  density?: "comfortable" | "compact"
}

const MessageStyleContext = React.createContext<Required<MessageStyle>>({
  bubbles: "user",
  shape: "tail",
  density: "comfortable",
})

function MessageStyleProvider({ children, ...style }: MessageStyle & { children: React.ReactNode }) {
  const parent = React.useContext(MessageStyleContext)
  const { bubbles = parent.bubbles, shape = parent.shape, density = parent.density } = style
  const value = React.useMemo(() => ({ bubbles, shape, density }), [bubbles, shape, density])
  return <MessageStyleContext.Provider value={value}>{children}</MessageStyleContext.Provider>
}

const useMessageStyle = () => React.useContext(MessageStyleContext)

const MessageContext = React.createContext<{ from: MessageRole }>({ from: "assistant" })

const corners = {
  tail: { user: "rounded-2xl rounded-tr-md", assistant: "rounded-2xl rounded-tl-md" },
  round: { user: "rounded-2xl", assistant: "rounded-2xl" },
  square: { user: "rounded-lg", assistant: "rounded-lg" },
}

function Message({
  from,
  className,
  ...props
}: HTMLMotionProps<"div"> & { from: MessageRole }) {
  return (
    <MessageContext.Provider value={{ from }}>
      <motion.div
        data-slot="message"
        data-from={from}
        variants={rise}
        initial="hidden"
        animate="visible"
        className={cn(
          "group/message flex w-full gap-3",
          from === "user" ? "flex-row-reverse" : "flex-row",
          className
        )}
        {...props}
      />
    </MessageContext.Provider>
  )
}

function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  const { from } = React.useContext(MessageContext)
  const { bubbles, shape, density } = useMessageStyle()
  const user = from === "user"
  const bubble = bubbles === "all" || (bubbles === "user" && user)
  return (
    <div
      data-slot="message-content"
      data-bubble={bubble || undefined}
      className={cn(
        "flex min-w-0 flex-col gap-3 text-sm leading-relaxed *:shrink-0",
        user ? "max-w-[80%]" : bubble ? "max-w-[85%]" : "flex-1",
        bubble && corners[shape][user ? "user" : "assistant"],
        bubble && (density === "compact" ? "px-3 py-2" : "px-4 py-2.5"),
        bubble ? (user ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground") : "text-foreground",
        className
      )}
      {...props}
    />
  )
}

function MessageAvatar({
  src,
  name,
  className,
  ...props
}: React.ComponentProps<typeof Avatar> & { src?: string; name: string }) {
  return (
    <Avatar data-slot="message-avatar" className={cn("size-6 ring-1 ring-border", className)} {...props}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="text-[10px]">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

/** Row of actions under a message (copy, regenerate, feedback). Revealed on hover; always shown on touch. */
function MessageActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-actions"
      className={cn(
        "-ml-1.5 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover/message:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function MessageAction({
  label,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            className={cn("text-muted-foreground hover:text-foreground", className)}
            {...props}
          />
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export {
  Message,
  MessageContent,
  MessageAvatar,
  MessageActions,
  MessageAction,
  MessageStyleProvider,
  useMessageStyle,
  type MessageRole,
  type MessageStyle,
}
