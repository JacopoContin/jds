import * as React from "react"
import { cn } from "cn"

/** Text with a light sweep, for "Thinking…" and other in-progress labels. */
function Shimmer({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="shimmer"
      className={cn(
        "inline-block animate-shimmer bg-[linear-gradient(90deg,var(--muted-foreground)_0%,var(--muted-foreground)_40%,var(--foreground)_50%,var(--muted-foreground)_60%,var(--muted-foreground)_100%)] bg-size-[200%_100%] bg-clip-text text-transparent motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

/** Three softly pulsing dots, for the gap before the first token. */
function TypingIndicator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="typing-indicator"
      role="status"
      aria-label="Assistant is typing"
      className={cn("inline-flex items-center gap-1 py-2", className)}
      {...props}
    >
      <span className="size-1.5 animate-pulse-soft rounded-full bg-foreground motion-reduce:animate-none" />
      <span className="size-1.5 animate-pulse-soft rounded-full bg-foreground [animation-delay:150ms] motion-reduce:animate-none" />
      <span className="size-1.5 animate-pulse-soft rounded-full bg-foreground [animation-delay:300ms] motion-reduce:animate-none" />
    </span>
  )
}

export { Shimmer, TypingIndicator }
