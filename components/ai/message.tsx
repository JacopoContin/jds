"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "motion/react"
import { cn } from "cn"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { rise } from "@/lib/motion"

type MessageRole = "user" | "assistant" | "system"

const MessageContext = React.createContext<{ from: MessageRole }>({ from: "assistant" })

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
  return (
    <div
      data-slot="message-content"
      className={cn(
        "flex min-w-0 flex-col gap-3 text-sm leading-relaxed *:shrink-0",
        from === "user"
          ? "max-w-[80%] rounded-2xl rounded-tr-md bg-secondary px-4 py-2.5 text-secondary-foreground"
          : "flex-1 text-foreground",
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
    <Avatar data-slot="message-avatar" className={cn("mt-0.5 size-7 ring-1 ring-border", className)} {...props}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="text-xs">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

/** Hover-revealed row of actions under a message (copy, regenerate, feedback). */
function MessageActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-actions"
      className={cn(
        "-ml-1.5 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover/message:opacity-100 focus-within:opacity-100",
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

export { Message, MessageContent, MessageAvatar, MessageActions, MessageAction, type MessageRole }
